document.addEventListener('DOMContentLoaded', function() {
    const goToCustomerPageBtn = document.getElementById('goToCustomerPageBtn');
    
    if (goToCustomerPageBtn) {
        goToCustomerPageBtn.addEventListener('click', function() {
            // Show loading animation with SweetAlert2
            Swal.fire({
                title: '<h2 class="text-3xl font-black bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text">Customer Portal</h2>',
                html: `
                    <div class="flex flex-col items-center space-y-6 py-8">
                        <div class="loading-bars-container">
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                            <div class="loading-bar"></div>
                        </div>
                        <div class="flex items-center gap-2 mt-4">
                            <svg class="w-5 h-5 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p class="text-orange-400/90 font-medium tracking-wide">Initializing your experience</p>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                customClass: {
                    popup: 'rounded-3xl bg-gray-900 border border-orange-500/10 shadow-2xl shadow-orange-500/5',
                    htmlContainer: 'my-4'
                },
                didOpen: () => {
                    // Add the required CSS for the new animation
                    const style = document.createElement('style');
                    style.textContent = `
                        .loading-bars-container {
                            display: flex;
                            gap: 6px;
                            height: 60px;
                            align-items: flex-end;
                        }
                        
                        .loading-bar {
                            width: 8px;
                            background: linear-gradient(to top, #f97316, #fdba74);
                            border-radius: 4px;
                            animation: equalizer 1.2s ease-in-out infinite;
                        }
                        
                        .loading-bar:nth-child(1) {
                            animation-delay: -0.4s;
                            height: 20%;
                        }
                        
                        .loading-bar:nth-child(2) {
                            animation-delay: -0.2s;
                            height: 60%;
                        }
                        
                        .loading-bar:nth-child(3) {
                            animation-delay: 0s;
                            height: 40%;
                        }
                        
                        @keyframes equalizer {
                            0%, 100% {
                                transform: scaleY(1);
                            }
                            50% {
                                transform: scaleY(2);
                            }
                        }

                        .shadow-glow {
                            box-shadow: 0 0 40px -10px rgba(249, 115, 22, 0.3);
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
                        <div class="flex flex-col items-center gap-6 py-8">
                            <div class="success-checkmark">
                                <svg class="w-16 h-16" viewBox="0 0 24 24">
                                    <path class="checkmark-circle" 
                                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                                          fill="none" 
                                          stroke="#f97316" 
                                          stroke-width="2"
                                    />
                                    <path class="checkmark-check" 
                                          d="M8 12l3 3 5-5"
                                          fill="none" 
                                          stroke="#f97316" 
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <div class="text-center">
                                <h3 class="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 text-transparent bg-clip-text mb-2">
                                    Access Granted
                                </h3>
                                <p class="text-orange-400/80 text-sm">Redirecting to your personal dashboard...</p>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'rounded-3xl bg-gray-900 border border-orange-500/10 shadow-2xl shadow-orange-500/5'
                    },
                    didOpen: () => {
                        // Add animation for success checkmark
                        const style = document.createElement('style');
                        style.textContent = `
                            .success-checkmark {
                                animation: scale-in 0.3s ease-out;
                            }
                            
                            .checkmark-circle {
                                stroke-dasharray: 100;
                                stroke-dashoffset: 100;
                                animation: dash 1s ease-out forwards;
                            }
                            
                            .checkmark-check {
                                stroke-dasharray: 20;
                                stroke-dashoffset: 20;
                                animation: dash 0.5s ease-out 0.5s forwards;
                            }
                            
                            @keyframes scale-in {
                                0% {
                                    transform: scale(0.8);
                                    opacity: 0;
                                }
                                100% {
                                    transform: scale(1);
                                    opacity: 1;
                                }
                            }
                            
                            @keyframes dash {
                                to {
                                    stroke-dashoffset: 0;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }).then(() => {
                    // Redirect to customer page
                    window.location.href = '../customer file/customer.html';
                });
            }, 2000);
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
