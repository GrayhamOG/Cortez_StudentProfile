// profile.js
// Handles Edit / Save / Cancel for the Student Profile section on index.html
// (Activity 5) and the Cordova camera profile picture (Activity 6).
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


// =====================================================================
// Activity 6 — Profile picture via the Cordova camera
// Plugin: cordova-plugin-camera  (exposes navigator.camera.getPicture)
// =====================================================================

// The picture is stored under its OWN key so saving the text profile
// (which rewrites 'studentProfile') never wipes it out.
const PICTURE_KEY = 'studentProfilePicture';

const CAMERA_ERROR_MSG = 'Unable to access the camera. Please check your device permissions.';
const CAMERA_CANCEL_MSG = 'No photo taken. Your profile picture was not changed.';

const changePictureBtn = document.getElementById('change-picture-btn');
const pictureStatus = document.getElementById('picture-status');
// The card picture AND the header avatar should always match.
const pictureImgs = document.querySelectorAll('.profile-picture, .avatar');

let cameraBusy = false;

function showPicture(src) {
  pictureImgs.forEach((img) => { img.src = src; });
}

function setPictureStatus(message, isError) {
  pictureStatus.textContent = message;
  pictureStatus.classList.toggle('is-error', Boolean(isError));
}

function setCameraBusy(busy) {
  cameraBusy = busy;
  changePictureBtn.disabled = busy;
}

// ---- restore the saved picture on startup --------------------------
function loadPicture() {
  try {
    const saved = localStorage.getItem(PICTURE_KEY);
    if (saved) showPicture(saved);
  } catch (err) {
    console.warn('Could not read saved profile picture:', err);
  }
}
loadPicture();

// ---- success: camera returned a Base64 string ----------------------
function onCameraSuccess(imageData) {
  setCameraBusy(false);

  // DATA_URL gives raw Base64 without the "data:" prefix — add it so
  // it works as an <img> src (and passes the CSP: img-src 'self' data:).
  const src = 'data:image/jpeg;base64,' + imageData;
  showPicture(src);

  try {
    localStorage.setItem(PICTURE_KEY, src);
    setPictureStatus('Profile picture updated.', false);
  } catch (err) {
    // e.g. storage quota exceeded — the new photo still shows for now
    console.warn('Could not save profile picture:', err);
    setPictureStatus('Photo updated, but it could not be saved for next time.', true);
  }
}

// ---- failure OR cancel: both arrive in the error callback -----------
function onCameraFail(message) {
  setCameraBusy(false);
  const text = String(message || '');

  // The plugin reports "user closed the camera" as an error string,
  // e.g. "No Image Selected" / "Camera cancelled." — that is not a failure.
  if (/cancel|no image selected|no images? selected/i.test(text)) {
    setPictureStatus(CAMERA_CANCEL_MSG, false);
    return; // existing picture stays exactly as it was
  }

  console.warn('Camera error:', text);
  setPictureStatus(CAMERA_ERROR_MSG, true);
}

// ---- open the camera ---------------------------------------------
function takePicture() {
  if (cameraBusy) return;
  setPictureStatus('', false);

  // navigator.camera only exists inside Cordova after 'deviceready'
  // (and never in a plain desktop browser).
  if (!navigator.camera || typeof Camera === 'undefined') {
    setPictureStatus(CAMERA_ERROR_MSG, true);
    return;
  }

  const options = {
    quality: 60,                                   // keeps the Base64 small for localStorage
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    encodingType: Camera.EncodingType.JPEG,
    mediaType: Camera.MediaType.PICTURE,
    targetWidth: 400,
    targetHeight: 400,
    correctOrientation: true,                      // fixes sideways photos
    cameraDirection: Camera.Direction.FRONT,
    saveToPhotoAlbum: false
  };

  setCameraBusy(true);
  try {
    navigator.camera.getPicture(onCameraSuccess, onCameraFail, options);
  } catch (err) {
    onCameraFail(err && err.message);
  }
}

changePictureBtn.addEventListener('click', takePicture);

// ---- Android: app may be killed while the camera is open -------------
// The plugin hands the result back through the 'resume' event instead.
document.addEventListener('deviceready', () => {
  document.addEventListener('resume', (event) => {
    const pending = event && event.pendingResult;
    if (!pending || pending.pluginServiceName !== 'Camera') return;

    if (pending.pluginStatus === 'OK') {
      onCameraSuccess(pending.result);
    } else {
      onCameraFail(pending.result);
    }
  }, false);
}, false);