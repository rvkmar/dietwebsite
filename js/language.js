// // language toggle
//   document.getElementById('langToggle').addEventListener('change', function () {
//     if (this.checked) {
//       // Tamil selected
//       window.location.href = "/ta"; // or trigger Tamil content
//     } else {
//       // English selected
//       window.location.href = "/en"; // or trigger English content
//     }
//   });

// version2
// function to update content based on selected language
  // Update visible content with i18n values
  function updateContent(langData) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = langData[key];
    });
  }

  // Store selected language
  function setLanguagePreference(lang) {
    localStorage.setItem('language', lang);
  }

  // Fetch language JSON
  async function fetchLanguageData(lang) {
    const response = await fetch(`languages/${lang}.json`);
    return response.json();
  }

  // Handle language switch
  async function changeLanguage(lang) {
    setLanguagePreference(lang);

    const langData = await fetchLanguageData(lang);
    updateContent(langData);
    toggleTamilStylesheet(lang);
    toggleTamilBodyClass(lang); // ✅ add this line
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
      newLink.href = './assets/css/tamil.css';
      head.appendChild(newLink);
    }
  }

  // ✅ Toggle Tamil-specific class on <body>
  function toggleTamilBodyClass(lang) {
    if (lang === 'ta') {
      document.body.classList.add('tamil-body');
    } else {
      document.body.classList.remove('tamil-body');
    }
  }

  // On page load: apply language preference
  document.addEventListener('DOMContentLoaded', async () => {
    const langToggle = document.getElementById('langToggle');
    const userPreferredLanguage = localStorage.getItem('language') || 'en';

    // Set toggle switch state
    if (userPreferredLanguage === 'ta') {
      langToggle.checked = true;
    }

    // Initial content and style load
    const langData = await fetchLanguageData(userPreferredLanguage);
    updateContent(langData);
    toggleTamilStylesheet(userPreferredLanguage);
    toggleTamilBodyClass(userPreferredLanguage); // ✅ added

    // Toggle event listener
    langToggle.addEventListener('change', () => {
      const selectedLang = langToggle.checked ? 'ta' : 'en';
      changeLanguage(selectedLang);
    });
  });