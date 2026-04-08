/**
 * Authentication Module
 * Handles fake user registration, login, and session state.
 */

// Initialize users and current session from localStorage
let users = JSON.parse(localStorage.getItem("smartCartUsers")) || [];
let currentUser = JSON.parse(localStorage.getItem("smartCartSession")) || null;

function saveUsers() {
  localStorage.setItem("smartCartUsers", JSON.stringify(users));
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem("smartCartSession", JSON.stringify(currentUser));
  } else {
    localStorage.removeItem("smartCartSession");
  }
}

function registerUser(name, email, password) {
  if (users.find(u => u.email === email)) {
    return { success: false, message: "Email already registered." };
  }
  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers();
  
  // Auto-login
  currentUser = newUser;
  saveSession();
  updateAuthUI();
  return { success: true };
}

function loginUser(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    saveSession();
    updateAuthUI();
    return { success: true };
  }
  return { success: false, message: "Invalid email or password." };
}

function logoutUser() {
  currentUser = null;
  saveSession();
  updateAuthUI();
  window.location.reload();
}

function updateAuthUI() {
  const authContainer = document.getElementById("auth-container");
  if (!authContainer) return;
  
  if (currentUser) {
    authContainer.innerHTML = `
      <span class="user-greeting">Hi, ${currentUser.name}</span>
      <button class="btn-text" onclick="logoutUser()">Logout</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="btn-text">Login</a>
      <a href="register.html" class="btn-text">Register</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);

if (typeof window !== "undefined") {
  window.registerUser = registerUser;
  window.loginUser = loginUser;
  window.logoutUser = logoutUser;
  window.getCurrentUser = () => currentUser;
}
