// profile.js — Profile page (index.html).
// Activity 5: Edit / Save / Cancel      -> now saved to the DATABASE through the API
// Activity 6: Cordova camera picture    -> now saved to the DATABASE through the API
// Activity 7: Delete account (CRUD "Delete")
//
// Load order on the page: api.js, shared.js, cordova.js, profile.js
// shared.js already redirects to Login if the user isn't logged in and starts
// the profile request (window.profileReady), which this file reuses.

// ---- element references ----------------------------------------
const viewSection = document.getElementById('profile-view');
const editSection = document.getElementById('profile-edit');
const deleteSection = document.getElementById('delete-section');

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

const deleteBtn = document.getElementById('delete-btn');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');
const deletePassword = document.getElementById('delete-password');
const deleteFeedback = document.getElementById('delete-feedback');

const LOAD_ERROR_MSG = 'Unable to retrieve your profile. Please try again.';
const UPDATE_ERROR_MSG = 'Unable to update your profile.';
const UPDATE_OK_MSG = 'Profile updated successfully.';

// The card picture AND the header avatar should always match.
const pictureImgs = document.querySelectorAll('.profile-picture, .avatar');
const pictureStatus = document.getElementById('picture-status');

function showPicture(src) {
  pictureImgs.forEach((img) => { img.src = src; });
}

// One status line under the name: used for picture + profile update messages.
function setStatus(message, isError) {
  pictureStatus.textContent = message;
  pictureStatus.classList.toggle('is-error', Boolean(isError));
}

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

// ---- show a profile record that came from the database ---------------
function renderProfile(profile) {
  displayName.textContent = profile.name;
  headerName.textContent = profile.name;
  displayCourse.textContent = profile.course;
  displayYear.textContent = profile.year;
  displayAbout.textContent = profile.about;
  renderSkills(profile.skills);
  if (profile.picture) showPicture(profile.picture);
}

// ---- READ: load the profile from the database ------------------------
// (shared.js sets profileReady; if it is missing the user isn't logged in and is already being sent to Login)
(window.profileReady || Promise.reject({ status: 401 }))
  .then(renderProfile)
  .catch((err) => {
    if (err.status === 401) return; // session expired: api.js sends the user to Login
    displayAbout.textContent = LOAD_ERROR_MSG;
    setStatus(LOAD_ERROR_MSG, true);
    editBtn.disabled = true; // don't let them "edit" a profile that never loaded
  });

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
  setStatus('', false);

  viewSection.hidden = true;
  deleteSection.hidden = true;
  editSection.hidden = false;
  inputName.focus();
});

// ---- UPDATE: validate, save to the database, then show the result ---
saveBtn.addEventListener('click', async () => {
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

  saveBtn.disabled = true;
  feedback.textContent = '';
  try {
    const saved = await Api.updateProfile({ name, course, year, about, skills });
    renderProfile(saved); // show exactly what the database now holds
    viewSection.hidden = false;
    editSection.hidden = true;
    setStatus(UPDATE_OK_MSG, false);
  } catch (err) {
    if (err.status === 401) return;
    // Validation problems from the server are safe to show; otherwise use the generic message.
    feedback.textContent = err.status === 400 ? err.message : UPDATE_ERROR_MSG;
    // stay in edit mode so nothing the student typed is lost
  } finally {
    saveBtn.disabled = false;
  }
});

// ---- Cancel button: discard changes, just go back ------------------
cancelBtn.addEventListener('click', () => {
  viewSection.hidden = false;
  editSection.hidden = true;
});

// ---- DELETE: remove the account (password required) -----------------
deleteBtn.addEventListener('click', () => {
  deletePassword.value = '';
  deleteFeedback.textContent = '';
  setStatus('', false);
  viewSection.hidden = true;
  deleteSection.hidden = false;
  deletePassword.focus();
});

deleteCancelBtn.addEventListener('click', () => {
  deleteSection.hidden = true;
  viewSection.hidden = false;
});

deleteConfirmBtn.addEventListener('click', async () => {
  if (!deletePassword.value) {
    deleteFeedback.textContent = 'Please enter your password to confirm.';
    return;
  }
  deleteConfirmBtn.disabled = true;
  deleteFeedback.textContent = '';
  try {
    await Api.deleteAccount(deletePassword.value);
    location.replace('login.html?deleted=1');
  } catch (err) {
    if (err.status === 401) return;
    deleteFeedback.textContent = err.status === 403 ? 'Incorrect password.' : 'Unable to delete your account.';
    deleteConfirmBtn.disabled = false;
  }
});


// =====================================================================
// Activity 6 — Profile picture via the Cordova camera
// Plugin: cordova-plugin-camera  (exposes navigator.camera.getPicture)
// The captured photo is now sent to the API and stored in the database.
// =====================================================================

const CAMERA_ERROR_MSG = 'Unable to access the camera. Please check your device permissions.';
const CAMERA_CANCEL_MSG = 'No photo taken. Your profile picture was not changed.';
const PICTURE_SAVE_ERROR_MSG = 'Unable to update your profile picture.';

const changePictureBtn = document.getElementById('change-picture-btn');

let cameraBusy = false;

function setCameraBusy(busy) {
  cameraBusy = busy;
  changePictureBtn.disabled = busy;
}

// ---- success: camera returned a Base64 string ----------------------
function onCameraSuccess(imageData) {
  savePicture(imageData);
}

async function savePicture(imageData) {
  // DATA_URL gives raw Base64 without the "data:" prefix — add it so the
  // server accepts it and it works as an <img> src.
  const src = 'data:image/jpeg;base64,' + imageData;
  try {
    await Api.updatePicture(src);   // save to the database first…
    showPicture(src);               // …then show it, so the screen never lies
    setStatus('Profile picture updated.', false);
  } catch (err) {
    if (err.status === 401) return;
    console.warn('Could not save profile picture:', err);
    setStatus(PICTURE_SAVE_ERROR_MSG, true);
  } finally {
    setCameraBusy(false);
  }
}

// ---- failure OR cancel: both arrive in the error callback -----------
function onCameraFail(message) {
  setCameraBusy(false);
  const text = String(message || '');

  // The plugin reports "user closed the camera" as an error string,
  // e.g. "No Image Selected" / "Camera cancelled." — that is not a failure.
  if (/cancel|no image selected|no images? selected/i.test(text)) {
    setStatus(CAMERA_CANCEL_MSG, false);
    return; // existing picture stays exactly as it was
  }

  console.warn('Camera error:', text);
  setStatus(CAMERA_ERROR_MSG + ' (' + text + ')', true);
}

// ---- open the camera ---------------------------------------------
function takePicture() {
  if (cameraBusy) return;
  setStatus('', false);

  // navigator.camera only exists inside Cordova after 'deviceready'
  // (and never in a plain desktop browser).
  if (!navigator.camera || typeof Camera === 'undefined') {
    setStatus('Camera plugin not loaded (navigator.camera missing).', true);
    return;
}

  const options = {
    quality: 60,                                   // keeps the Base64 small
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
