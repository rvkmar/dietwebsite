/**
 * dietchennai-visitor-counter
 *
 * Serves a single public number -- the site's running total visit count --
 * without ever exposing the Cloudflare API token that produces it.
 *
 * Why this exists: Cloudflare's own traffic data (the site's DNS/CDN
 * provider) is the most accurate source for a "total visitors" figure, but
 * it is only reachable through the GraphQL Analytics API, which requires a
 * secret API token. That token can never be shipped to a static site's
 * client-side code -- anyone viewing the page source could lift it. This
 * Worker is the small trusted backend that holds the token (as a Worker
 * secret, never committed to the repo) and hands the public site nothing
 * but a plain number.
 *
 * Design notes:
 *  - Cloudflare's GraphQL Analytics API only ever answers for a bounded
 *    historical window (how far back varies by plan and isn't guaranteed
 *    long-term), so this Worker does NOT try to reconstruct "all visits
 *    since the site launched" in one query -- there is no reliable way to
 *    get that figure retroactively, and fabricating one would violate the
 *    site's own accuracy standards. Instead it keeps its own running total
 *    in Workers KV, and on every scheduled run adds only the days it
 *    hasn't already counted. The count starts from whenever this Worker
 *    is first deployed and begins accumulating.
 *  - The scheduled run is idempotent and gap-safe: it tracks the last
 *    counted date in KV and sums every day between that date and
 *    yesterday (today's data is usually still incomplete), so a missed or
 *    doubled cron run never double-counts or drops a day.
 *  - "Visits" here is Cloudflare's `sum.visits` metric from the
 *    httpRequests1dGroups dataset -- its own approximation of unique
 *    visits per day, the closest available match to "visitor count".
 */

const KV_TOTAL_KEY = "total_visits";
const KV_LAST_DATE_KEY = "last_counted_date"; // YYYY-MM-DD, inclusive

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDateStr, days) {
  const d = new Date(isoDateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/**
 * Queries Cloudflare's GraphQL Analytics API for the sum of daily visits
 * for the zone, for every day from `sinceDateExclusive` (exclusive) through
 * yesterday (inclusive). Returns { addedVisits, newLastDate } where
 * newLastDate is the last day actually covered by the query (yesterday),
 * or null if there is nothing new to count yet.
 */
async function fetchVisitsSince(env, sinceDateExclusive) {
  const today = isoDate(new Date());
  const yesterday = addDays(today, -1);
  const rangeStart = addDays(sinceDateExclusive, 1);

  if (rangeStart > yesterday) {
    // Nothing new to count yet (e.g. the Worker already ran today).
    return { addedVisits: 0, newLastDate: sinceDateExclusive };
  }

  const query = `
    query VisitorCount($zoneTag: String!, $since: Date!, $until: Date!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 100
            filter: { date_geq: $since, date_leq: $until }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { visits }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        zoneTag: env.CF_ZONE_ID,
        since: rangeStart,
        until: yesterday,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Cloudflare GraphQL API HTTP ${res.status}`);
  }

  const body = await res.json();
  if (body.errors && body.errors.length) {
    throw new Error(`Cloudflare GraphQL API error: ${JSON.stringify(body.errors)}`);
  }

  const groups = body?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
  let addedVisits = 0;
  let latestDateSeen = sinceDateExclusive;
  for (const g of groups) {
    addedVisits += g?.sum?.visits || 0;
    if (g?.dimensions?.date && g.dimensions.date > latestDateSeen) {
      latestDateSeen = g.dimensions.date;
    }
  }

  // Even if Cloudflare returned zero groups (e.g. a brand-new zone with no
  // traffic yet), advance the watermark to yesterday so we don't re-query
  // the same empty window forever.
  return {
    addedVisits,
    newLastDate: groups.length ? latestDateSeen : yesterday,
  };
}

async function runScheduledUpdate(env) {
  const [storedTotal, storedLastDate] = await Promise.all([
    env.VISITOR_KV.get(KV_TOTAL_KEY),
    env.VISITOR_KV.get(KV_LAST_DATE_KEY),
  ]);

  const currentTotal = storedTotal ? parseInt(storedTotal, 10) : 0;
  // First-ever run: start counting from yesterday, i.e. don't try to
  // backfill history we can't verify.
  const lastCountedDate = storedLastDate || addDays(isoDate(new Date()), -2);

  const { addedVisits, newLastDate } = await fetchVisitsSince(env, lastCountedDate);
  const newTotal = currentTotal + addedVisits;

  await Promise.all([
    env.VISITOR_KV.put(KV_TOTAL_KEY, String(newTotal)),
    env.VISITOR_KV.put(KV_LAST_DATE_KEY, newLastDate),
  ]);

  return { newTotal, newLastDate, addedVisits };
}

function corsHeaders(env, request) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const origin = request.headers.get("Origin");
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=300",
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/api/visitor-count") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const [storedTotal, storedLastDate] = await Promise.all([
        env.VISITOR_KV.get(KV_TOTAL_KEY),
        env.VISITOR_KV.get(KV_LAST_DATE_KEY),
      ]);
      const total = storedTotal ? parseInt(storedTotal, 10) : 0;
      return new Response(
        JSON.stringify({ total, asOf: storedLastDate || null }),
        { headers: corsHeaders(env, request) }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: "unavailable" }), {
        status: 503,
        headers: corsHeaders(env, request),
      });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      runScheduledUpdate(env).catch((err) => {
        console.error("visitor-counter scheduled update failed:", err);
      })
    );
  },
};
