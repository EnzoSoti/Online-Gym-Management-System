// ========== Initialize Variables ==========
let checkIns = []; // Initialize check-ins from API

// ========== Time Functions ==========
function isMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0;
}

function updateClock() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    timeElement.textContent = currentTime;
    dateElement.textContent = currentDate;

    if (currentTime === "12:00:00 AM") {
        timeElement.classList.add('text-red-300'); 
    } else if (currentTime === "09:00:00 AM") {
        timeElement.classList.remove('text-red-300');
    }
}

// Update the clock every second
setInterval(updateClock, 1000);
updateClock();

// ========== Check-in Functions ==========
async function clearCheckInsAtMidnight() {
    try {
        const response = await fetch('http://localhost:3000/api/check-ins', {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear check-ins');
        }
        
        checkIns = [];
        updateCheckInDashboard();
        console.log('Check-ins cleared successfully at midnight');
    } catch (error) {
        console.error('Error clearing check-ins:', error);
    }
}

function checkTimeAndClear() {
    if (isMidnight()) {
        clearCheckInsAtMidnight();
    }
}

// ========== Fetch Data Functions ==========
async function fetchCheckIns() {
    try {
        const response = await fetch('http://localhost:3000/api/check-ins');
        if (!response.ok) {
            throw new Error('Failed to fetch check-ins');
        }
        const data = await response.json();
        checkIns = data;
        updateCheckInDashboard();
    } catch (error) {
        console.error('Error fetching check-ins:', error);
        Toastify({
            text: 'Failed to load check-ins',
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#EF4444",
            stopOnFocus: true
        }).showToast();
    }
}

async function handleCheckin(event) {
    event.preventDefault();
    
    const form = event.target;
    const clientName = form.querySelector('#client-name').value.trim();
    const clientType = form.querySelector('#client-type').value;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!clientName) {
        Toastify({
            text: 'Please enter a client name',
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#EF4444",
            stopOnFocus: true
        }).showToast();
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/check-ins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_type: clientType.toLowerCase(),
                client_name: clientName,
                time_in: currentTime
            })
        });

        if (!response.ok) {
            throw new Error('Failed to record check-in');
        }

        Toastify({
            text: 'Client Checked In Successfully',
            duration: 1500,
            gravity: "top",
            position: "right",
            backgroundColor: "#10B981",
            stopOnFocus: true
        }).showToast();

        resetForm();
        await fetchCheckIns();
    } catch (error) {
        console.error('Error recording check-in:', error);
        Toastify({
            text: 'Failed to record check-in',
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#EF4444",
            stopOnFocus: true
        }).showToast();
    }
}

function resetForm() {
    const form = document.getElementById('checkin-form');
    form.reset();
}

// ========== Time and Formatting Functions ==========
function updateCurrentTime() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('current-time-display').textContent = currentTime;
}

function formatTime(time) {
    return new Date(`2000/01/01 ${time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
}

// ========== Table Row Rendering ==========
function updateCheckInDashboard() {
    const tbody = document.getElementById('checkins-body');
    tbody.innerHTML = ''; // Clear existing rows

    checkIns.forEach(checkIn => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 transition-colors duration-200';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-slate-900">${checkIn.id}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${
                    checkIn.client_type === 'regular' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-green-50 text-green-700'
                }">
                    ${checkIn.client_type.charAt(0).toUpperCase() + checkIn.client_type.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${checkIn.client_name}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${formatTime(checkIn.time_in)}</span>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', () => {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    fetchCheckIns();
    setInterval(fetchCheckIns, 30000);
    setInterval(checkTimeAndClear, 60000);

    setTimeout(() => {
        clearCheckInsAtMidnight();
        setInterval(clearCheckInsAtMidnight, 24 * 60 * 60 * 1000);
    }, getTimeUntilMidnight());
});
