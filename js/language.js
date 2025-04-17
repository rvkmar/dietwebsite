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
//   function updateContent(langData) {
//     document.querySelectorAll('[data-i18n]').forEach(element => {
//       const key = element.getAttribute('data-i18n');
//       element.textContent = langData[key];
//     });
// }

  // Version 3
function updateContent(langData) {
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
  async function fetchLanguageData(lang) {
    const response = await fetch(`languages/${lang}.json?v=${Date.now()}`); // Cache-busting with timestamp
    if (!response.ok) {
      console.error('Error fetching language data:', response.statusText);
      return {}; // Return empty object on error
    }
    return response.json();
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
      toggleTamilBodyClass(lang); // ✅ add this line
      contentContainer.classList.remove('fade-out');
    }, 200); // Adjust the timeout duration to match your CSS transition duration
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
    
    // change for the overflow button text
    const overflowButton = document.getElementById("btn-more-toggle");
    overflowButton.setAttribute('data-i18n', 'more');

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
    // langToggle.addEventListener('change', () => {
    //   const selectedLang = langToggle.checked ? 'ta' : 'en';
    //   changeLanguage(selectedLang);
    // });

    // Version 2 // Toggle event listener for mobile
    ['touchstart', 'touchend', 'change', 'click'].forEach(event => {
    langToggle.addEventListener(event, () => {
    const selectedLang = langToggle.checked ? 'ta' : 'en';
    changeLanguage(selectedLang);
    });
  });
});