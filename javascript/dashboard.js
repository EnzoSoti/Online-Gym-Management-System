const API_BASE_URL = 'http://localhost:3000/api';

// Format currency function
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

// Update dashboard metrics
async function updateDashboardMetrics() {
    try {
        // Fetch total earnings
        const earningsResponse = await fetch(`${API_BASE_URL}/total-earnings`);
        if (!earningsResponse.ok) throw new Error('Failed to fetch earnings');
        const earningsData = await earningsResponse.json();
        
        // Update total earnings display
        const totalEarningsElement = document.getElementById('totalEarningsValue');
        if (totalEarningsElement) {
            totalEarningsElement.textContent = formatCurrency(earningsData.total);
        }

        // Fetch attendance counts
        const attendanceResponse = await fetch(`${API_BASE_URL}/attendance-counts`);
        if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance');
        const attendanceData = await attendanceResponse.json();

        // Update attendance displays
        const elements = {
            'attendanceRegularValue': attendanceData.regular,
            'attendanceStudentValue': attendanceData.student,
            'attendanceMonthlyValue': attendanceData.monthly
        };

        for (const [elementId, value] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        }

    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
        // Optionally show error to user using SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update dashboard metrics. Please try again later.',
            confirmButtonColor: '#ea580c'
        });
    }
    
    // Immediately schedule the next update
    setTimeout(updateDashboardMetrics, 0);
}

// Loading animation
document.addEventListener('DOMContentLoaded', function() {
    const goToCustomerPageBtn = document.getElementById('goToCustomerPageBtn');
    
    if (goToCustomerPageBtn) {
        goToCustomerPageBtn.addEventListener('click', function() {
            // Show loading animation with SweetAlert2
            Swal.fire({
                title: '<h2>Customer Portal</h2>',
                html: `
                    <div class="flex flex-col items-center space-y-4 py-6">
                        <div class="simple-loading-spinner"></div>
                        <p>Loading, please wait...</p>
                    </div>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                customClass: {
                    popup: 'rounded-md bg-white border border-gray-300 shadow-lg',
                    htmlContainer: 'my-4 text-gray-700'
                },
                didOpen: () => {
                    // Add CSS for the simple loading spinner
                    const style = document.createElement('style');
                    style.textContent = `
                        .simple-loading-spinner {
                            width: 40px;
                            height: 40px;
                            border: 4px solid #ddd;
                            border-top: 4px solid #333;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        }
                        
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            });

            // Simulate loading time
            setTimeout(() => {
                // Show success message before redirecting
                Swal.fire({
                    html: `
                        <div class="flex flex-col items-center py-6">
                            <svg class="w-12 h-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <h3 class="text-lg font-semibold">Access Granted</h3>
                            <p class="text-gray-500">Redirecting to your dashboard...</p>
                        </div>
                    `,
                    showConfirmButton: false,
                    timer: 500,
                    customClass: {
                        popup: 'rounded-md bg-white border border-gray-300 shadow-lg'
                    }
                }).then(() => {
                    // Redirect to customer page
                    window.location.href = '../customer file/customer.html';
                });
            }, 500);
        });
    }



    
    // Initialize pie chart
    const pieCtx = document.getElementById('membershipPieChart').getContext('2d');
    const membershipPieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Regular', 'Student'],
            datasets: [{
                data: [30, 40], // Replace with actual data
                backgroundColor: [
                    'rgb(74, 222, 128)', // green-400 for Regular
                    'rgb(59, 130, 246)'  // blue-500 for Student
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Fetch member counts and update pie chart
    fetch(`${API_BASE_URL}/member-counts`)
        .then(response => response.json())
        .then(data => {
            membershipPieChart.data.datasets[0].data = [data.regular, data.student];
            membershipPieChart.update();
        })
        .catch(error => {
            console.error('Error fetching member counts:', error);
        });




        

    // Member Growth Chart
    const ctx = document.getElementById('memberGrowthChart');
    if (ctx) {
        fetch(`${API_BASE_URL}/monthly-members-chart`)
            .then(response => response.json())
            .then(data => {
                const monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];

                const labels = data.labels.map(month => monthNames[parseInt(month.split('-')[1]) - 1]);

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'New Monthly Members',
                            data: data.data,
                            backgroundColor: [
                                '#4f46e5', // January
                                '#22c55e', // February
                                '#f59e0b', // March
                                '#3b82f6', // April
                                '#ec4899', // May
                                '#6366f1', // June
                                '#10b981', // July
                                '#f472b6', // August
                                '#6b7280', // September
                                '#34d399', // October
                                '#a78bfa', // November
                                '#fcd34d'  // December
                            ]
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
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
    }

    // Initial load of metrics
    updateDashboardMetrics();
    // Initial load of due members
    loadDueMembers();
});

// Function to load members due within 7 days
async function loadDueMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members`);
        if (!response.ok) throw new Error('Failed to fetch members');
        
        const members = await response.json();
        const dueMembers = filterDueMembers(members);
        displayDueMembers(dueMembers);
    } catch (error) {
        console.error('Error loading due members:', error);
    }
    
    // Immediately schedule the next update
    setTimeout(loadDueMembers, 0);
}

// Filter members due within 7 days
function filterDueMembers(members) {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return members.filter(member => {
        const endDate = new Date(member.end_date);
        return endDate >= today && endDate <= sevenDaysFromNow;
    });
}

// Display due members in the dashboard
function displayDueMembers(dueMembers) {
    const dueSection = document.querySelector('.monthly-due-section');
    if (!dueSection) return;

    if (dueMembers.length === 0) {
        dueSection.innerHTML = '<p class="text-orange-800">No members due within the next 7 days</p>';
        return;
    }

    const membersList = dueMembers
        .map(member => `
            <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg mb-2 hover:bg-orange-100 transition-all">
                <div>
                    <h3 class="font-semibold text-orange-900">${member.member_name}</h3>
                    <p class="text-sm text-orange-600">Due: ${new Date(member.end_date).toLocaleDateString()}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">${member.status}</span>
            </div>
        `)
        .join('');

    dueSection.innerHTML = `
        <div class="space-y-2">
            <h3 class="text-lg font-semibold text-orange-900 mb-3">Members Due (Next 7 Days)</h3>
            ${membersList}
        </div>
    `;
}