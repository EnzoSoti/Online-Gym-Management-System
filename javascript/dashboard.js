document.addEventListener('DOMContentLoaded', function() {
    const goToCustomerPageBtn = document.getElementById('goToCustomerPageBtn');
    if (goToCustomerPageBtn) {
        goToCustomerPageBtn.addEventListener('click', function() {
            window.location.href = '../customer file/customer.html';
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

// Display due members in the monthly due date section
function displayDueMembers(dueMembers) {
    const dueSection = document.querySelector('.monthly-due-section');
    if (!dueSection) return;

    if (dueMembers.length === 0) {
        dueSection.innerHTML = '<p class="text-indigo-800">No members due within the next 7 days</p>';
        return;
    }

    const membersList = dueMembers
        .map(member => `
            <div class="flex justify-between items-center p-3 bg-indigo-50 rounded-lg mb-2 hover:bg-indigo-100 transition-all">
                <div>
                    <h3 class="font-semibold text-indigo-900">${member.member_name}</h3>
                    <p class="text-sm text-indigo-600">Due: ${new Date(member.end_date).toLocaleDateString()}</p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">${member.status}</span>
            </div>
        `)
        .join('');

    dueSection.innerHTML = `
        <div class="space-y-2">
            <h3 class="text-lg font-semibold text-indigo-900 mb-3">Members Due (Next 7 Days)</h3>
            ${membersList}
        </div>
    `;
}
