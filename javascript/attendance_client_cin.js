// Store check-ins in memory (you might want to use localStorage or a backend database in production)
let checkIns = [];
let currentId = 1;

// Function to handle check-in form submission
function handleCheckin(event) {
    event.preventDefault();
    
    // Get form elements directly from the form
    const form = event.target;
    const clientName = form.querySelector('#client-name').value.trim();
    const timeIn = form.querySelector('#time-in').value;
    const clientType = form.querySelector('#client-type').value;

    if (!clientName) {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a client name',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
        return;
    }

    if (!timeIn) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select a check-in time',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
        return;
    }

    // Create new check-in object
    const newCheckIn = {
        id: currentId++,
        type: clientType.toLowerCase(),
        name: clientName,
        timeIn: timeIn
    };

    // Add to check-ins array
    checkIns.unshift(newCheckIn); // Add to beginning of array to show newest first

    // Update dashboard
    updateCheckInDashboard();

    // Show success message with auto-close and no buttons
    Swal.fire({
        title: 'Success!',
        text: 'Client has been checked in successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
    }).then(() => {
        // Clear form fields immediately after success message
        resetForm();
    });
}

// Function to reset the form with current time
function resetForm() {
    const form = document.getElementById('checkin-form');
    form.reset();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('time-in').value = currentTime;
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
                    checkIn.type === 'regular' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-green-50 text-green-700'
                }">
                    ${checkIn.type.charAt(0).toUpperCase() + checkIn.type.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${checkIn.name}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${formatTime(checkIn.timeIn)}</span>
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

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default time to current time
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('time-in').value = currentTime;
    
    // Initialize empty dashboard
    updateCheckInDashboard();
});