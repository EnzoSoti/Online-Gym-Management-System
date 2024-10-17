
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

// Function to handle booking a reservation
function bookReservation(event) {
    event.preventDefault();

    // Collect main client and additional participant names
    const clientName = document.getElementById('client-name').value;
    const participantNames = [clientName];  // Add the main client to the list

    for (let i = 2; i <= participantCount; i++) {
        const participantField = document.getElementById(`participant-${i}`);
        if (participantField) {
            participantNames.push(participantField.value);
        }
    }

    const service = document.getElementById('service').value;
    const bookingDate = document.getElementById('booking-date').value;
    const timeIn = document.getElementById('time-in').value;
    const timeOut = document.getElementById('time-out').value || calculateTimeOut(timeIn);

    // Convert timeIn to a Date object for easier comparison
    const timeInDate = new Date(`1970-01-01T${timeIn}`);
    const openTime = new Date(`1970-01-01T09:00:00`);
    const closeTime = new Date(`1970-01-01T23:59:59`);

    if (timeInDate < openTime || timeInDate >= closeTime) {
        Swal.fire({
            icon: 'error',
            title: 'Gym Closed',
            text: 'The gym is closed before 9:00 AM and after 12:00 Midnight. Please select another time.',
        });
        return; // Stop
    }

    // card pop-up
    const newReservationCard = document.createElement('div');
    newReservationCard.className = 'reservation-card bg-gray-200 p-4 mb-4 rounded-lg';

    newReservationCard.innerHTML = `
        <h3 class="text-sm font-bold text-orange-400">Reservation ID: #${Date.now()}</h3>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time In:</strong> ${timeIn}</p>
        <p><strong>Time Out:</strong> ${timeOut}</p>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Participants:</strong> ${participantNames.join(', ')}</p>
        <p><strong>Service:</strong> ${service}</p>
        <span class="status-badge bg-green-500 text-black px-2 py-1 rounded-lg">Confirmed</span>
        <div class="mt-4 flex justify-between">
            <button class="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600" style="margin-right: 4px;">Edit</button>
            <button class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600" onclick="cancelReservation(this)">Cancel</button>
        </div>
    `;

    // Append the new reservation card to the reservations container
    const reservationsContainer = document.getElementById('reservations-container');
    reservationsContainer.appendChild(newReservationCard);

    // Show a success message
    Swal.fire({
        icon: 'success',
        title: 'Reservation Booked',
        text: 'Your reservation has been successfully booked.',
    });

    // Optionally, reset the form after booking
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

    return `${formattedHours}:${formattedMinutes}`;
}

// Function to cancel/delete a reservation
function cancelReservation(button) {
    const reservationCard = button.closest('.reservation-card');
    if (reservationCard) {
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
                reservationCard.remove(); // Remove the reservation card from the DOM
                Swal.fire(
                    'Cancelled!',
                    'Your reservation has been cancelled.',
                    'success'
                );
            }
        });
    }
}
