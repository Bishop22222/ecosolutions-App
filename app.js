function redeem(cost) {
  const pointsEl = document.getElementById("points");
  const feedback = document.getElementById("feedback");

  let currentPoints = parseInt(pointsEl.textContent);

  if (currentPoints >= cost) {
    currentPoints -= cost;
    pointsEl.textContent = currentPoints;

    feedback.textContent = "✅ Reward redeemed successfully!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "❌ Not enough points to redeem this reward.";
    feedback.style.color = "red";
  }
}

function toggleTheme() {
  const root = document.documentElement;

  const isDark =
    root.style.getPropertyValue("--bg-color") === "#333";

  root.style.setProperty(
    "--bg-color",
    isDark ? "#f4f4f4" : "#333"
  );

  root.style.setProperty(
    "--text-color",
    isDark ? "#000" : "#fff"
  );

  root.style.setProperty(
    "--card-color",
    isDark ? "#ffffff" : "#444"
  );
}

window.onload = () => {
  const ctx = document.getElementById("pointsChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Weekly Points",
          data: [10, 20, 15, 25, 18, 30, 35],
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
};
function redeem(cost) {
  const pointsEl = document.getElementById("points");
  const feedback = document.getElementById("feedback");

  let currentPoints = parseInt(pointsEl.textContent);

  if (currentPoints >= cost) {
    currentPoints -= cost;
    pointsEl.textContent = currentPoints;

    feedback.textContent = "✅ Reward redeemed successfully!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = "❌ Not enough points to redeem this reward.";
    feedback.style.color = "red";
  }
}

function toggleTheme() {
  const root = document.documentElement;

  const isDark =
    root.style.getPropertyValue("--bg-color") === "#333";

  root.style.setProperty(
    "--bg-color",
    isDark ? "#f4f4f4" : "#333"
  );

  root.style.setProperty(
    "--text-color",
    isDark ? "#000" : "#fff"
  );

  root.style.setProperty(
    "--card-color",
    isDark ? "#ffffff" : "#444"
  );
}

function filterLeaderboard() {
  const filter = document.getElementById('leaderboardFilter').value;
  const list = document.getElementById('leaderboardList');
  
  const allData = [
    { name: "Alice", points: 300 },
    { name: "Bob", points: 280 },
    { name: "Charlie", points: 260 },
    { name: "Diana", points: 240 },
    { name: "Ethan", points: 220 },
    { name: "Fatima", points: 200 },
    { name: "George", points: 180 },
    { name: "Hannah", points: 160 },
    { name: "Isaac", points: 140 },
    { name: "Jasmine", points: 120 }
  ];

  let filteredData = allData;
  if (filter === 'monthly') {
    filteredData = allData.slice(0, 5);
  } else if (filter === 'weekly') {
    filteredData = allData.slice(0, 3);
  }

  list.innerHTML = filteredData.map((user, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    return `
      <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
        <span><strong>${medal}</strong> ${user.name}</span>
        <strong>${user.points} pts</strong>
      </li>
    `;
  }).join('');
}

function navigate(sectionId) {
  document.querySelectorAll('section').forEach(s => {
    s.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  const titleEl = document.getElementById('screen-title');
  if (titleEl) {
    titleEl.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  }
  
  const feedbackEl = document.getElementById('feedback');
  if (feedbackEl) {
    feedbackEl.textContent = '';
  }

  if (sectionId === 'leaderboard') {
    filterLeaderboard();
  }
}

window.onload = () => {
  const ctx = document.getElementById("pointsChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Weekly Points",
          data: [10, 20, 15, 25, 18, 30, 35],
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  filterLeaderboard();
};

