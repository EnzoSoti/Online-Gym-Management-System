// Initialize check-ins from API
let checkIns = [];

// Function to check if it's midnight
function isMidnight() {
    const now = new Date();
    return now.getHours() === 0 && now.getMinutes() === 0;
}

function updateClock() {
    const now = new Date();
    // Get the current time in the desired format
    const currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    // Get the current date in the desired format
    const currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
    // Update the clock and date elements
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    timeElement.textContent = currentTime;
    dateElement.textContent = currentDate;

    // Change font color based on the time
    if (currentTime === "12:00:00 AM") {
        timeElement.classList.add('text-red-300'); // magiging red pag 12am na
    } else if (currentTime === "09:00:00 AM") {
        timeElement.classList.remove('text-red-300'); // back to normal kapag 9am na
    }
}

// Update the clock every second
setInterval(updateClock, 1000);


// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// Function to clear check-ins at midnight
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

// Function to check time and clear if midnight
function checkTimeAndClear() {
    if (isMidnight()) {
        clearCheckInsAtMidnight();
    }
}

// Function to fetch check-ins from API
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
        Swal.fire({
            title: 'Error!',
            text: 'Failed to load check-ins',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Function to handle check-in form submission
async function handleCheckin(event) {
    event.preventDefault();
    
    // Get form elements directly from the form
    const form = event.target;
    const clientName = form.querySelector('#client-name').value.trim();
    const clientType = form.querySelector('#client-type').value;
    
    // Get current time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!clientName) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a client name',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
        return;
    }

    try {
        // Send check-in data to API
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

        // Show success message with auto-close and no buttons
        Swal.fire({
            text: 'Client Checked In Successfully',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            // Clear form fields immediately after success message
            resetForm();
        });

        // Fetch updated check-ins to refresh the table
        await fetchCheckIns();
    } catch (error) {
        console.error('Error recording check-in:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to record check-in',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Function to reset the form
function resetForm() {
    const form = document.getElementById('checkin-form');
    form.reset();
}

// Function to update the current time display
function updateCurrentTime() {
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('current-time-display').textContent = currentTime;
}

// Function to update the check-in dashboard
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

// Function to format time for display
function formatTime(time) {
    return new Date(`2000/01/01 ${time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Calculate time until next midnight
function getTimeUntilMidnight() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
}

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update time immediately and then every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Fetch initial check-ins
    fetchCheckIns();

    // Set up periodic refresh (every 30 seconds)
    setInterval(fetchCheckIns, 30000);

    // Set up midnight check (every minute)
    setInterval(checkTimeAndClear, 60000);

    // Schedule first midnight clear
    setTimeout(() => {
        clearCheckInsAtMidnight();
        // Set up daily clearing after the first clear
        setInterval(clearCheckInsAtMidnight, 24 * 60 * 60 * 1000);
    }, getTimeUntilMidnight());
});