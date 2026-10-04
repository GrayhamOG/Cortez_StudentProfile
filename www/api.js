// api.js — the ONLY place the app talks to the backend.
// Holds no secrets: the app sends a login token, the server holds the database.
//
// Where is the API?
//  - Testing in a desktop browser (http://localhost:...)  -> http://localhost:3000
//  - Android emulator                                       -> http://10.0.2.2:3000
//  - Real phone on your Wi-Fi: put your computer's LAN IP below (e.g. http://192.168.1.20:3000)
//    and add the same address to connect-src in the Content-Security-Policy of every page.
(function () {
  const BROWSER_API = 'http://localhost:3000';
  const DEVICE_API = 'http://10.0.2.2:3000';

  const isBrowserDev = location.protocol === 'http:' && location.hostname === 'localhost' && location.port !== '';
  const API_BASE = isBrowserDev ? BROWSER_API : DEVICE_API;

  const TOKEN_KEY = 'authToken';

  // The login token is the only thing kept in local storage. Profile data lives in the database.
  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
  const setToken = (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) { /* ignore */ } };
  const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ } };

  function goToLogin() { location.replace('login.html'); }

  // Sends a request and returns parsed JSON. Throws an Error with:
  //   .status  – HTTP status (0 if the server could not be reached)
  //   .network – true when the server could not be reached
  async function request(method, path, body, opts) {
    const options = opts || {};
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token && !options.noAuth) headers.Authorization = 'Bearer ' + token;

    let res;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch (e) {
      const err = new Error('Unable to reach the server. Please try again.');
      err.status = 0;
      err.network = true;
      throw err;
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* empty or non-JSON body */ }

    if (!res.ok) {
      const err = new Error((data && data.error) || 'Something went wrong. Please try again.');
      err.status = res.status;
      // Expired/invalid session on a protected call: clear it and send the user to Login.
      if (res.status === 401 && !options.noAuth) {
        clearToken();
        goToLogin();
      }
      throw err;
    }
    return data;
  }

  window.Api = {
    API_BASE,
    getToken,
    isLoggedIn: () => Boolean(getToken()),

    // Call on every protected page. No token -> straight to Login.
    guard() {
      if (!getToken()) { goToLogin(); return false; }
      // Back/forward cache can show a protected page after logout; re-check.
      window.addEventListener('pageshow', () => { if (!getToken()) goToLogin(); });
      return true;
    },

    async login(identifier, password) {
      const data = await request('POST', '/api/login', { identifier, password }, { noAuth: true });
      setToken(data.token);
    },

    async register(fields) {
      const data = await request('POST', '/api/register', fields, { noAuth: true });
      setToken(data.token);
    },

    getProfile: () => request('GET', '/api/profile'),
    updateProfile: (profile) => request('PUT', '/api/profile', profile),
    updatePicture: (picture) => request('PUT', '/api/profile/picture', { picture }),

    async logout() {
      try { await request('POST', '/api/logout'); } catch (e) { /* clear locally either way */ }
      clearToken();
      goToLogin();
    },

    async deleteAccount(password) {
      await request('DELETE', '/api/account', { password });
      clearToken();
    }
  };
})();
