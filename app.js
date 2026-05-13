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
  const isDark = root.style.getPropertyValue("--bg-color") === "#333333";
  root.style.setProperty("--bg-color", isDark ? "#f4f4f4" : "#333333");
  root.style.setProperty("--text-color", isDark ? "#000000" : "#ffffff");
  root.style.setProperty("--card-color", isDark ? "#ffffff" : "#444444");
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
