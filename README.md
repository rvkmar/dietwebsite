# website
www.dietchennai.org

Static site built with [Eleventy](https://www.11ty.dev/), content
editable via [Decap CMS](https://decapcms.org/) at `/admin`. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it's put
together, how the build/deploy pipeline works, and how to make a
change.

```
npm ci
npx eleventy --serve   # local dev server with live reload
npx eleventy            # one-off build to _site/
```
