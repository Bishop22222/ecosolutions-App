import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_REAL_ANON_KEY_HERE"; // MUST be real anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

/* expose to UI */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleTheme = toggleTheme;
window.navigate = navigate;
window.redeem = redeem;
window.addMockPoints = addMockPoints;
window.filterLeaderboard = filterLeaderboard;

/* INIT */
window.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme_preference") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const { data } = await supabase.auth.getSession();
  currentUser = data.session?.user || null;

  if (currentUser) {
    await fetchAndSyncPoints();
    navigate("dashboard");
  } else {
    navigate("login");
  }

  /* IMPORTANT: listen auth changes */
  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;

    if (currentUser) {
      fetchAndSyncPoints();
      navigate("dashboard");
    } else {
      navigate("login");
    }
  });
});

/* ===================== AUTH ===================== */

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
    feedback.textContent = "❌ " + error.message;
    return;
  }

  feedback.textContent = "✅ Account created. You can now log in.";
  setTimeout(() => navigate("login"), 1200);
}

async function handleLogin() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const feedback = document.getElementById("login-feedback");

  if (!email || !password) {
    feedback.textContent = "❌ Missing email or password";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    feedback.textContent = "❌ " + error.message;
    return;
  }

  currentUser = data.user;
  await fetchAndSyncPoints();
  navigate("dashboard");
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  navigate("login");
}

/* ===================== PROFILE ===================== */

async function fetchAndSyncPoints() {
  if (!currentUser) return 0;

  let { data } = await supabase
    .from("profiles")
    .select("username, points_balance")
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
        points_balance: 120
      })
      .select()
      .single();

    data = newProfile;
  }

  if (data) {
    document.getElementById("points").textContent = data.points_balance;
    document.querySelector(".profile-points-sync").textContent = data.points_balance;
    document.getElementById("profile-name-display").textContent = data.username;
  }

  return data?.points_balance || 0;
}

/* ===================== POINTS ===================== */

async function addPoints(amount) {
  if (!currentUser) return;

  const current = await fetchAndSyncPoints();

  await supabase
    .from("profiles")
    .update({ points_balance: current + amount })
    .eq("id", currentUser.id);

  fetchAndSyncPoints();
}

async function addMockPoints(amount) {
  const el = document.getElementById("scan-feedback");
  await addPoints(amount);
  el.textContent = `+${amount} points added`;
}

/* ===================== REDEEM ===================== */

async function redeem(cost, rewardName) {
  const feedback = document.getElementById("feedback");
  const current = await fetchAndSyncPoints();

  if (current < cost) {
    feedback.textContent = "❌ Not enough points";
    return;
  }

  await supabase
    .from("profiles")
    .update({ points_balance: current - cost })
    .eq("id", currentUser.id);

  feedback.textContent = `✅ Redeemed ${rewardName}`;
  fetchAndSyncPoints();
}

/* ===================== LEADERBOARD ===================== */

async function filterLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "Loading...";

  const { data, error } = await supabase
    .from("profiles")
    .select("username, points_balance")
    .order("points_balance", { ascending: false })
    .limit(10);

  if (error) {
    list.innerHTML = "❌ Failed to load leaderboard";
    return;
  }

  list.innerHTML = (data || [])
    .map((u, i) => {
      const medal =
        i === 0 ? "🥇" :
        i === 1 ? "🥈" :
        i === 2 ? "🥉" :
        `#${i + 1}`;

      return `
        <li>
          <span>${medal} ${u.username}</span>
          <strong>${u.points_balance}</strong>
        </li>
      `;
    })
    .join("");
}

/* ===================== NAV ===================== */

function navigate(sectionId) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId)?.classList.add("active");

  const title = document.getElementById("screen-title");
  if (title) title.textContent = sectionId;

  document.getElementById("main-nav").style.display =
    (sectionId === "login" || sectionId === "register") ? "none" : "flex";

  if (sectionId === "leaderboard") filterLeaderboard();
}

/* ===================== THEME ===================== */

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme_preference", next);
}
