import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyY2lmYWZrZXBud2ZpeGxsZXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODgxNTIsImV4cCI6MjA5NDA2NDE1Mn0.cvcBrggZG3DFtyObdqZPIdzZKF6TA4lcLSnDoJhfh5I";

let currentUser = null;

/* expose */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.navigate = navigate;
window.toggleTheme = toggleTheme;

/* INIT SESSION */
window.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getSession();

  currentUser = data.session?.user || null;

  if (currentUser) {
    await syncProfile();
    navigate("dashboard");
  } else {
    navigate("login");
  }
});

/* LISTENER (keeps login stable) */
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;

  if (currentUser) {
    syncProfile();
    navigate("dashboard");
  } else {
    navigate("login");
  }
});

/* LOGIN */
async function handleLogin() {
  const email = document.getElementById("email")?.value.trim().toLowerCase();
  const password = document.getElementById("password")?.value;

  const feedback = document.getElementById("login-feedback");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  currentUser = data.user;
  await syncProfile();
  navigate("dashboard");
}

/* REGISTER */
async function handleRegister() {
  const email = document.getElementById("reg-email")?.value.trim().toLowerCase();
  const username = document.getElementById("reg-username")?.value.trim();
  const password = document.getElementById("reg-password")?.value;

  const feedback = document.getElementById("register-feedback");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  feedback.textContent = "Account created. You can now log in.";
}

/* PROFILE */
async function syncProfile() {
  if (!currentUser) return;

  let { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (!data) {
    const username =
      currentUser.user_metadata?.username ||
      currentUser.email.split("@")[0];

    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        username,
        points_balance: 100
      })
      .select()
      .single();

    data = newProfile;
  }

  document.getElementById("points").textContent = data.points_balance;
  document.querySelector(".profile-points-sync").textContent =
    data.points_balance;

  document.getElementById("profile-name-display").textContent =
    data.username;
}

/* LOGOUT */
async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  navigate("login");
}

/* NAV */
function navigate(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");

  document.getElementById("screen-title").textContent = id;

  document.getElementById("main-nav").style.display =
    id === "login" || id === "register" ? "none" : "flex";
}

/* THEME */
function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
}
