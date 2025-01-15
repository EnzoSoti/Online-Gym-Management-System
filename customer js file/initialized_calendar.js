async function initializeCalendar() {
    try {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        const cssResponse = await fetch('/css/calendarResponsive.css');
        const cssText = await cssResponse.text();

        // Add CSS for hover and click effects
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);

        // Calculate calendar height based on container
        const calculateHeight = () => {
            const container = calendarEl.closest('.container') || calendarEl.parentElement;
            if (container) {
                const containerHeight = container.offsetHeight;
                return Math.max(800, containerHeight); // Minimum 800px or container height
            }
            return 'auto';
        };

        window.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            slotMinTime: '09:00:00',
            slotMaxTime: '24:00:00',
            height: calculateHeight(),
            aspectRatio: 1.35,
            slotDuration: '01:00:00',
            allDaySlot: false,
            businessHours: {
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '09:00',
                endTime: '24:00',
            },
            windowResize: function(view) {
                this.setOption('height', calculateHeight());
            },
            buttonText: {
                today: 'Today'
            },
            eventDidMount: function(info) {
                info.el.style.fontSize = '0.875rem';
                info.el.style.padding = '6px 8px';
                info.el.style.whiteSpace = 'pre-line';
                info.el.style.borderRadius = '6px';
                info.el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                
                tippy(info.el, {
                    content: `
                        <div class="text-sm">
                            <div class="font-semibold">${info.event.extendedProps.service}</div>
                            <div class="text-orange-600">${info.event.extendedProps.client}</div>
                            <div class="text-orange-500 text-xs mt-1">
                                ${info.event.extendedProps.timeIn} - ${info.event.extendedProps.timeOut}
                            </div>
                        </div>
                    `,
                    allowHTML: true,
                    theme: 'light-border',
                    animation: 'shift-away',
                });
            },
            dateClick: async function(info) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const clickedDate = new Date(info.dateStr);

                document.querySelectorAll('.fc-day').forEach(cell => {
                    cell.classList.remove('clicked');
                });

                info.dayEl.classList.add('clicked');

                if (clickedDate < today) {
                    Swal.fire({
                        title: '⚠️ Reservation Date Restricted',
                        text: 'You cannot select a date in the past.',
                        icon: 'warning',
                        confirmButtonText: 'Update Date',
                        showClass: {
                            popup: '' // Removed animation
                        },
                        customClass: {
                            popup: '',
                            title: '',
                            htmlContainer: '',
                            confirmButton: ''
                        },
                        buttonsStyling: true // Reverted to default styling
                    });
                    return;
                }

                try {
                    const reservations = await fetchReservationsByDate(info.dateStr);
                    displayReservations(reservations);

                    // Check if the clicked date has reservations and update the class
                    if (reservations.length > 0) {
                        info.dayEl.classList.add('has-reservation');
                        info.dayEl.setAttribute('data-reservation-count', reservations.length);
                        info.dayEl.classList.add('fc-day-reservation-count');
                    } else {
                        info.dayEl.classList.remove('has-reservation');
                        info.dayEl.removeAttribute('data-reservation-count');
                        info.dayEl.classList.remove('fc-day-reservation-count');
                    }
                } catch (error) {
                    console.error('Error fetching reservations by date:', error);
                    showErrorMessage('Failed to fetch reservations for the selected date.');
                }
            }
        });

        // Initial load of events from API
        try {
            const today = new Date().toISOString().split('T')[0];
            const initialReservations = await fetchReservationsByDate(today);
            const calendarEvents = initialReservations.map(reservation => ({
                title: `${reservation.service_type} - ${reservation.customer_name}`,
                start: `${reservation.reservation_date}T${reservation.start_time}`,
                end: `${reservation.reservation_date}T${reservation.end_time}`,
                backgroundColor: '#FFF7ED',
                borderColor: '#EA580C',
                textColor: '#431407',
                extendedProps: {
                    service: reservation.service_type,
                    client: reservation.customer_name,
                    timeIn: reservation.start_time,
                    timeOut: reservation.end_time
                }
            }));
            
            calendar.addEventSource(calendarEvents);

            // Add the 'has-reservation' class to the appropriate days
            const todayCell = document.querySelector('.fc-day-today');
            if (todayCell && initialReservations.length > 0) {
                todayCell.classList.add('has-reservation');
                todayCell.setAttribute('data-reservation-count', initialReservations.length);
                todayCell.classList.add('fc-day-reservation-count');
            }

            initialReservations.forEach(reservation => {
                const date = new Date(reservation.reservation_date);
                const dateStr = date.toISOString().split('T')[0];
                const cell = document.querySelector(`.fc-day[data-date="${dateStr}"]`);
                if (cell) {
                    cell.classList.add('has-reservation');
                    cell.setAttribute('data-reservation-count', initialReservations.length);
                    cell.classList.add('fc-day-reservation-count');
                }
            });

        } catch (error) {
            console.error('Error loading initial reservations:', error);
        }

        calendar.render();
    } catch (error) {
        console.error('Error in initializeCalendar:', error);
        throw error;
    }
}

// Call initializeCalendar after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
});