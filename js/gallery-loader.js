/* Loads the gallery images from gallery.json into #gallery.
   Extracted from gallery/index.njk's inline extraScript block: the
   production Content Security Policy's script-src has no
   'unsafe-inline', so this ran nowhere and the gallery page never
   loaded any images (not even the fallback error message, since that
   was inside the same blocked block). */
fetch('/assets/content/gallery/gallery.json')
    .then(response => response.json())
    .then(images => {
        const galleryDiv = document.getElementById('gallery');
        images.forEach(file => {
            const img = document.createElement('img');
            img.src = file.startsWith('/') ? file : `/assets/content/gallery/${file}`;
            img.alt = file;
            galleryDiv.appendChild(img);
        });
    })
    .catch(error => {
        console.error('Failed to load gallery images:', error);
        const fallback = document.getElementById('gallery');
        fallback.innerHTML = '<p style="color: red;">Failed to load gallery images.</p>';
    });
