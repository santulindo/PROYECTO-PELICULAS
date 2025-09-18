/* js/auth.js - autenticación básica con localStorage */

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem('session', JSON.stringify({ email }));
}

function clearSession() {
  localStorage.removeItem('session');
}

function getSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}

// Registro
if (document.getElementById('registerForm')) {
  const registerForm = document.getElementById('registerForm');
  const registerError = document.getElementById('registerError');

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;

    registerError.textContent = '';

    if (!name || !email || !password) {
      registerError.textContent = 'Por favor completa todos los campos.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      registerError.textContent = 'Correo inválido.';
      return;
    }
    if (password.length < 6) {
      registerError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      registerError.textContent = 'Ya existe una cuenta con ese correo.';
      return;
    }

    users.push({ name, email, password });
    saveUsers(users);
    setSession(email);
    window.location.href = 'index.html';
  });
}

// Login
if (document.getElementById('loginForm')) {
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    loginError.textContent = '';

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      loginError.textContent = 'Credenciales inválidas.';
      return;
    }
    setSession(email);
    window.location.href = 'index.html';
  });
}

// En index.html: mostrar usuario y logout
if (typeof window !== 'undefined' && document.readyState !== 'loading') {
  initAuthUI();
} else {
  document.addEventListener('DOMContentLoaded', initAuthUI);
}

function initAuthUI() {
  const session = getSession();
  const userEmailSpan = document.getElementById('userEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!session) {
    if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('register.html')) {
      window.location.href = 'login.html';
    }
    return;
  }

  if (userEmailSpan) userEmailSpan.textContent = session.email;
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}

// Exponer para otros scripts
window.auth = {
  getUsers,
  saveUsers,
  getSession,
  setSession,
  clearSession
};
