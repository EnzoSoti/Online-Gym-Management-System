
// let participantCount = 1;
// const maxParticipants = 8;

// // Function to add more participants
// function addParticipant() {
//     if (participantCount < maxParticipants) {
//         participantCount++;
//         const additionalClientsDiv = document.getElementById('additional-clients');
        
//         // Create a container div for the participant field and remove button
//         const participantContainer = document.createElement('div');
//         participantContainer.className = 'flex items-center gap-2 mt-2';
//         participantContainer.id = `participant-container-${participantCount}`;
        
//         // Create a new input field for each participant
//         const newParticipantField = document.createElement('input');
//         newParticipantField.type = 'text';
//         newParticipantField.placeholder = `Enter name of participant ${participantCount}`;
//         newParticipantField.className = 'border-2 border-gray-400 p-2 rounded-lg w-full';
//         newParticipantField.id = `participant-${participantCount}`;
//         newParticipantField.required = true;
        
//         // Create remove button
//         const removeButton = document.createElement('button');
//         removeButton.type = 'button';
//         removeButton.className = 'bg-red-500 text-white p-2 rounded-lg hover:bg-red-600';
//         removeButton.innerHTML = '×';
//         removeButton.onclick = () => removeParticipant(participantCount);
        
//         // Append elements to container
//         participantContainer.appendChild(newParticipantField);
//         participantContainer.appendChild(removeButton);
        
//         // Append the container to the "additional-clients" div
//         additionalClientsDiv.appendChild(participantContainer);
//     } else {
//         Swal.fire({
//             title: 'Error',
//             text: 'Maximum 8 participants allowed, including the main client.',
//             icon: 'error'
//         });
//     }
// }

// // Function to remove a participant
// function removeParticipant(participantNumber) {
//     const containerToRemove = document.getElementById(`participant-container-${participantNumber}`);
//     if (containerToRemove) {
//         containerToRemove.remove();
//         participantCount--;
        
//         // Reorder remaining participants
//         const additionalClientsDiv = document.getElementById('additional-clients');
//         const remainingContainers = additionalClientsDiv.children;
//         let newCount = 2;
        
//         for (let container of remainingContainers) {
//             container.id = `participant-container-${newCount}`;
//             const input = container.querySelector('input');
//             input.id = `participant-${newCount}`;
//             input.placeholder = `Enter name of participant ${newCount}`;
//             const removeBtn = container.querySelector('button');
//             removeBtn.onclick = () => removeParticipant(newCount);
//             newCount++;
//         }
//     }
// }

// // Helper function to check for time overlap
// function isTimeOverlap(existingStart, existingEnd, newStart, newEnd) {
//     return (newStart < existingEnd && newEnd > existingStart);
// }

// // Function to check if a time slot is available
// function isTimeSlotAvailable(date, timeIn, timeOut, service) {
//     const rows = document.querySelectorAll('#reservations-body tr');
//     const newBookingStart = new Date(`${date}T${timeIn}`);
//     const newBookingEnd = new Date(`${date}T${timeOut}`);

//     for (let row of rows) {
//         const rowDate = row.cells[1].textContent;
//         const rowTimeIn = convertTo24HourFormat(row.cells[2].textContent);
//         const rowTimeOut = convertTo24HourFormat(row.cells[3].textContent);
//         const rowService = row.cells[5].textContent;

//         // Only check conflicts for the same service and date
//         if (rowDate === date && rowService === service) {
//             const existingStart = new Date(`${date}T${rowTimeIn}`);
//             const existingEnd = new Date(`${date}T${rowTimeOut}`);

//             if (isTimeOverlap(existingStart, existingEnd, newBookingStart, newBookingEnd)) {
//                 return false;
//             }
//         }
//     }
//     return true;
// }

// // New helper function to convert 24-hour time to 12-hour format
// function convertTo12HourFormat(time24) {
//     const [hours, minutes] = time24.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const hours12 = hours % 12 || 12;
//     return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
// }

// // New helper function to convert 12-hour time to 24-hour format
// function convertTo24HourFormat(time12) {
//     const [time, period] = time12.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
//     if (period === 'PM' && hours !== 12) hours += 12;
//     if (period === 'AM' && hours === 12) hours = 0;
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
// }

// // Function to handle booking a reservation
// function bookReservation(event) {
//     event.preventDefault();

//     // Collect main client and additional participant names
//     const clientName = document.getElementById('client-name').value;
//     const participantNames = [clientName];  // Add the main client to the list

//     const additionalClientsDiv = document.getElementById('additional-clients');
//     const participantInputs = additionalClientsDiv.querySelectorAll('input');
//     participantInputs.forEach(input => {
//         if (input.value.trim() !== '') {
//             participantNames.push(input.value.trim());
//         }
//     });

//     for (let i = 2; i <= participantCount; i++) {
//         const participantField = document.getElementById(`participant-${i}`);
//         if (participantField && participantField.value.trim() !== '') {
//             participantNames.push(participantField.value.trim());
//         }
//     }

//     const service = document.getElementById('service').value;
//     const bookingDate = document.getElementById('booking-date').value;
//     const timeIn = document.getElementById('time-in').value;
//     const timeOut = document.getElementById('time-out').value || calculateTimeOut(timeIn);

//     // Check if the time slot is available
//     if (!isTimeSlotAvailable(bookingDate, timeIn, timeOut, service)) {
//         Swal.fire({
//             icon: 'error',
//             title: 'Time Slot Not Available',
//             text: 'This time slot is already booked for the selected service. Please choose a different time or date.',
//             confirmButtonColor: '#3085d6'
//         });
//         return;
//     }

//     // // Convert timeIn to a Date object for easier comparison
//     // const timeInDate = new Date(`1970-01-01T${timeIn}`);
//     // const openTime = new Date(`1970-01-01T09:00:00`);
//     // const closeTime = new Date(`1970-01-01T23:59:59`);

//     // if (timeInDate < openTime || timeInDate >= closeTime) {
//     //     Swal.fire({
//     //         icon: 'error',
//     //         title: 'Gym Closed',
//     //         text: 'The gym is closed before 9:00 AM and after 12:00 Midnight. Please select another time.',
//     //         confirmButtonColor: '#3085d6'
//     //     });
//     //     return;
//     // }

//     const timeIn12 = convertTo12HourFormat(timeIn);
//     const timeOut12 = convertTo12HourFormat(timeOut);

//     // Create a new table row
//     const reservationId = Date.now();
//     const newRow = document.createElement('tr');
//     newRow.className = 'bg-white border-b';
//     newRow.innerHTML = `
//         <td class="px-6 py-4">#${reservationId}</td>
//         <td class="px-6 py-4">${bookingDate}</td>
//         <td class="px-6 py-4">${timeIn12}</td>
//         <td class="px-6 py-4">${timeOut12}</td>
//         <td class="px-6 py-4">${clientName}</td>
//         <td class="px-6 py-4">${service}</td>
//         <td class="px-6 py-4"><span class="status-badge bg-green-500 text-black px-2 py-1 rounded-lg">Confirmed</span></td>
//         <td class="px-6 py-4">
//             <button class="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 mr-2" onclick="viewReservation(${reservationId})">View</button>
//             <button class="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600" onclick="cancelReservation(${reservationId})">Cancel</button>
//         </td>
//     `;

//     // Store additional participants in a data attribute
//     newRow.dataset.participants = JSON.stringify(participantNames.slice(1));

//     // Append the new row to the table body
//     const tableBody = document.getElementById('reservations-body');
//     tableBody.appendChild(newRow);

//     // Show a success message
//     Swal.fire({
//         icon: 'success',
//         title: 'Reservation Booked',
//         text: 'Your reservation has been successfully booked.',
//         confirmButtonColor: '#3085d6'
//     });

//     // Reset the form after booking
//     document.getElementById('booking-form').reset();
//     document.getElementById('additional-clients').innerHTML = '';  // Clear additional participants
//     participantCount = 1;  // Reset participant count
// }

// // Function to calculate Time Out based on Time In (1 hour later)
// function calculateTimeOut(timeIn) {
//     const [hours, minutes] = timeIn.split(':').map(Number);
//     const timeOutDate = new Date();
//     timeOutDate.setHours(hours, minutes + 60);

//     // Format Time Out to HH:MM
//     const formattedHours = String(timeOutDate.getHours()).padStart(2, '0');
//     const formattedMinutes = String(timeOutDate.getMinutes()).padStart(2, '0');

//     return convertTo12HourFormat(`${formattedHours}:${formattedMinutes}`);
// }

// // Function to view reservation details
// function viewReservation(reservationId) {
//     console.log("viewReservation called with ID:", reservationId);

//     try {
//         const rows = document.querySelectorAll('#reservations-body tr');
//         let targetRow;
//         for (let row of rows) {
//             if (row.cells[0].textContent === `#${reservationId}`) {
//                 targetRow = row;
//                 break;
//             }
//         }

//         if (!targetRow) {
//             throw new Error(`Reservation with ID ${reservationId} not found`);
//         }

//         const cells = targetRow.cells;

//         // Extract data from the table row
//         const date = cells[1].textContent;
//         const timeIn = cells[2].textContent;
//         const timeOut = cells[3].textContent;
//         const mainClient = cells[4].textContent;
//         const service = cells[5].textContent;
//         const status = cells[6].querySelector('.status-badge').textContent;

//         // Retrieve additional participants from the data attribute
//         const additionalParticipants = JSON.parse(targetRow.dataset.participants || '[]');

//         // Create the content for the modal
//         let modalContent = `
//             <div class="text-left">
//                 <p><strong>Reservation ID:</strong> #${reservationId}</p>
//                 <p><strong>Date:</strong> ${date}</p>
//                 <p><strong>Time:</strong> ${timeIn} - ${timeOut}</p>
//                 <p><strong>Main Client:</strong> ${mainClient}</p>
//                 <p><strong>Service:</strong> ${service}</p>
//                 <p><strong>Status:</strong> ${status}</p>
//                 <p><strong>Additional Participants:</strong></p>
//                 <ul>
//         `;

//         // Add additional participants to the modal content
//         additionalParticipants.forEach(participant => {
//             modalContent += `<li>${participant}</li>`;
//         });

//         modalContent += `
//                 </ul>
//             </div>
//         `;

//         // Show the modal with reservation details
//         Swal.fire({
//             title: 'Reservation Details',
//             html: modalContent,
//             icon: 'info',
//             confirmButtonText: 'Close',
//             confirmButtonColor: '#3085d6'
//         });
//     } catch (error) {
//         console.error("Error in viewReservation:", error);
//         Swal.fire({
//             title: 'Error',
//             text: 'Could not retrieve reservation details. ' + error.message,
//             icon: 'error',
//             confirmButtonColor: '#3085d6'
//         });
//     }
// }

// // Function to cancel/delete a reservation
// function cancelReservation(reservationId) {
//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, cancel it!'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             // Find the row with the matching reservation ID and remove it
//             const rows = document.querySelectorAll('#reservations-body tr');
//             for (let row of rows) {
//                 if (row.cells[0].textContent === `#${reservationId}`) {
//                     row.remove();
//                     Swal.fire(
//                         'Cancelled!',
//                         'Your reservation has been cancelled.',
//                         'success'
//                     );
//                     return;
//                 }
//             }
//             // If we get here, we didn't find the row
//             Swal.fire(
//                 'Error',
//                 'Could not find the reservation to cancel.',
//                 'error'
//             );
//         }
//     });
// }

// // Function to clear the reservations table (if needed)
// function initializeCalendar() {
//     try {
//         const reservations = [];
//         const rows = document.querySelectorAll('#reservations-body tr');
        
//         rows.forEach(row => {
//             const date = row.cells[1].textContent;
//             const timeIn = row.cells[2].textContent;
//             const timeOut = row.cells[3].textContent;
//             const client = row.cells[4].textContent;
//             const service = row.cells[5].textContent;
            
//             const startDateTime = new Date(`${date} ${convertTo24HourFormat(timeIn)}`);
//             const endDateTime = new Date(`${date} ${convertTo24HourFormat(timeOut)}`);
            
//             reservations.push({
//                 title: '',
//                 start: startDateTime,
//                 end: endDateTime,
//                 backgroundColor: '#EEF2FF', // Indigo-50
//                 borderColor: '#6366F1', // Indigo-500
//                 textColor: '#1E1B4B', // Indigo-950
//                 extendedProps: {
//                     service: service,
//                     client: client,
//                     timeIn: timeIn,
//                     timeOut: timeOut
//                 }
//             });
//         });

//         const calendarEl = document.createElement('div');
//         calendarEl.style.padding = '24px';
//         calendarEl.style.backgroundColor = 'white';
//         calendarEl.style.borderRadius = '12px';
        
//         // Add custom CSS for calendar
//         const styleEl = document.createElement('style');
//         styleEl.textContent = `
//             .fc {
//                 --fc-border-color: #E5E7EB;
//                 --fc-button-bg-color: #4F46E5;
//                 --fc-button-border-color: #4F46E5;
//                 --fc-button-hover-bg-color: #4338CA;
//                 --fc-button-hover-border-color: #4338CA;
//                 --fc-button-active-bg-color: #3730A3;
//                 --fc-today-bg-color: #EEF2FF;
//                 font-family: poppins;
//             }
//             .fc .fc-button {
//                 padding: 8px 16px;
//                 font-weight: 500;
//                 border-radius: 6px;
//                 text-transform: capitalize;
//                 transition: all 0.2s;
//             }
//             .fc .fc-toolbar-title {
//                 font-size: 1.5rem;
//                 font-weight: 600;
//                 color: #1E1B4B;
//             }
//             .fc .fc-day-header {
//                 padding: 8px 0;
//                 font-weight: 600;
//                 text-transform: uppercase;
//                 font-size: 0.875rem;
//             }
//             .fc .fc-day {
//                 transition: background-color 0.2s;
//             }
//             .fc .fc-day:hover {
//                 background-color: #F9FAFB;
//             }
//             .fc .fc-event {
//                 transition: transform 0.2s;
//                 cursor: pointer;
//             }
//             .fc .fc-event:hover {
//                 transform: translateY(-1px);
//             }
//         `;
//         document.head.appendChild(styleEl);

//         const calendar = new FullCalendar.Calendar(calendarEl, {
//             initialView: 'dayGridMonth',
//             headerToolbar: {
//                 left: 'prev,next today',
//                 center: 'title',
//                 right: 'dayGridMonth'
//             },
//             slotMinTime: '09:00:00',
//             slotMaxTime: '24:00:00',
//             events: reservations,
//             height: 'auto',
//             slotDuration: '01:00:00',
//             allDaySlot: false,
//             businessHours: {
//                 daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
//                 startTime: '09:00',
//                 endTime: '24:00',
//             },
//             eventDidMount: function(info) {
//                 info.el.style.fontSize = '0.875rem';
//                 info.el.style.padding = '6px 8px';
//                 info.el.style.whiteSpace = 'pre-line';
//                 info.el.style.borderRadius = '6px';
//                 info.el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                
//                 // Add tooltip
//                 tippy(info.el, {
//                     content: `
//                         <div class="text-sm">
//                             <div class="font-semibold">${info.event.extendedProps.service}</div>
//                             <div class="text-gray-600">${info.event.extendedProps.client}</div>
//                             <div class="text-gray-500 text-xs mt-1">
//                                 ${info.event.extendedProps.timeIn} - ${info.event.extendedProps.timeOut}
//                             </div>
//                         </div>
//                     `,
//                     allowHTML: true,
//                     theme: 'light-border',
//                     animation: 'shift-away',
//                 });
//             },
//             eventContent: function(arg) {
//                 const timeIn = arg.event.extendedProps.timeIn;
//                 const timeOut = arg.event.extendedProps.timeOut;
//                 const service = arg.event.extendedProps.service;
//                 const client = arg.event.extendedProps.client;

//                 return {
//                     html: `
//                         <div class="p-1">
//                             <div class="font-semibold text-indigo-900">
//                                 ${timeIn} - ${timeOut}
//                             </div>
//                             <div class="text-indigo-700 font-medium">
//                                 ${service}
//                             </div>
//                             <div class="text-indigo-600 text-sm mt-1">
//                                 ${client}
//                             </div>
//                         </div>
//                     `
//                 };
//             },
//             dayMaxEvents: true,
//             eventDisplay: 'block',
//             views: {
//                 dayGrid: {
//                     dayMaxEvents: 4
//                 }
//             }
//         });

//         calendarEl.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        
//         return { calendarEl, calendar };
//     } catch (error) {
//         console.error('Error in initializeCalendar:', error);
//         throw error;
//     }
// }

// // Event listener for when the DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     // Add event listener for View Available Schedule button
//     const viewScheduleBtn = document.getElementById('ViewAvailSched');
//     if (viewScheduleBtn) {
//         viewScheduleBtn.addEventListener('click', function() {
//             if (typeof FullCalendar === 'undefined') {
//                 console.error('FullCalendar is not loaded');
//                 Swal.fire({
//                     title: 'Error',
//                     text: 'Calendar component failed to load. Please refresh the page.',
//                     icon: 'error'
//                 });
//                 return;
//             }

//             try {
//                 const { calendarEl, calendar } = initializeCalendar();
                
//                 Swal.fire({
//                     title: 'Available Schedule',
//                     html: calendarEl,
//                     width: '80%',
//                     heightAuto: true,
//                     showCloseButton: true,
//                     showConfirmButton: false,
//                     didRender: () => {
//                         try {
//                             calendar.render();
//                         } catch (error) {
//                             console.error('Error rendering calendar:', error);
//                             Swal.fire({
//                                 title: 'Error',
//                                 text: 'Failed to render the calendar. Please try again.',
//                                 icon: 'error'
//                             });
//                         }
//                     }
//                 });
//             } catch (error) {
//                 console.error('Error initializing calendar:', error);
//                 Swal.fire({
//                     title: 'Error',
//                     text: 'Failed to load the calendar. Please try again.',
//                     icon: 'error'
//                 });
//             }
//         });
//     } else {
//         console.error('ViewAvailSched button not found');
//     }
// });

// // Handle booking updates
// const originalBookReservation = bookReservation;
// bookReservation = function(event) {
//     originalBookReservation(event);
    
//     // If the calendar modal is open, refresh it
//     const calendarModal = document.querySelector('.swal2-modal');
//     if (calendarModal) {
//         try {
//             const { calendarEl, calendar } = initializeCalendar();
//             calendarModal.querySelector('.swal2-content').innerHTML = '';
//             calendarModal.querySelector('.swal2-content').appendChild(calendarEl);
//             calendar.render();
//         } catch (error) {
//             console.error('Error refreshing calendar:', error);
//         }
//     }
// };

// // Modify your existing cancelReservation function
// const originalCancelReservation = cancelReservation;
// cancelReservation = function(reservationId) {
//     Swal.fire({
//         title: 'Are you sure?',
//         text: "You won't be able to revert this!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, cancel it!'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             const rows = document.querySelectorAll('#reservations-body tr');
//             for (let row of rows) {
//                 if (row.cells[0].textContent === `#${reservationId}`) {
//                     row.remove();
//                     Swal.fire(
//                         'Cancelled!',
//                         'Your reservation has been cancelled.',
//                         'success'
//                     ).then(() => {
//                         // Refresh calendar if it's open
//                         const calendarModal = document.querySelector('.swal2-modal');
//                         if (calendarModal) {
//                             const { calendarEl, calendar } = initializeCalendar();
//                             calendarModal.querySelector('.swal2-content').innerHTML = '';
//                             calendarModal.querySelector('.swal2-content').appendChild(calendarEl);
//                             calendar.render();
//                         }
//                     });
//                     return; 
//                 }
//             }
//             Swal.fire(
//                 'Error',
//                 'Could not find the reservation to cancel.',
//                 'error'
//             );
//         }
//     });
// };

// // Event listener to clear the table when the page loads (if needed)
// document.addEventListener('DOMContentLoaded', function() {
//     clearReservationsTable();
// });




class ReservationManager {
    constructor() {
        this.API_URL = 'http://localhost:3000/api/admin/reservations';
        this.table = document.getElementById('reservations-body');
        this.POLLING_INTERVAL = 5000;
        this.isPolling = true;
        this.reservationsData = [];

        this.initializeEventListeners();
        this.loadReservations(true);
        this.startPolling();
    }

    initializeEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
                this.loadReservations();
            }
        });
        
        this.table.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const row = target.closest('tr');
            const reservationId = row.querySelector('td').textContent;

            if (target.classList.contains('view-btn')) {
                this.viewReservation(reservationId);
            } else if (target.classList.contains('cancel-btn')) {
                this.cancelReservation(reservationId);
            }
        });
    }

    startPolling() {
        this.isPolling = true;
        this.poll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async poll() {
        if (!this.isPolling) return;
        await this.loadReservations();
        setTimeout(() => this.poll(), this.POLLING_INTERVAL);
    }

    viewReservation(id) {
    const reservation = this.reservationsData.find(r => r.id.toString() === id.toString());
    
    if (reservation) {
        // Add print-specific styles
        const printStyles = `
            @media print {
                body * {
                    visibility: hidden;
                }
                .swal2-popup * {
                    visibility: visible;
                }
                .swal2-popup {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 210mm !important; /* A4 width */
                    min-height: 148mm !important; /* A5 height */
                    margin: 0 !important;
                    padding: 15mm !important;
                }
                .no-print {
                    display: none !important;
                }
                .receipt-content {
                    font-size: 12pt;
                }
                @page {
                    size: A5;
                    margin: 0;
                }
            }
        `;

        // Create style element
        const styleSheet = document.createElement('style');
        styleSheet.innerText = printStyles;
        document.head.appendChild(styleSheet);

        Swal.fire({
            title: '<h4 class="text-dark fw-bold mb-0">COURT RESERVATION</h4>',
            html: `
                <div class="text-left p-3" style="font-family: 'Poppins', sans-serif;">
                    <div class="text-center mb-4">
                        <h6 class="text-secondary mb-2">COURT BOOKING DETAILS</h6>
                        <small class="text-muted">Booking ID: #${reservation.id}</small>
                        <hr class="my-3">
                    </div>
                    <div class="row g-3">
                        <div class="col-12">
                            <div class="d-flex justify-content-start">
                                <span class="text-secondary">Play Date: ${reservation.reservation_date}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-start">
                                <span class="text-secondary">Court Hours: ${reservation.start_time} - ${reservation.end_time}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-start">
                                <span class="text-secondary">Reserved By: ${reservation.customer_name}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-start">
                                <span class="text-secondary">Court Type: ${reservation.service_type}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-start">
                                <span class="text-secondary">Players: ${reservation.additional_members || 'Single Player'}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <hr class="my-2">
                        </div>
                        <div class="col-12">
                            <div class="d-flex justify-content-between">
                                <span class="text-dark fw-bold">COURT FEE:</span>
                                <span class="text-dark fw-bold">₱${reservation.price}</span>
                            </div>
                        </div>
                        <div class="col-12">
                            <hr class="my-2">
                        </div>
                        <div class="col-12 text-center">
                            <p class="mb-2 fw-bold text-secondary">IMPORTANT REMINDERS:</p>
                            <ul class="list-unstyled text-secondary" style="font-size: 0.9rem;">
                                <li>• Wear appropriate sports attire and shoes</li>
                                <li>• No food inside the court</li>
                                <li>• Time extension subject to availability</li>
                                <li>• Non-refundable and non-transferable</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <button onclick="window.print()" class="btn btn-secondary w-100 mt-2 mb-2 no-print">
                    <i class="fas fa-print me-2"></i> Print Booking Details
                </button>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#198754',
            width: '26rem',
            padding: '1.5em',
            background: '#fff',
            customClass: {
                container: 'custom-swal-popup',
                popup: 'custom-swal-popup'
            }
        }).then(() => {
            // Clean up the style element after the modal is closed
            styleSheet.remove();
        });
        } else {
            this.showError('Reservation not found');
        }
}

    async cancelReservation(id) {
        try {
            const result = await Swal.fire({
                title: 'Cancel Reservation',
                text: 'Are you sure you want to cancel this reservation? This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'No, keep it'
            });

            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Cancelling Reservation...',
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false
                });

                const response = await fetch(`${this.API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Cancelled!',
                        text: 'The reservation has been cancelled successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    await this.loadReservations(); // Refresh the table
                } else {
                    throw new Error('Failed to cancel reservation');
                }
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to cancel reservation. Please try again.'
            });
        }
    }

    async loadReservations(isInitialLoad = false) {
        try {
            const response = await fetch(this.API_URL);
            const reservations = await response.json();
            
            this.reservationsData = reservations;
            
            this.table.innerHTML = reservations.map(reservation => this.createTableRow(reservation)).join('');
        } catch (error) {
            console.error('Failed to load reservations:', error);
            if (isInitialLoad) {
                this.showError('Failed to load reservations');
            }
        }
    }

    createTableRow(reservation) {
        return `
            <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap">${reservation.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${reservation.reservation_date}</td>
                <td class="px-6 py-4 whitespace-nowrap">${reservation.start_time}</td>
                <td class="px-6 py-4 whitespace-nowrap">${reservation.end_time}</td>
                <td class="px-6 py-4 whitespace-nowrap">${reservation.customer_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${reservation.service_type}</td>
                <td class="px-6 py-4 whitespace-nowrap">Active</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="view-btn inline-flex items-center justify-center w-10 h-10 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 rounded-lg mr-2" title="View">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button class="cancel-btn inline-flex items-center justify-center w-10 h-10 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 rounded-lg" title="Cancel">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReservationManager();
});
