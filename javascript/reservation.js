let participantCount = 1;
const maxParticipants = 9;

// Function to add more participants
function addParticipant() {
    if (participantCount < maxParticipants) {
        participantCount++;
        const additionalClientsDiv = document.getElementById('additional-clients');
        
        // Create a new input field for each participant
        const newParticipantField = document.createElement('input');
        newParticipantField.type = 'text';
        newParticipantField.placeholder = `Enter name of participant ${participantCount}`;
        newParticipantField.className = 'border-2 border-gray-400 p-2 rounded-lg w-full mt-2';
        newParticipantField.id = `participant-${participantCount}`;
        newParticipantField.required = true;
        
        // Append the new input field to the "additional-clients" div
        additionalClientsDiv.appendChild(newParticipantField);
    } else {
        alert("Maximum 9 participants allowed, including the main client.");
    }
}

// Helper function to check for time overlap
function isTimeOverlap(existingStart, existingEnd, newStart, newEnd) {
    return (newStart < existingEnd && newEnd > existingStart);
}

// Function to check if a time slot is available
function isTimeSlotAvailable(date, timeIn, timeOut, service) {
    const rows = document.querySelectorAll('#reservations-body tr');
    const newBookingStart = new Date(`${date}T${timeIn}`);
    const newBookingEnd = new Date(`${date}T${timeOut}`);

    for (let row of rows) {
        const rowDate = row.cells[1].textContent;
        const rowTimeIn = convertTo24HourFormat(row.cells[2].textContent);
        const rowTimeOut = convertTo24HourFormat(row.cells[3].textContent);
        const rowService = row.cells[5].textContent;

        // Only check conflicts for the same service and date
        if (rowDate === date && rowService === service) {
            const existingStart = new Date(`${date}T${rowTimeIn}`);
            const existingEnd = new Date(`${date}T${rowTimeOut}`);

            if (isTimeOverlap(existingStart, existingEnd, newBookingStart, newBookingEnd)) {
                return false;
            }
        }
    }
    return true;
}

// New helper function to convert 24-hour time to 12-hour format
function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// New helper function to convert 12-hour time to 24-hour format
function convertTo24HourFormat(time12) {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Function to handle booking a reservation
function bookReservation(event) {
    event.preventDefault();

    // Collect main client and additional participant names
    const clientName = document.getElementById('client-name').value;
    const participantNames = [clientName];  // Add the main client to the list

    for (let i = 2; i <= participantCount; i++) {
        const participantField = document.getElementById(`participant-${i}`);
        if (participantField && participantField.value.trim() !== '') {
            participantNames.push(participantField.value.trim());
        }
    }

    const service = document.getElementById('service').value;
    const bookingDate = document.getElementById('booking-date').value;
    const timeIn = document.getElementById('time-in').value;
    const timeOut = document.getElementById('time-out').value || calculateTimeOut(timeIn);

    // Check if the time slot is available
    if (!isTimeSlotAvailable(bookingDate, timeIn, timeOut, service)) {
        Swal.fire({
            icon: 'error',
            title: 'Time Slot Not Available',
            text: 'This time slot is already booked for the selected service. Please choose a different time or date.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    // Convert timeIn to a Date object for easier comparison
    const timeInDate = new Date(`1970-01-01T${timeIn}`);
    const openTime = new Date(`1970-01-01T09:00:00`);
    const closeTime = new Date(`1970-01-01T23:59:59`);

    if (timeInDate < openTime || timeInDate >= closeTime) {
        Swal.fire({
            icon: 'error',
            title: 'Gym Closed',
            text: 'The gym is closed before 9:00 AM and after 12:00 Midnight. Please select another time.',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const timeIn12 = convertTo12HourFormat(timeIn);
    const timeOut12 = convertTo12HourFormat(timeOut);

    // Create a new table row
    const reservationId = Date.now();
    const newRow = document.createElement('tr');
    newRow.className = 'bg-white border-b';
    newRow.innerHTML = `
        <td class="px-6 py-4">#${reservationId}</td>
        <td class="px-6 py-4">${bookingDate}</td>
        <td class="px-6 py-4">${timeIn12}</td>
        <td class="px-6 py-4">${timeOut12}</td>
        <td class="px-6 py-4">${clientName}</td>
        <td class="px-6 py-4">${service}</td>
        <td class="px-6 py-4"><span class="status-badge bg-green-500 text-black px-2 py-1 rounded-lg">Confirmed</span></td>
        <td class="px-6 py-4">
            <button class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2" onclick="viewReservation(${reservationId})">View</button>
            <button class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600" onclick="cancelReservation(${reservationId})">Cancel</button>
        </td>
    `;

    // Store additional participants in a data attribute
    newRow.dataset.participants = JSON.stringify(participantNames.slice(1));

    // Append the new row to the table body
    const tableBody = document.getElementById('reservations-body');
    tableBody.appendChild(newRow);

    // Show a success message
    Swal.fire({
        icon: 'success',
        title: 'Reservation Booked',
        text: 'Your reservation has been successfully booked.',
        confirmButtonColor: '#3085d6'
    });

    // Reset the form after booking
    document.getElementById('booking-form').reset();
    document.getElementById('additional-clients').innerHTML = '';  // Clear additional participants
    participantCount = 1;  // Reset participant count
}

// Function to calculate Time Out based on Time In (1 hour later)
function calculateTimeOut(timeIn) {
    const [hours, minutes] = timeIn.split(':').map(Number);
    const timeOutDate = new Date();
    timeOutDate.setHours(hours, minutes + 60);

    // Format Time Out to HH:MM
    const formattedHours = String(timeOutDate.getHours()).padStart(2, '0');
    const formattedMinutes = String(timeOutDate.getMinutes()).padStart(2, '0');

    return convertTo12HourFormat(`${formattedHours}:${formattedMinutes}`);
}

// Function to view reservation details
function viewReservation(reservationId) {
    console.log("viewReservation called with ID:", reservationId);

    try {
        const rows = document.querySelectorAll('#reservations-body tr');
        let targetRow;
        for (let row of rows) {
            if (row.cells[0].textContent === `#${reservationId}`) {
                targetRow = row;
                break;
            }
        }

        if (!targetRow) {
            throw new Error(`Reservation with ID ${reservationId} not found`);
        }

        const cells = targetRow.cells;

        // Extract data from the table row
        const date = cells[1].textContent;
        const timeIn = cells[2].textContent;
        const timeOut = cells[3].textContent;
        const mainClient = cells[4].textContent;
        const service = cells[5].textContent;
        const status = cells[6].querySelector('.status-badge').textContent;

        // Retrieve additional participants from the data attribute
        const additionalParticipants = JSON.parse(targetRow.dataset.participants || '[]');

        // Create the content for the modal
        let modalContent = `
            <div class="text-left">
                <p><strong>Reservation ID:</strong> #${reservationId}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${timeIn} - ${timeOut}</p>
                <p><strong>Main Client:</strong> ${mainClient}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Additional Participants:</strong></p>
                <ul>
        `;

        // Add additional participants to the modal content
        additionalParticipants.forEach(participant => {
            modalContent += `<li>${participant}</li>`;
        });

        modalContent += `
                </ul>
            </div>
        `;

        // Show the modal with reservation details
        Swal.fire({
            title: 'Reservation Details',
            html: modalContent,
            icon: 'info',
            confirmButtonText: 'Close',
            confirmButtonColor: '#3085d6'
        });
    } catch (error) {
        console.error("Error in viewReservation:", error);
        Swal.fire({
            title: 'Error',
            text: 'Could not retrieve reservation details. ' + error.message,
            icon: 'error',
            confirmButtonColor: '#3085d6'
        });
    }
}

// Function to cancel/delete a reservation
function cancelReservation(reservationId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Find the row with the matching reservation ID and remove it
            const rows = document.querySelectorAll('#reservations-body tr');
            for (let row of rows) {
                if (row.cells[0].textContent === `#${reservationId}`) {
                    row.remove();
                    Swal.fire(
                        'Cancelled!',
                        'Your reservation has been cancelled.',
                        'success'
                    );
                    return;
                }
            }
            // If we get here, we didn't find the row
            Swal.fire(
                'Error',
                'Could not find the reservation to cancel.',
                'error'
            );
        }
    });
}

// Function to clear the reservations table (if needed)
function clearReservationsTable() {
    const tableBody = document.getElementById('reservations-body');
    tableBody.innerHTML = '';
}

// Event listener to clear the table when the page loads (if needed)
document.addEventListener('DOMContentLoaded', function() {
    clearReservationsTable();
});