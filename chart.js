const ctx = document.getElementById('performanceChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
            label: 'Performance',
            data: [10, 20, 15, 30, 25],
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById("performanceChart");

    if (!ctx) {
        console.log("Canvas not found");
        return;
    }

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
            datasets: [{
                label: "Recycling KG",
                data: [12, 19, 8, 15, 25],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

});
