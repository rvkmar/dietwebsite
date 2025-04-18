// Function to update content based on selected language
function updateContent(langData) {
  // Safe check for overflow button
  const overflowButton = document.getElementById("btn-more-toggle");
  if (overflowButton) {
    overflowButton.setAttribute('data-i18n', 'more');
  }

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = langData[key] || ''; // Fallback to empty string if key not found

    const tag = element.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea' || tag === 'button') {
      element.value = value;
    } else {
      element.textContent = value;
    }
  });
}

// Store selected language
function setLanguagePreference(lang) {
  localStorage.setItem('language', lang);
}

// Fetch language JSON
// async function fetchLanguageData(lang) {
//   let basePath = window.location.pathname.includes('dietchennai.org') ? 'https://dietchennai.org/' : '/';
//   const response = await fetch(basePath + `languages/${lang}.json?v=${Date.now()}`); // Cache-busting with timestamp
//   if (!response.ok) {
//     console.error('Error fetching language data:', response.statusText);
//     return {}; // Return empty object on error
//   }
//   return response.json();
// }

// Version 2 of fetchLanguageData function
async function fetchLanguageData(lang) {
  let basePath = window.location.pathname.includes('dietchennai.org') ? 'https://dietchennai.org/' : '/';
  try {
    const response = await fetch(basePath + `lang/${lang}.json?v=${Date.now()}`);
    if (!response.ok) {
      console.error('Error fetching language data:', response.statusText);
      return {}; // Return empty object on error
    }
    return response.json();
  } catch (error) {
    // Handle fetch cancellation or network failure
    console.warn('Fetch was interrupted or failed:', error.message || error);
    return {}; // Return empty object to prevent crash
  }
}

// Handle language switch
async function changeLanguage(lang) {
  setLanguagePreference(lang);

  const contentContainer = document.body;
  contentContainer.classList.add('fade-out');

  const langData = await fetchLanguageData(lang);

  setTimeout(() => {
    updateContent(langData);
    toggleTamilStylesheet(lang);
    toggleTamilBodyClass(lang);
    contentContainer.classList.remove('fade-out');
  }, 200);
}

// Toggle Tamil-specific stylesheet
function toggleTamilStylesheet(lang) {
  const head = document.querySelector('head');
  const existingLink = document.querySelector('#styles-link');

  if (existingLink) {
    head.removeChild(existingLink);
  }

  if (lang === 'ta') {
    const newLink = document.createElement('link');
    newLink.id = 'styles-link';
    newLink.rel = 'stylesheet';
    newLink.href = './css/tamil.css';
    head.appendChild(newLink);
  }
}

// Toggle Tamil-specific class on <body>
function toggleTamilBodyClass(lang) {
  if (lang === 'ta') {
    document.body.classList.add('tamil-body');
  } else {
    document.body.classList.remove('tamil-body');
  }
}

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  const langToggle = document.getElementById('langToggle');
  const userPreferredLanguage = localStorage.getItem('language') || 'en';

  if (userPreferredLanguage === 'ta') {
    langToggle.checked = true;
  }

  const langData = await fetchLanguageData(userPreferredLanguage);
  updateContent(langData);
  toggleTamilStylesheet(userPreferredLanguage);
  toggleTamilBodyClass(userPreferredLanguage);

  // Add event listeners for mobile and desktop interactions
  ['touchstart', 'touchend', 'change', 'click'].forEach(event => {
    langToggle.addEventListener(event, () => {
      const selectedLang = langToggle.checked ? 'ta' : 'en';
      changeLanguage(selectedLang);
    });
  });
});
