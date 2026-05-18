import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyY2lmYWZrZXBud2ZpeGxsZXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODgxNTIsImV4cCI6MjA5NDA2NDE1Mn0.cvcBrggZG3DFtyObdqZPIdzZKF6TA4lcLSnDoJhfh5I";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

/* expose functions */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleTheme = toggleTheme;
window.navigate = navigate;
window.redeem = redeem;
window.addMockPoints = addMockPoints;
window.filterLeaderboard = filterLeaderboard;

/* INIT */
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme_preference") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  initSession();
});

/* SESSION */
async function initSession() {
  const { data } = await supabase.auth.getSession();

  currentUser = data.session?.user || null;

  if (currentUser) {
    await fetchAndSyncPoints();
    navigate("dashboard");
  } else {
    navigate("login");
  }
}

/* PROFILE */
async function fetchAndSyncPoints() {
  if (!currentUser) return 0;

  let { data } = await supabase
    .from("profiles")
    .select("id, username, points_balance")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (!data) {
    const fallbackUsername =
      currentUser.user_metadata?.username ||
      currentUser.email.split("@")[0];

    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        username: fallbackUsername,
        points_balance: 120
      })
      .select()
      .single();

    data = newProfile;
  }

  updateUI(data);
  return data.points_balance;
}

function updateUI(profile) {
  document.getElementById("points").textContent = profile.points_balance;
  document.querySelector(".profile-points-sync").textContent = profile.points_balance;
  document.getElementById("profile-name-display").textContent = profile.username;
}

/* REGISTER */
async function handleRegister() {
  const email = document.getElementById("reg-email").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const feedback = document.getElementById("register-feedback");

  if (!email || !username || !password) {
    feedback.textContent = "❌ Fill all fields";
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  feedback.textContent = "✅ Account created. Check email or login.";
  setTimeout(() => navigate("login"), 1500);
}

/* LOGIN */
async function handleLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const feedback = document.getElementById("login-feedback");

  if (!email || !password) {
    feedback.textContent = "❌ Enter email + password";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  currentUser = data.user;

  await fetchAndSyncPoints();
  navigate("dashboard");
}

/* LOGOUT */
async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  navigate("login");
}

/* POINTS (demo system) */
async function addPoints(amount) {
  if (!currentUser) return;

  const { error } = await supabase.rpc("add_points", {
    p_user_id: currentUser.id,
    p_amount: amount
  });

  if (!error) fetchAndSyncPoints();
}

async function addMockPoints(amount) {
  const feedback = document.getElementById("scan-feedback");
  await addPoints(amount);
  feedback.textContent = `+${amount} points added`;
}

/* REDEEM */
async function redeem(cost, rewardName) {
  const feedback = document.getElementById("feedback");

  const current = await fetchAndSyncPoints();

  if (current < cost) {
    feedback.textContent = "❌ Not enough points";
    return;
  }

  const { error } = await supabase.rpc("add_points", {
    p_user_id: currentUser.id,
    p_amount: -cost
  });

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  feedback.textContent = `✅ Redeemed ${rewardName}`;
  fetchAndSyncPoints();
}

/* LEADERBOARD */
async function filterLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "Loading...";

  const { data } = await supabase
    .from("profiles")
    .select("id, username, points_balance")
    .order("points_balance", { ascending: false })
    .limit(10);

  list.innerHTML = data.map((u, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    const isMe = currentUser?.id === u.id;

    return `
      <li style="${isMe ? "background:#e8f5e9;font-weight:bold" : ""}">
        <span>${medal} ${u.username} ${isMe ? "(You)" : ""}</span>
        <strong>${u.points_balance}</strong>
      </li>
    `;
  }).join("");
}

/* NAVIGATION */
function navigate(sectionId) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId)?.classList.add("active");

  document.getElementById("screen-title").textContent = sectionId;

  const nav = document.getElementById("main-nav");
  nav.style.display = ["login", "register"].includes(sectionId) ? "none" : "flex";

  if (sectionId === "leaderboard") filterLeaderboard();
}

/* THEME */
function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme_preference", next);
}
