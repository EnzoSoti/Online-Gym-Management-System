const API_URL = 'http://localhost:3000/api';

// Function to update the current time and date
function updateDateTime() {
    const now = new Date();
    const timeDisplay = document.getElementById('current-time-monthly');
    const dateDisplay = document.getElementById('current-date-monthly');
    const timeDisplayForm = document.getElementById('current-time-display-monthly');

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    timeDisplay.textContent = timeString;
    dateDisplay.textContent = dateString;
    timeDisplayForm.textContent = timeString;
}

// Update the time and date every second
setInterval(updateDateTime, 1000);

// Function to handle the monthly check-in
async function handleMonthlyCheckin(event) {
    event.preventDefault();

    const clientName = document.getElementById('monthly-client-name').value;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Fetch the list of monthly members to check if the member exists
    try {
        const response = await fetch(`${API_URL}/monthly-members`);
        const members = await response.json();

        const memberExists = members.some(member => member.member_name.toLowerCase() === clientName.toLowerCase());

        if (!memberExists) {
            Swal.fire({
                title: 'Error!',
                text: 'Member not found in the database.',
                icon: 'error',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        // Find the member object to get the ID
        const member = members.find(member => member.member_name.toLowerCase() === clientName.toLowerCase());

        // Check if the member's status is "Active"
        if (member.status !== 'Active') {
            Swal.fire({
                title: 'Error!',
                text: `Member status is ${member.status}. Cannot check in.`,
                icon: 'error',
                confirmButtonColor: '#4F46E5'
            });
            return;
        }

        // Add the check-in to the table
        const checkinsBody = document.getElementById('monthly-checkins-body');
        const newRow = document.createElement('tr');
        newRow.className = 'hover:bg-slate-50 transition-colors duration-200';
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-slate-900">${member.id}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${clientName}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${
                    member.status === 'Active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                }">
                    ${member.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${new Date(member.start_date).toLocaleDateString()}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${new Date(member.end_date).toLocaleDateString()}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${calculateDaysLeft(member.end_date)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${currentTime}</span>
            </td>
        `;
        checkinsBody.appendChild(newRow);

        // Store the check-in data in localStorage
        const checkins = JSON.parse(localStorage.getItem('monthlyCheckins')) || [];
        checkins.push({
            id: member.id,
            clientName: clientName,
            status: member.status,
            startDate: member.start_date,
            endDate: member.end_date,
            timeIn: currentTime
        });
        localStorage.setItem('monthlyCheckins', JSON.stringify(checkins));

        // Clear the form
        document.getElementById('monthly-checkin-form').reset();

        // Show success message with auto-close and no buttons
        Swal.fire({
            title: 'Success!',
            text: 'Client has been checked in successfully',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

    } catch (error) {
        console.error('Error fetching monthly members:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to fetch monthly members. Please try again.',
            icon: 'error',
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Function to calculate days left
function calculateDaysLeft(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Function to load check-ins from localStorage
function loadCheckins() {
    const checkins = JSON.parse(localStorage.getItem('monthlyCheckins')) || [];
    const checkinsBody = document.getElementById('monthly-checkins-body');
    checkinsBody.innerHTML = ''; // Clear existing rows

    checkins.forEach(checkIn => {
        const newRow = document.createElement('tr');
        newRow.className = 'hover:bg-slate-50 transition-colors duration-200';
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-slate-900">${checkIn.id}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${checkIn.clientName}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-medium ${
                    checkIn.status === 'Active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                }">
                    ${checkIn.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${new Date(checkIn.startDate).toLocaleDateString()}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${new Date(checkIn.endDate).toLocaleDateString()}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${calculateDaysLeft(checkIn.endDate)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-slate-900">${checkIn.timeIn}</span>
            </td>
        `;
        checkinsBody.appendChild(newRow);
    });
}

// Function to clear check-ins at 11:59 PM
function clearCheckinsAtMidnight() {
    localStorage.removeItem('monthlyCheckins');
    const checkinsBody = document.getElementById('monthly-checkins-body');
    checkinsBody.innerHTML = ''; // Clear existing rows
}

// Function to check if it's 11:59 PM
function isMidnight() {
    const now = new Date();
    return now.getHours() === 23 && now.getMinutes() === 59;
}

// Function to check time and clear if 11:59 PM
function checkTimeAndClear() {
    if (isMidnight()) {
        clearCheckinsAtMidnight();
    }
}

// Initialize the date and time display
updateDateTime();

// Load check-ins from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCheckins();
    setInterval(checkTimeAndClear, 60000); // Check every minute

    // Autocomplete functionality
    const clientNameInput = document.getElementById('monthly-client-name');
    const suggestionsContainer = document.getElementById('suggestions');

    let allMembers = [];

    // Fetch all members from the API
    async function fetchAllMembers() {
        try {
            const response = await fetch(`${API_URL}/monthly-members`);
            allMembers = await response.json();
        } catch (error) {
            console.error('Error fetching monthly members for autocomplete:', error);
        }
    }

    // Display suggestions based on input
    function displaySuggestions(query) {
        suggestionsContainer.innerHTML = '';
        const matchingMembers = allMembers
            .filter(member => member.status === 'Active')
            .filter(member => member.member_name.toLowerCase().includes(query));

        matchingMembers.forEach(member => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = member.member_name;
            suggestionItem.classList.add('p-2', 'cursor-pointer', 'hover:bg-slate-100');
            suggestionItem.addEventListener('click', () => {
                clientNameInput.value = member.member_name;
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.classList.add('hidden');
            });
            suggestionsContainer.appendChild(suggestionItem);
        });

        if (matchingMembers.length > 0) {
            suggestionsContainer.classList.remove('hidden');
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    }

    // Fetch all members on page load
    fetchAllMembers();

    // Event listener for input changes
    clientNameInput.addEventListener('input', () => {
        const query = clientNameInput.value.toLowerCase();
        displaySuggestions(query);
    });

    // Event listener for focus on input
    clientNameInput.addEventListener('focus', () => {
        const query = clientNameInput.value.toLowerCase();
        displaySuggestions(query);
    });

    // Hide suggestions when clicking outside the input field
    document.addEventListener('click', (event) => {
        if (event.target !== clientNameInput && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.add('hidden');
        }
    });

    // Function to update the list of monthly members every second
    async function updateMonthlyMembers() {
        try {
            const response = await fetch(`${API_URL}/monthly-members`);
            allMembers = await response.json();
        } catch (error) {
            console.error('Error fetching monthly members:', error);
        }
    }

    // Function to update the check-ins table every second
    function updateCheckinsTable() {
        const checkins = JSON.parse(localStorage.getItem('monthlyCheckins')) || [];
        const checkinsBody = document.getElementById('monthly-checkins-body');
        checkinsBody.innerHTML = ''; // Clear existing rows

        checkins.forEach(checkIn => {
            const newRow = document.createElement('tr');
            newRow.className = 'hover:bg-slate-50 transition-colors duration-200';
            newRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-medium text-slate-900">${checkIn.id}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-slate-900">${checkIn.clientName}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${
                        checkIn.status === 'Active' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                    }">
                        ${checkIn.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-slate-900">${new Date(checkIn.startDate).toLocaleDateString()}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-slate-900">${new Date(checkIn.endDate).toLocaleDateString()}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-slate-900">${calculateDaysLeft(checkIn.endDate)}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-slate-900">${checkIn.timeIn}</span>
                </td>
            `;
            checkinsBody.appendChild(newRow);
        });
    }

    // Update the list of monthly members and check-ins table every second
    setInterval(() => {
        updateMonthlyMembers();
        updateCheckinsTable();
    }, 1000);
});