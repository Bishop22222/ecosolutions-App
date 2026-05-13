let chartInstance = null;

function getSavedPoints() {
  const stored = localStorage.getItem("eco_points");
  if (stored === null) {
    localStorage.setItem("eco_points", "120");
    return 120;
  }
  return parseInt(stored);
}

function syncPointsDisplay(pointsValue) {
  const dashboardPoints = document.getElementById("points");
  const profilePoints = document.querySelector(".profile-points-sync");
  
  if (dashboardPoints) dashboardPoints.textContent = pointsValue;
  if (profilePoints) profilePoints.textContent = pointsValue;
}

function handleLogin() {
  const userField = document.getElementById("username").value;
  const passField = document.getElementById("password").value;
  const feedback = document.getElementById("login-feedback");

  if (userField.trim() !== "" && passField === "password") {
    localStorage.setItem("is_logged_in", "true");
    feedback.textContent = "";
    navigate("dashboard");
  } else {
    feedback.textContent = "❌ Invalid username or password.";
    feedback.style.color = "#d32f2f";
  }
}

function handleLogout() {
  localStorage.removeItem("is_logged_in");
  navigate("login");
}

function navigate(sectionId) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add('active');

  const titleEl = document.getElementById("screen-title");
  if (titleEl) titleEl.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

  const navBar = document.getElementById("main-nav");
  if (navBar) {
    navBar.style.display = (sectionId === "login") ? "none" : "flex";
  }

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("onclick") === `navigate('${sectionId}')`) {
      btn.classList.add("active");
    }
  });

  if (document.getElementById("feedback")) document.getElementById("feedback").textContent = "";
  if (document.getElementById("scan-feedback")) document.getElementById("scan-feedback").textContent = "";

  if (sectionId === "leaderboard") filterLeaderboard();
  if (sectionId === "dashboard") renderChart();
}

function redeem(cost, rewardName) {
  const feedback = document.getElementById("feedback");
  let currentPoints = getSavedPoints();

  if (currentPoints >= cost) {
    currentPoints -= cost;
    localStorage.setItem("eco_points", currentPoints.toString());
    syncPointsDisplay(currentPoints);
    feedback.textContent = `✅ ${rewardName} redeemed successfully!`;
    feedback.style.color = "#388e3c";
  } else {
    feedback.textContent = "❌ Not enough points to redeem this reward.";
    feedback.style.color = "#d32f2f";
  }
}

function addMockPoints(amount) {
  const scanFeedback = document.getElementById("scan-feedback");
  let currentPoints = getSavedPoints();

  currentPoints += amount;
  localStorage.setItem("eco_points", currentPoints.toString());
  syncPointsDisplay(currentPoints);

  scanFeedback.textContent = `✅ Action Verified! +${amount} points added.`;
  scanFeedback.style.color = "#388e3c";
}

function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");
  const targetTheme = (currentTheme === "dark") ? "light" : "dark";
  
  root.setAttribute("data-theme", targetTheme);
  localStorage.setItem("theme_preference", targetTheme);

  if (document.getElementById("dashboard").classList.contains("active")) {
    renderChart();
  }
}

function filterLeaderboard() {
  const filter = document.getElementById("leaderboardFilter").value;
  const list = document.getElementById("leaderboardList");
  
  const allData = [
    { name: "Alice", points: 300 },
    { name: "Bob", points: 280 },
    { name: "Charlie", points: 260 },
    { name: "Diana", points: 240 },
    { name: "Ethan", points: 220 }
  ];

  let filteredData = allData;
  if (filter === "monthly") filteredData = allData.slice(0, 3);
  if (filter === "weekly") filteredData = allData.slice(0, 2);

  list.innerHTML = filteredData.map((user, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    return `
      <li>
        <span><strong>${medal}</strong> ${user.name}</span>
        <strong>${user.points} pts</strong>
      </li>
    `;
  }).join("");
}

function renderChart() {
  const ctx = document.getElementById("pointsChart");
  if (!ctx) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const labelColor = isDark ? "#adb5bd" : "#6c757d";
  const gridColor = isDark ? "#2d2d2d" : "#e9ecef";

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Weekly Points Balance",
        data: [10, 20, 15, 25, 18, 30, 35],
        borderColor: isDark ? "#81c784" : "#4CAF50",
        backgroundColor: isDark ? "rgba(129, 199, 132, 0.1)" : "rgba(76, 175, 80, 0.1)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: labelColor } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: labelColor } },
        y: { grid: { color: gridColor }, ticks: { color: labelColor } }
      }
    }
  });
}

window.onload = () => {
  syncPointsDisplay(getSavedPoints());
  
  const savedTheme = localStorage.getItem("theme_preference") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const isLoggedIn = localStorage.getItem("is_logged_in");
  if (isLoggedIn === "true") {
    navigate("dashboard");
  } else {
    navigate("login");
  }
};
