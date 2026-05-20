window.addEventListener("load", () => {

  const profileCanvas = document.getElementById("profileChart");

  if (!profileCanvas) return;

  new Chart(profileCanvas, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Eco Activity",
        data: [5, 10, 7, 12, 18, 15, 22],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#fff"
          }
        }
      },
      scales: {
        x: {
          ticks: { color: "#fff" }
        },
        y: {
          ticks: { color: "#fff" }
        }
      }
    }
  });

});
