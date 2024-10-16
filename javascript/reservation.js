
// Function to handle booking a reservation
function bookReservation(event) {
    event.preventDefault(); // Prevent form submission

    // Get form input values
    const clientName = document.getElementById('client-name').value;
    const service = document.getElementById('service').value;
    const bookingDate = document.getElementById('booking-date').value;
    const timeIn = document.getElementById('time-in').value; // Get Time In value
    const timeOut = document.getElementById('time-out').value || calculateTimeOut(timeIn); // Get Time Out value or calculate it

    // Create a new reservation card
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
    // Get the reservation card element
    const reservationCard = button.closest('.reservation-card');
    if (reservationCard) {
        reservationCard.remove(); // Remove the reservation card from the DOM
    }
}
