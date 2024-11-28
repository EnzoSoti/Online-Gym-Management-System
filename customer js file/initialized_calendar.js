async function initializeCalendar() {
    try {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        // Add CSS for hover and click effects
        const style = document.createElement('style');
        style.textContent = `
            .fc-day {
            position: relative;
            overflow: hidden;
        }

        .fc-day-future::before {
            content: 'Available';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #22c55e;
            font-size: 0.75rem;
            font-weight: 600;
            opacity: 0;
            z-index: 1;
            pointer-events: none;
            transition: all 0.4s ease-out;
            letter-spacing: 0.025em;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.25));
            padding: 4px 8px;
            border-radius: 20px;
            border: 1px solid rgba(34, 197, 94, 0.3);
            box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
            white-space: nowrap;
        }

        /* Show "Available" text by default with fade-in animation */
        .fc-day-future:not(:hover)::before {
            opacity: 1;
        }

        /* Updated hover effect for available text */
        .fc-day-future:hover::before {
            opacity: 0;
        }

        /* Hover effect overlay */
        .fc-day::after {
            content: 'Click to view';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            font-size: 0.875rem;
            line-height: 1.4;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 600;
            backdrop-filter: blur(4px);
            z-index: 2;
        }

        .fc-day:hover::after {
            opacity: 1;
        }

        /* Past days styling */
        .fc-day-past {
            opacity: 0.5;
            transition: all 0.3s ease;
        }

        .fc-day-past:hover {
            opacity: 1;
            background-color: rgba(239, 68, 68, 0.05) !important;
        }

        .fc-day-past::after {
            content: 'Not Available';
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            font-weight: 600;
        }

        .fc-day-past:hover * {
            color: #ef4444 !important;
        }

        .fc-day-past:hover .fc-daygrid-day-number {
            color: #ef4444 !important;
            transform: scale(1.1) translateY(-1px);
        }

        .fc-day-past:hover .fc-daygrid-day-frame {
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 4px;
        }

        .fc-day-past::before {
            display: none !important;
        }

        .fc-day:hover {
            cursor: pointer;
        }

        /* Updated styles for today with centered positioning */
        .fc-day-today::before {
            content: 'Available Today';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #22c55e;
            font-size: 0.75rem;
            font-weight: 600;
            opacity: 1;
            z-index: 1;
            pointer-events: none;
            letter-spacing: 0.025em;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3));
            padding: 4px 8px;
            border-radius: 20px;
            border: 2px solid rgba(34, 197, 94, 0.4);
            box-shadow: 0 2px 12px rgba(34, 197, 94, 0.15);
            white-space: nowrap;
            animation: pulseToday 2s infinite;
        }

        @keyframes pulseToday {
            0% {
                transform: translate(-50%, -50%) scale(1);
                box-shadow: 0 2px 12px rgba(34, 197, 94, 0.15);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.05);
                box-shadow: 0 4px 16px rgba(34, 197, 94, 0.25);
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                box-shadow: 0 2px 12px rgba(34, 197, 94, 0.15);
            }
        }

        .fc-daygrid-day-frame {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 4px !important;
        }

        .fc-daygrid-day-top {
            flex-grow: 0;
            display: flex;
            justify-content: center !important;
            margin-bottom: 4px;
        }

        .fc-day.clicked {
            transform: scale(0.98);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fc-daygrid-day {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .fc-daygrid-day-events:not(:empty) ~ .fc-daygrid-day-bg::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.4s ease-out;
        }

        .fc-daygrid-day:hover .fc-daygrid-day-events:not(:empty) ~ .fc-daygrid-day-bg::before {
            opacity: 1;
        }

        .fc-daygrid-day-number {
            position: relative;
            transition: all 0.3s ease;
            z-index: 1;
        }

        .fc-day:hover .fc-daygrid-day-number {
            color: #22c55e;
            transform: scale(1.1) translateY(-1px);
        }

        /* Header toolbar and button styles */
        .fc-header-toolbar {
            margin-bottom: 2em !important;
            position: relative;
        }

        .fc-toolbar-title {
            font-size: 1.75rem !important;
            font-weight: 700 !important;
            color: #f97316 !important;
            letter-spacing: -0.025em;
        }

        .fc-button-primary {
            background-color: rgba(26, 26, 26, 0.95) !important;
            border: 1px solid rgba(249, 115, 22, 0.3) !important;
            color: #f97316 !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            padding: 8px 16px !important;
            border-radius: 10px !important;
            font-weight: 500 !important;
            letter-spacing: 0.025em !important;
        }

        .fc-button-primary:hover {
            background-color: #f97316 !important;
            border-color: #f97316 !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
        }

        .fc-button-primary:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
        }

        .fc-event {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer;
            border: 1px solid rgba(34, 197, 94, 0.3) !important;
        }

        .fc-event:hover {
            transform: translateY(-2px) scale(1.02) !important;
            box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15) !important;
        }

        .fc-event {
            animation: eventMount 0.4s ease-out forwards;
        }

        @keyframes eventMount {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        #calendar {
            min-height: 800px;
            height: 100%;
        }

        .fc {
            height: 100% !important;
        }

        .fc-view-harness {
            height: 100% !important;
        }

        .fc-daygrid.fc-dayGridMonth-view {
            height: 100% !important;
        }

        .fc .fc-daygrid-day-frame {
            min-height: 100px;
            height: 100%;
        }

        .fc-daygrid-day-events {
            max-height: none !important;
        }
        /* New classes for days with reservations */
            .fc-day-today.has-reservation::before {
                color: #facc15 !important; /* Yellow color */
                border-color: #eab308 !important; /* Dark yellow border color */
                background: rgba(250, 204, 21, 0.1) !important; /* Very light yellow background color */
            }

            .fc-day-today.has-reservation:hover::before {
                background: rgba(250, 204, 21, 0.2) !important; /* Slightly darker light yellow background color on hover */
            }

            .fc-day-future.has-reservation::before {
                color: #facc15 !important; /* Yellow color */
            }

            /* New class for displaying reservation count */
            .fc-day-reservation-count::after {
                content: attr(data-reservation-count) " booked";
                position: absolute;
                bottom: 4px;
                right: 4px;
                color: black;
                font-size: 1rem;
                font-weight: 600;
            }
        `;
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
                            popup: 'animate__animated animate__fadeIn'
                        },
                        customClass: {
                            popup: 'rounded-lg border-l-4 border-l-yellow-500 bg-gray-900',
                            title: 'text-yellow-500 font-bold',
                            htmlContainer: 'text-gray-200',
                            confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg px-6 py-2.5 transition-colors duration-200'
                        },
                        buttonsStyling: false
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