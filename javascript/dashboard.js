// loading style to go back and forth
document.addEventListener('DOMContentLoaded', function() {
    const goToCustomerPageBtn = document.getElementById('goToCustomerPageBtn');
    
    if (goToCustomerPageBtn) {
        goToCustomerPageBtn.addEventListener('click', function() {
            // Show loading animation with SweetAlert2
            Swal.fire({
                title: 'Loading Customer Portal',
                html: `
                    <div class="flex flex-col items-center space-y-4">
                        <div class="loader-ring">
                            <div class="loading">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <p class="text-gray-600 mt-4">Preparing your experience...</p>
                    </div>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                customClass: {
                    popup: 'rounded-xl shadow-xl',
                    title: 'text-xl font-semibold text-gray-800',
                    htmlContainer: 'my-4'
                },
                didOpen: () => {
                    // Add the required CSS for the loading animation
                    const style = document.createElement('style');
                    style.textContent = `
                        .loader-ring {
                            position: relative;
                            width: 60px;
                            height: 60px;
                        }
                        
                        .loading {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 60px;
                            height: 60px;
                        }
                        
                        .loading span {
                            position: absolute;
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: #3b82f6;
                            animation: animate 1.6s ease-in-out infinite;
                        }
                        
                        @keyframes animate {
                            0%, 100% {
                                transform: scale(0.8);
                                opacity: 0.5;
                            }
                            50% {
                                transform: scale(1.2);
                                opacity: 1;
                            }
                        }
                        
                        .loading span:nth-child(1) {
                            top: 0;
                            left: 50%;
                            transform: translateX(-50%);
                            animation-delay: 0s;
                        }
                        
                        .loading span:nth-child(2) {
                            top: 14px;
                            right: 14px;
                            animation-delay: 0.2s;
                        }
                        
                        .loading span:nth-child(3) {
                            right: 0;
                            top: 50%;
                            transform: translateY(-50%);
                            animation-delay: 0.4s;
                        }
                        
                        .loading span:nth-child(4) {
                            bottom: 14px;
                            right: 14px;
                            animation-delay: 0.6s;
                        }
                        
                        .loading span:nth-child(5) {
                            bottom: 0;
                            left: 50%;
                            transform: translateX(-50%);
                            animation-delay: 0.8s;
                        }
                    `;
                    document.head.appendChild(style);
                }
            });

            // Simulate loading time (you can remove this setTimeout if you want it to be instant)
            setTimeout(() => {
                // Show success message before redirecting
                Swal.fire({
                    icon: 'success',
                    title: 'Ready!',
                    text: 'Taking you to the customer portal...',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'rounded-xl shadow-xl',
                        title: 'text-xl font-semibold text-gray-800'
                    }
                }).then(() => {
                    // Redirect to customer page
                    window.location.href = '../customer file/customer.html';
                });
            }, 2000); // Simulated 2-second loading time
        });
    }
});

// Member Growth Chart
document.addEventListener('DOMContentLoaded', async function() {
    const ctx = document.getElementById('memberGrowthChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Monthly Members',
                    data: [30, 45, 38, 50, 65, 78],
                    backgroundColor: [
                        '#4f46e5', // January
                        '#22c55e', // February
                        '#f59e0b', // March
                        '#3b82f6', // April
                        '#ec4899', // May
                        '#6366f1'  // June
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
    } else {
        console.error('Could not find memberGrowthChart canvas element');
    }

    // Load and display due members initially
    await loadDueMembers();

    // Poll for updates every 5 minutes (300000 ms)
    setInterval(loadDueMembers, 300000);
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
