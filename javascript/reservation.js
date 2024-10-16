// Function to handle booking a reservation
function bookReservation(event) {
    event.preventDefault();

    const clientName = document.getElementById('client-name').value;
    const service = document.getElementById('service').value;
    const bookingDate = document.getElementById('booking-date').value;
    const timeIn = document.getElementById('time-in').value;
    const timeOut = document.getElementById('time-out').value || calculateTimeOut(timeIn);

    // Convert timeIn to a Date object for easier comparison
    const timeInDate = new Date(`1970-01-01T${timeIn}`);

    // Check if Time In is before 9:00 AM or at/after 12:00 AM (Gym Closed)
    const openTime = new Date(`1970-01-01T09:00:00`);
    const closeTime = new Date(`1970-01-01T23:59:59`);

    if (timeInDate < openTime || timeInDate >= closeTime) {
        Swal.fire({
            icon: 'error',
            title: 'Gym Closed',
            text: 'The gym is closed before 9:00 AM and after 12:00 Midnight. Please select another time.',
        });
        return; // Stop further execution
    }

    // card pop up
    const newReservationCard = document.createElement('div');
    newReservationCard.className = 'reservation-card bg-gray-200 p-4 mb-4 rounded-lg';

    newReservationCard.innerHTML = `
        <h3 class="text-sm font-bold text-orange-400">Reservation ID: #${Date.now()}</h3>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time In:</strong> ${timeIn}</p>
        <p><strong>Time Out:</strong> ${timeOut}</p>
        <p><strong>Client:</strong> ${clientName}</p>
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
}

// Function to calculate Time Out based on Time In (1 hour later)
function calculateTimeOut(timeIn) {
    const [hours, minutes] = timeIn.split(':').map(Number);
    const timeOutDate = new Date();
    timeOutDate.setHours(hours, minutes + 60); // Add 1 hour

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