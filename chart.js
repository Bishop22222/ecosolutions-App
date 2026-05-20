window.addEventListener("load", () => {

  const ctx = document.getElementById("homeChart");

  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Progress",
        data: [5, 10, 8, 15, 12, 18, 25],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true
      }]
    }
  });

});
