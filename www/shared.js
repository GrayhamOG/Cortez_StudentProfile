// Text profile (Activity 5)
(function () {
  const saved = localStorage.getItem('studentProfile');
  if (!saved) return; // nothing saved yet, leave the page's default text as-is

  const data = JSON.parse(saved);

  const headerName = document.getElementById('header-name');
  if (headerName && data.name) {
    headerName.textContent = data.name;
  }

  const aboutText = document.getElementById('about-text');
  if (aboutText && data.about) {
    aboutText.textContent = data.about;
  }

  const skillsList = document.getElementById('skills-list');
  if (skillsList && data.skills && data.skills.length > 0) {
    skillsList.innerHTML = '';
    data.skills.forEach((skill) => {
      const li = document.createElement('li');
      li.className = 'skill-pill';
      li.textContent = skill;
      skillsList.appendChild(li);
    });
  }
})();

// Profile picture (Activity 6): show the captured photo in the header
// avatar on every page. Runs separately so it works even if no text
// profile has been saved yet.
(function () {
  try {
    const picture = localStorage.getItem('studentProfilePicture');
    if (!picture) return;
    document.querySelectorAll('.avatar').forEach((img) => {
      img.src = picture;
    });
  } catch (err) {
    console.warn('Could not load saved profile picture:', err);
  }
})();