const SUPABASE_URL = "https://jrcifafkepnwfixllesj.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_2gcZJv2aQrLEdPtf6WPWmQ_6cCq1h1I";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

async function checkUserSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    currentUser = session.user;
    await fetchAndSyncPoints();
    navigate("dashboard");
  } else {
    navigate("login");
  }
}

async function fetchAndSyncPoints() {
  if (!currentUser) return 0;
  
  let { data, error } = await supabase
    .from('profiles')
    .select('username, points_balance')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (!data) {
    const fallbackUsername = currentUser.user_metadata?.username || currentUser.email.split('@')[0];
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        { id: currentUser.id, username: fallbackUsername, points_balance: 120 }
      ])
      .select('username, points_balance')
      .single();

    if (insertError) {
      console.error("Critical Profile Creation Recovery Failure:", insertError.message);
      return 0;
    }
    data = newProfile; 
  }

  const dashboardPoints = document.getElementById("points");
  const profilePoints = document.querySelector(".profile-points-sync");
  const profileName = document.getElementById("profile-name-display");
  
  if (dashboardPoints) dashboardPoints.textContent = data.points_balance;
  if (profilePoints) profilePoints.textContent = data.points_balance;
  if (profileName) profileName.textContent = data.username;
  
  return data.points_balance;
}

async function handleRegister() {
  const email = document.getElementById("reg-email").value;
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const feedback = document.getElementById("register-feedback");

  if (!email || !username || !password) {
    feedback.textContent = "❌ Please fill out all configuration fields.";
    feedback.style.color = "#d32f2f";
    return;
  }

  feedback.textContent = "Creating account secure data rows...";
  feedback.style.color = "orange";

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { username: username }
    }
  });

  if (error) {
    feedback.textContent = `❌ Error: ${error.message}`;
    feedback.style.color = "#d32f2f";
  } else {
    feedback.textContent = "✅ Success! Please check email or log in.";
    feedback.style.color = "#388e3c";
    setTimeout(() => navigate("login"), 2000);
  }
}

async function handleLogin() {
  const emailField = document.getElementById("username").value;
  const passField = document.getElementById("password").value;
  const feedback = document.getElementById("login-feedback");

  feedback.textContent = "Authenticating identity data...";
  feedback.style.color = "orange";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailField,
    password: passField
  });

  if (error) {
    feedback.textContent = `❌ Error: ${error.message}`;
    feedback.style.color = "#d32f2f";
  } else {
    currentUser = data.user;
    feedback.textContent = "";
    await fetchAndSyncPoints();
    navigate("dashboard");
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  navigate("login");
}

async function filterLeaderboard() {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  list.innerHTML = `<li style="justify-content:center; color:var(--text-muted);">Syncing ranking database tables...</li>`;

  const { data, error } = await supabase
    .from('profiles')
    .select('username, points_balance')
    .order('points_balance', { ascending: false })
    .limit(10);

  if (error) {
    list.innerHTML = `<li style="justify-content:center; color:#d32f2f;">❌ Live leaderboard failed to load.</li>`;
    return;
  }

  if (data.length === 0) {
    list.innerHTML = `<li style="justify-content:center; color:var(--text-muted);">No entries recorded yet.</li>`;
    return;
  }

  list.innerHTML = data.map((user, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    const profileDisplayEl = document.getElementById("profile-name-display");
    const isMe = currentUser && profileDisplayEl && user.username === profileDisplayEl.textContent;
    return `
      <li style="${isMe ? 'background:rgba(56,142,60,0.1); font-weight:bold; border-radius:8px;' : ''}">
        <span><strong>${medal}</strong> ${user.username} ${isMe ? '(You)' : ''}</span>
        <strong>${user.points_balance} pts</strong>
      </li>
    `;
  }).join("");
}

async function redeem(cost, rewardName) {
  const feedback = document.getElementById("feedback");
  if (!currentUser) return;

  const currentPoints = await fetchAndSyncPoints();

  if (currentPoints >= cost) {
    const newBalance = currentPoints - cost;

    const { error } = await supabase
      .from('profiles')
      .update({ points_balance: newBalance })
      .eq('id', currentUser.id);

    if (error) {
      feedback.textContent = `❌ Database update rejection: ${error.message}`;
      feedback.style.color = "#d32f2f";
    } else {
      await fetchAndSyncPoints();
      feedback.textContent = `✅ ${rewardName} successfully processed!`;
      feedback.style.color = "#388e3c";
    }
  } else {
    feedback.textContent = "❌ Balance insufficient for transaction criteria.";
    feedback.style.color = "#d32f2f";
  }
}

async function addMockPoints(amount) {
  const scanFeedback = document.getElementById("scan-feedback");
  if (!currentUser) return;

  const currentPoints = await fetchAndSyncPoints();
  const newBalance = currentPoints + amount;

  const { error } = await supabase
    .from('profiles')
    .update({ points_balance: newBalance })
    .eq('id', currentUser.id);

  if (error) {
    scanFeedback.textContent = `❌ Write transactional logic drop: ${error.message}`;
    scanFeedback.style.color = "#d32f2f";
  } else {
    await fetchAndSyncPoints();
    scanFeedback.textContent = `✅ Ledger adjustment verified! +${amount} points added.`;
    scanFeedback.style.color = "#388e3c";
  }
}

function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  const targetTheme = (currentTheme === "dark") ? "light" : "dark";
  root.setAttribute("data-theme", targetTheme);
  localStorage.setItem("theme_preference", targetTheme);
}

function navigate(sectionId) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add('active');

  const titleEl = document.getElementById("screen-title");
  if (titleEl) {
    if (sectionId === 'login') titleEl.textContent = "Login";
    else if (sectionId === 'register') titleEl.textContent = "Register";
    else titleEl.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  }

  const navBar = document.getElementById("main-nav");
  if (navBar) {
    navBar.style.display = (sectionId === "login" || sectionId === "register") ? "none" : "flex";
  }

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick") === `navigate('${sectionId}')`) {
      btn.classList.add("active");
    }
  });

  if (sectionId === "leaderboard") filterLeaderboard();
  if (sectionId === "dashboard") renderChart();
}

function renderChart() {
  const weeklyContainer = document.getElementById("weekly-bars");
  const monthlyContainer = document.getElementById("monthly-bars");
  if (!weeklyContainer || !monthlyContainer) return;

  const weeklyData = [
    { label: "M", val: 10 }, { label: "T", val: 20 }, { label: "W", val: 15 },
    { label: "T", val: 25 }, { label: "F", val: 18 }, { label: "S", val: 30 }, 
    { label: "S", val: 35 }
  ];
  const maxWeekly = 35;

  weeklyContainer.innerHTML = weeklyData.map(d => {
    const heightPercent = (d.val / maxWeekly) * 80;
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-fill" style="height: ${heightPercent}%;">
          <span class="bar-value">${d.val}</span>
        </div>
        <span class="bar-label">${d.label}</span>
      </div>
    `;
  }).join('');

  const monthlyData = [
    { label: "Jan", val: 45 }, { label: "Feb", val: 55 }, { label: "Mar", val: 40 },
    { label: "Apr", val: 65 }, { label: "May", val: 50 }, { label: "Jun", val: 75 }
  ];
  const maxMonthly = 75;

  monthlyContainer.innerHTML = monthlyData.map(d => {
    const heightPercent = (d.val / maxMonthly) * 80;
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-fill accent-bar" style="height: ${heightPercent}%;">
          <span class="bar-value">${d.val}</span>
        </div>
        <span class="bar-label">${d.label}</span>
      </div>
    `;
  }).join('');
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme_preference") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  checkUserSession();
  
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      fetchAndSyncPoints();
      navigate("dashboard");
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      navigate("login");
    }
  });
};
