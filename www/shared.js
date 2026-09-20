
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