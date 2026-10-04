// shared.js — runs on every protected page (Profile, About, Skills, Projects, Contact).
// 1. Blocks the page unless the user is logged in.
// 2. Loads the student's profile from the database ONCE and shares it.
// 3. Fills the header (name + picture) and the About/Skills pages.
// 4. Wires up the Logout button.
// Requires api.js to be loaded first.

(function () {
  // Old Activity 5/6 versions kept the profile in local storage. The database
  // is now the source of truth, so remove those stale copies.
  try {
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('studentProfilePicture');
  } catch (e) { /* ignore */ }

  if (!Api.guard()) return;

  const LOAD_ERROR = 'Unable to retrieve your profile. Please try again.';

  // ---- Logout ------------------------------------------------------
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutBtn.disabled = true;
      Api.logout();
    });
  }

  // ---- Load profile from the database --------------------------------
  const request = Api.getProfile();
  window.profileReady = request; // profile.js (index page) reuses this same request

  request.then((profile) => {
    const headerName = document.getElementById('header-name');
    if (headerName) headerName.textContent = profile.name;

    if (profile.picture) {
      document.querySelectorAll('.avatar').forEach((img) => { img.src = profile.picture; });
    }

    const aboutText = document.getElementById('about-text');
    if (aboutText) aboutText.textContent = profile.about;

    const skillsList = document.getElementById('skills-list');
    if (skillsList) {
      skillsList.innerHTML = '';
      profile.skills.forEach((skill) => {
        const li = document.createElement('li');
        li.className = 'skill-pill';
        li.textContent = skill;
        skillsList.appendChild(li);
      });
    }
  }).catch((err) => {
    if (err.status === 401) return; // already redirected to Login
    const aboutText = document.getElementById('about-text');
    if (aboutText) aboutText.textContent = LOAD_ERROR;
    const skillsList = document.getElementById('skills-list');
    if (skillsList) skillsList.innerHTML = '<li class="load-error">' + LOAD_ERROR + '</li>';
  });
})();
