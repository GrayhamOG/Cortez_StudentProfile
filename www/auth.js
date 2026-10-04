// auth.js — Login and Register pages.
// Requires api.js to be loaded first.

(function () {
  const form = document.getElementById('auth-form');
  const feedback = document.getElementById('auth-feedback');
  const submitBtn = document.getElementById('auth-submit');
  const isRegister = form.dataset.mode === 'register';

  // Already logged in? Go straight to the profile (it re-checks the token itself).
  if (Api.isLoggedIn()) { location.replace('index.html'); return; }

  const params = new URLSearchParams(location.search);
  if (params.get('deleted')) {
    feedback.textContent = 'Your account was deleted.';
    feedback.className = 'form-feedback is-info';
  }

  function showError(message) {
    feedback.textContent = message;
    feedback.className = 'form-feedback';
  }

  const val = (id) => document.getElementById(id).value.trim();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = '';

    try {
      if (isRegister) {
        const fields = {
          studentId: val('studentId'),
          email: val('email'),
          password: document.getElementById('password').value,
          name: val('name'),
          course: val('course'),
          year: val('year')
        };
        if (!fields.studentId || !fields.email || !fields.password || !fields.name || !fields.course || !fields.year) {
          return showError('Please complete all fields.');
        }
        if (fields.password.length < 8) return showError('Password must be at least 8 characters.');
        if (fields.password !== document.getElementById('confirm').value) return showError('Passwords do not match.');

        submitBtn.disabled = true;
        await Api.register(fields);
      } else {
        const identifier = val('identifier');
        const password = document.getElementById('password').value;
        if (!identifier) return showError('Please enter your Student ID or email.');
        if (!password) return showError('Please enter your password.');

        submitBtn.disabled = true;
        await Api.login(identifier, password);
      }
      location.replace('index.html');
    } catch (err) {
      submitBtn.disabled = false;
      showError(err.message);
    }
  });
})();
