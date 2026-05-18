import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

/* expose existing functions (DO NOT remove your UI) */
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;

/* FIXED SESSION BOOT */
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

/* KEEP SESSION LIVE */
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;

  if (currentUser) {
    syncProfile();
    navigate("dashboard");
  } else {
    navigate("login");
  }
});

/* =========================
   🔑 LOGIN (FIXED)
========================= */
async function handleLogin() {
  // supports BOTH of your previous input styles safely
  const email =
    (document.getElementById("email")?.value ||
     document.getElementById("username")?.value || "")
    .trim()
    .toLowerCase();

  const password = document.getElementById("password")?.value;

  const feedback = document.getElementById("login-feedback");

  if (!email || !password) {
    feedback.textContent = "❌ Email and password required";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.log("LOGIN ERROR:", error.message);
    feedback.textContent = "❌ " + error.message;
    return;
  }

  currentUser = data.user;
  await syncProfile();
  navigate("dashboard");
}

/* =========================
   🧾 REGISTER (FIXED)
========================= */
async function handleRegister() {
  const email = document.getElementById("reg-email")?.value.trim().toLowerCase();
  const username = document.getElementById("reg-username")?.value.trim();
  const password = document.getElementById("reg-password")?.value;

  const feedback = document.getElementById("register-feedback");

  if (!email || !username || !password) {
    feedback.textContent = "❌ Fill all fields";
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
    feedback.textContent = "❌ " + error.message;
    return;
  }

  // IMPORTANT: no auto-login assumption
  feedback.textContent = "✅ Account created. You can now log in.";
}

/* =========================
   👤 PROFILE SYNC (SAFE)
========================= */
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

/* =========================
   🚪 LOGOUT
========================= */
async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  navigate("login");
}
