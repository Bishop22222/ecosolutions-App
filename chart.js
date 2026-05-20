window.addEventListener("load", async () => {

  const canvas = document.getElementById("profileChart");
  if (!canvas) return;

  // wait for supabase (global from app.js)
  if (!window.supabase || !window.currentUser) return;

  const user = window.currentUser;

  // fetch real history
  const { data, error } = await window.supabase
    .from("points_history")
    .select("points, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("Chart error:", error);
    return;
  }

  // group by day (simple version)
  const labels = [];
  const values = [];

  (data || []).forEach(item => {
    const date = new Date(item.created_at).toLocaleDateString();
    labels.push(date);
    values.push(item.points);
  });

  new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Your Points History",
        data: values,
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
          labels: { color: "#fff" }
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
