// profile.js
// Handles Edit / Save / Cancel for the Student Profile section on index.html.
// Loaded as an external file (not inline) so it isn't blocked by the
// page's Content-Security-Policy, which doesn't allow inline scripts.

// ---- element references ----------------------------------------
const viewSection = document.getElementById('profile-view');
const editSection = document.getElementById('profile-edit');

const displayName = document.getElementById('display-name');
const headerName = document.getElementById('header-name');
const displayCourse = document.getElementById('display-course');
const displayYear = document.getElementById('display-year');
const displayAbout = document.getElementById('display-about');
const displaySkills = document.getElementById('display-skills');

const inputName = document.getElementById('input-name');
const inputCourse = document.getElementById('input-course');
const inputYear = document.getElementById('input-year');
const inputAbout = document.getElementById('input-about');
const inputSkills = document.getElementById('input-skills');

const editBtn = document.getElementById('edit-btn');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const feedback = document.getElementById('form-feedback');

const STORAGE_KEY = 'studentProfile';

// ---- render an array of skills as pills -----------------------------
function renderSkills(skills) {
  displaySkills.innerHTML = '';
  skills.forEach((skill) => {
    const li = document.createElement('li');
    li.className = 'skill-pill';
    li.textContent = skill;
    displaySkills.appendChild(li);
  });
}

// ---- load saved data on page load --------------------------------
function loadProfile() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    displayName.textContent = data.name;
    headerName.textContent = data.name;
    displayCourse.textContent = data.course;
    displayYear.textContent = data.year;
    displayAbout.textContent = data.about;
    if (data.skills) renderSkills(data.skills);
  }
}
loadProfile();

// ---- Edit button: fill inputs with current text, show the form ----
editBtn.addEventListener('click', () => {
  inputName.value = displayName.textContent;
  inputCourse.value = displayCourse.textContent;
  inputYear.value = displayYear.textContent;
  inputAbout.value = displayAbout.textContent;
  inputSkills.value = Array.from(displaySkills.children)
    .map((li) => li.textContent)
    .join(', ');
  feedback.textContent = '';

  viewSection.hidden = true;
  editSection.hidden = false;
  inputName.focus();
});

// ---- Save button: validate, update the page, save, go back --------
saveBtn.addEventListener('click', () => {
  const name = inputName.value.trim();
  const course = inputCourse.value.trim();
  const year = inputYear.value.trim();
  const about = inputAbout.value.trim();
  const skills = inputSkills.value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!name || !course || !year || !about) {
    feedback.textContent = 'Please complete all fields.';
    return;
  }

  // update what's shown on the page
  displayName.textContent = name;
  headerName.textContent = name;
  displayCourse.textContent = course;
  displayYear.textContent = year;
  displayAbout.textContent = about;
  renderSkills(skills);

  // save it so it's still there after a refresh
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, course, year, about, skills }));

  viewSection.hidden = false;
  editSection.hidden = true;
});

// ---- Cancel button: discard changes, just go back ------------------
cancelBtn.addEventListener('click', () => {
  viewSection.hidden = false;
  editSection.hidden = true;
});