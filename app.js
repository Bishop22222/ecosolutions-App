
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* ================= SUPABASE ================= */

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyY2lmYWZrZXBud2ZpeGxsZXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODgxNTIsImV4cCI6MjA5NDA2NDE1Mn0.cvcBrggZG3DFtyObdqZPIdzZKF6TA4lcLSnDoJhfh5I"; // keep your real key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/* ================= GLOBAL STATE ================= */

let currentUser = null;

/* expose for charts.js */
window.supabase = supabase;
window.currentUser = null;

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", async () => {

  const { data } = await supabase.auth.getSession();

  currentUser = data?.session?.user || null;
  window.currentUser = currentUser;

  if (currentUser) {
    await fetchAndSyncPoints();
    navigate("dashboard");
  } else {
    navigate("login");
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    window.currentUser = currentUser;

    if (currentUser) {
      await fetchAndSyncPoints();
      navigate("dashboard");
    } else {
      navigate("login");
    }
  });
});

/* ================= AUTH ================= */

async function handleRegister() {
  const email = document.getElementById("reg-email")?.value?.trim();
  const username = document.getElementById("reg-username")?.value?.trim();
  const password = document.getElementById("reg-password")?.value;

  if (!email || !username || !password) return;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    console.log(error.message);
    return;
  }

  navigate("login");
}

async function handleLogin() {
  const email = document.getElementById("username")?.value?.trim();
  const password = document.getElementById("password")?.value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log(error.message);
    return;
  }

  currentUser = data.user;
  window.currentUser = currentUser;

  await fetchAndSyncPoints();
  navigate("dashboard");
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  window.currentUser = null;
  navigate("login");
}

/* ================= POINTS ================= */

async function fetchAndSyncPoints() {
  if (!currentUser) return 0;

  const { data } = await supabase
    .from("profiles")
    .select("username, points_balance")
    .eq("id", currentUser.id)
    .single();

  const points = data?.points_balance || 0;

  document.getElementById("points").textContent = points;
  document.querySelector(".profile-points-sync").textContent = points;
  document.getElementById("profile-name-display").textContent =
    data?.username || "User";

  return points;
}

/* ================= ADD POINTS + HISTORY ================= */

async function addMockPoints(amount) {
  if (!currentUser) return;

  const current = await fetchAndSyncPoints();

  // update total
  await supabase
    .from("profiles")
    .update({
      points_balance: current + amount
    })
    .eq("id", currentUser.id);

  // SAVE HISTORY (REAL DATA FOR GRAPH)
  await supabase.from("points_history").insert({
    user_id: currentUser.id,
    points: amount
  });

  fetchAndSyncPoints();
}

/* ================= REDEEM ================= */

async function redeem(cost, rewardName) {
  if (!currentUser) return;

  const current = await fetchAndSyncPoints();

  if (current < cost) return;

  await supabase
    .from("profiles")
    .update({
      points_balance: current - cost
    })
    .eq("id", currentUser.id);

  fetchAndSyncPoints();
}

/* ================= LEADERBOARD ================= */

async function filterLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  const { data } = await supabase
    .from("profiles")
    .select("username, points_balance")
    .order("points_balance", { ascending: false })
    .limit(10);

  list.innerHTML = (data || [])
    .map((u, i) => `
      <li>
        <span>#${i + 1} ${u.username}</span>
        <strong>${u.points_balance}</strong>
      </li>
    `)
    .join("");
}

/* ================= NAVIGATION ================= */

function navigate(sectionId) {

  document.querySelectorAll("section").forEach(s =>
    s.classList.remove("active")
  );

  document.getElementById(sectionId)?.classList.add("active");

  document.getElementById("screen-title").textContent = sectionId;

  const nav = document.getElementById("main-nav");

  if (nav) {
    nav.style.display =
      sectionId === "login" || sectionId === "register"
        ? "none"
        : "flex";
  }

  if (sectionId === "leaderboard") {
    filterLeaderboard();
  }
}

/* ================= THEME ================= */

function toggleTheme() {
  const root = document.documentElement;

  const next =
    root.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";

  root.setAttribute("data-theme", next);
}

/* ================= EXPOSE FUNCTIONS ================= */

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleTheme = toggleTheme;
window.navigate = navigate;
window.addMockPoints = addMockPoints;
window.redeem = redeem;
window.filterLeaderboard = filterLeaderboard;
