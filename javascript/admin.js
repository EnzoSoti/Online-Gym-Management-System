// Member Growth Chart
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('memberGrowthChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Members',
                    data: [30, 45, 38, 50, 65, 78],
                    backgroundColor: '#4f46e5',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.error('Could not find memberGrowthChart canvas element');
    }
});