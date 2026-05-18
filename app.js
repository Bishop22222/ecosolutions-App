import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabase = createClient(
  "https://jrcifafkepnwfixllesj.supabase.co",
  "YOUR_ANON_KEY"
);

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

/* LISTENER */
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
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  const feedback = document.getElementById("login-feedback");

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
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  const feedback = document.getElementById("register-feedback");

  if (error) {
    feedback.textContent = error.message;
    return;
  }

  feedback.textContent = "Account created. Now login.";
}

/* PROFILE SYNC */
async function syncProfile() {
  if (!currentUser) return;

  let { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (!data) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: currentUser.id,
        username: currentUser.email.split("@")[0],
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
function navigate(page) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(page).classList.add("active");

  document.getElementById("screen-title").textContent = page;

  document.getElementById("main-nav").style.display =
    page === "login" || page === "register" ? "none" : "flex";
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("dark");
}
