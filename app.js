alert("app.js loaded");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";

const SUPABASE_ANON_KEY =
  "YOUR_KEY_HERE";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

let currentUser = null;

/* INIT */
window.addEventListener("DOMContentLoaded", async () => {
  const savedTheme = localStorage.getItem("theme_preference") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const { data } = await supabase.auth.getSession();
  currentUser = data?.session?.user || null;

  if (currentUser) {
    await fetchAndSyncPoints();
    navigate("dashboard");
  } else {
    navigate("login");
  }

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

/* ================= AUTH ================= */

async function handleRegister() {
  const email = document.getElementById("reg-email")?.value?.trim();
  const username = document.getElementById("reg-username")?.value?.trim();
  const password = document.getElementById("reg-password")?.value;

  const feedback = document.getElementById("register-feedback");

  if (!email || !username || !password) {
    if (feedback) feedback.textContent = "❌ Fill all fields";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    console.error(error);

    if (feedback) {
      feedback.textContent = "❌ " + error.message;
    }

    return;
  }

  const user = data?.user;

  if (!user) {
    if (feedback) {
      feedback.textContent = "❌ User creation failed";
    }
    return;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      username,
      points_balance: 120
    });

  if (profileError) {
    console.error(profileError);

    if (feedback) {
      feedback.textContent =
        "❌ " + profileError.message;
    }

    return;
  }

  if (feedback) {
    feedback.textContent =
      "✅ Account created successfully";
  }

  setTimeout(() => navigate("login"), 1200);
}

/* ================= PROFILE ================= */

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

  const pointsEl = document.getElementById("points");
  const profilePoints = document.querySelector(".profile-points-sync");
  const profileName = document.getElementById("profile-name-display");

  if (pointsEl) pointsEl.textContent = data.points_balance;
  if (profilePoints) profilePoints.textContent = data.points_balance;
  if (profileName) profileName.textContent = data.username;

  return data.points_balance;
}

/* ================= POINTS ================= */

async function addMockPoints(amount) {
  if (!currentUser) return;

  const current = await fetchAndSyncPoints();

  await supabase
    .from("profiles")
    .update({ points_balance: current + amount })
    .eq("id", currentUser.id);

  const el = document.getElementById("scan-feedback");
  if (el) el.textContent = `+${amount} points added`;

  fetchAndSyncPoints();
}

/* ================= REDEEM ================= */

async function redeem(cost, rewardName) {
  if (!currentUser) return;

  const feedback = document.getElementById("feedback");
  const current = await fetchAndSyncPoints();

  if (current < cost) {
    if (feedback) feedback.textContent = "❌ Not enough points";
    return;
  }

  await supabase
    .from("profiles")
    .update({ points_balance: current - cost })
    .eq("id", currentUser.id);

  if (feedback) feedback.textContent = `✅ Redeemed ${rewardName}`;
  fetchAndSyncPoints();
}

/* ================= LEADERBOARD ================= */

async function filterLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

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

/* ================= NAV ================= */

function navigate(sectionId) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(sectionId)?.classList.add("active");

  const title = document.getElementById("screen-title");
  if (title) title.textContent = sectionId;

  const nav = document.getElementById("main-nav");
  if (nav) {
    nav.style.display =
      sectionId === "login" || sectionId === "register" ? "none" : "flex";
  }

  if (sectionId === "leaderboard") filterLeaderboard();
}

/* ================= THEME ================= */

function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme_preference", next);
}

/* expose to HTML */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleTheme = toggleTheme;
window.navigate = navigate;
window.addMockPoints = addMockPoints;
window.redeem = redeem;
window.filterLeaderboard = filterLeaderboard;
