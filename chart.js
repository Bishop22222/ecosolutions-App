window.addEventListener("load", () => {

    const canvas = document.getElementById("performanceChart");

    if (!canvas) {
        console.log("Canvas not found");
        return;
    }

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
            datasets: [{
                label: "Recycling KG",
                data: [12, 19, 8, 15, 25]
            }]
        },
        options: {
            responsive: true
        }
    });

});
