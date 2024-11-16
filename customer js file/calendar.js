function formatTo12Hour(time24) {
    // Split the time into hours and minutes
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Convert 24-hour to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12
    
    return `${hour}:${minutes} ${ampm}`;
}

function displayReservations(reservations) {
    if (reservations.length === 0) {
        Swal.fire({
            title: 'Fitworx Reservations',
            text: 'No court or class reservations found for this date.',
            confirmButtonText: 'Close',
            showClass: {
                popup: 'animate__animated animate__fadeInDown animate__faster',
                backdrop: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp animate__faster',
                backdrop: 'animate__animated animate__fadeOut animate__faster'
            },
            customClass: {
                popup: 'rounded-3xl bg-gray-900 border-2 border-gray-800/50 max-w-4xl w-full transform transition-all duration-300',
                title: 'text-4xl font-bold text-orange-500 mb-6',
                confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-10 py-5 text-xl transition duration-300'
            },
            buttonsStyling: false
        });
        return;
    }

    let htmlContent = `
        <div class="relative">
            <div class="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-gray-900 to-transparent z-10"></div>
            <div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
            <ul class="space-y-6 max-h-[75vh] overflow-y-auto px-4 relative animate__animated animate__fadeIn animate__faster">
    `;
    
    reservations.forEach((reservation, index) => {
        const getServiceStyle = (serviceType) => {
            const type = serviceType.toLowerCase();
            if (type.includes('zumba')) return {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>`,
                bgColor: 'bg-pink-500/10',
                textColor: 'text-pink-400'
            };
            if (type.includes('court')) return {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>`,
                bgColor: 'bg-orange-500/10',
                textColor: 'text-orange-400'
            };
            return {
                icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`,
                bgColor: 'bg-orange-500/10',
                textColor: 'text-orange-400'
            };
        };

        const serviceStyle = getServiceStyle(reservation.service_type);
        const animationDelay = `${index * 0.15}s`;
        
        // Format the start and end times to 12-hour format
        const startTime12 = formatTo12Hour(reservation.start_time);
        const endTime12 = formatTo12Hour(reservation.end_time)

        htmlContent += `
            <li class="animate__animated animate__fadeInUp opacity-0" style="animation-delay: ${animationDelay}; animation-fill-mode: forwards;">
                <div class="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:translate-y-[-4px] border border-gray-700">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center space-x-4">
                            <div class="bg-orange-500 rounded-full p-3 transition-transform duration-300 hover:scale-110">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="font-bold text-2xl text-white transition-all duration-300 hover:text-orange-400">${startTime12} - ${endTime12}</div>
                        </div>
                        <div class="${serviceStyle.bgColor} ${serviceStyle.textColor} px-6 py-3 rounded-full text-lg font-semibold flex items-center gap-3 transition-all duration-300 hover:scale-105">
                            ${serviceStyle.icon}
                            ${reservation.service_type}
                        </div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="bg-gray-700 rounded-full p-3 transition-all duration-300 hover:bg-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div class="text-gray-300 text-xl font-medium transition-all duration-300 hover:text-white">${reservation.customer_name}</div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="bg-green-500/10 text-green-400 px-5 py-2 rounded-full text-lg font-medium flex items-center gap-2 transition-all duration-300 hover:bg-green-500/20 hover:scale-105">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Reserved
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        `;
    });
    htmlContent += '</ul></div>';

    Swal.fire({
        title: 'Fitworx Reservations',
        html: htmlContent,
        confirmButtonText: 'Close',
        showClass: {
            popup: 'animate__animated animate__fadeIn animate__faster',
            backdrop: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut animate__faster',
            backdrop: 'animate__animated animate__fadeOut animate__faster'
        },
        customClass: {
            popup: 'rounded-3xl bg-gray-900 border-2 border-gray-800/50 max-w-5xl w-full transform transition-all duration-300',
            title: 'text-4xl font-bold text-orange-500 mb-6 animate__animated animate__fadeInDown',
            htmlContainer: 'py-6',
            confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-10 py-5 text-xl transition-all duration-300 hover:scale-105'
        },
        buttonsStyling: false
    });
}

async function fetchReservationsByDate(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservations/${date}`);
        const data = await response.json();

        if (response.ok) {
            console.log('Fetched reservations:', data); // Add logging
            return data;
        } else {
            throw new Error(data.message || 'Failed to fetch reservations by date');
        }
    } catch (error) {
        console.error('Fetch reservations by date error:', error);
        throw error;
    }
}

async function initializeCalendar() {
    try {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');

        const calendarEvents = reservations.map(reservation => ({
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

        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        // Add CSS for hover and click effects with new design
        const style = document.createElement('style');
        style.textContent = `
            .fc-day {
                position: relative;
                overflow: hidden;
            }

            .fc-day::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at center, rgba(251, 146, 60, 0.05) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.4s ease-out;
                z-index: 1;
            }

            .fc-day::after {
                content: 'Click to view';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background-color: rgba(26, 26, 26, 0.95);
                color: #fff;
                padding: 8px 16px;
                border-radius: 12px;
                font-size: 0.75rem;
                line-height: 1.4;
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: pre;
                text-align: center;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(251, 146, 60, 0.2);
                backdrop-filter: blur(8px);
                z-index: 2;
            }

            .fc-day:hover::after {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .fc-day:hover::before {
                opacity: 1;
            }

            /* Modified past date hover behavior */
            .fc-day-past::after {
                content: 'Date not Available';
                display: block;
                background-color: rgba(239, 68, 68, 0.9);
                border-color: rgba(239, 68, 68, 0.3);
            }

            .fc-day-past:hover::after {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            .fc-day-past::before {
                display: block;
                background: radial-gradient(circle at center, rgba(239, 68, 68, 0.05) 0%, transparent 70%);
            }

            .fc-day:hover {
                cursor: pointer;
            }

            .fc-day-today {
                position: relative;
            }

            .fc-day-today::before {
                content: '';
                position: absolute;
                inset: 2px;
                border: 2px solid rgba(251, 146, 60, 0.3);
                border-radius: 8px;
                pointer-events: none;
            }

            .fc-day.clicked {
                transform: scale(0.98);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .fc-daygrid-day {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .fc-day-past {
                opacity: 0.5;
            }

            .fc-daygrid-day-events:not(:empty) ~ .fc-daygrid-day-bg {
                position: relative;
            }

            .fc-daygrid-day-events:not(:empty) ~ .fc-daygrid-day-bg::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at center, rgba(251, 146, 60, 0.08) 0%, transparent 70%);
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
                color: #EA580C;
                transform: scale(1.1) translateY(-1px);
            }

            .fc-header-toolbar {
                margin-bottom: 2em !important;
                position: relative;
            }

            .fc-toolbar-title {
                font-size: 1.75rem !important;
                font-weight: 700 !important;
                color: #EA580C !important;
                letter-spacing: -0.025em;
            }

            .fc-button-primary {
                background-color: rgba(26, 26, 26, 0.95) !important;
                border: 1px solid rgba(251, 146, 60, 0.3) !important;
                color: #EA580C !important;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                padding: 8px 16px !important;
                border-radius: 10px !important;
                font-weight: 500 !important;
                letter-spacing: 0.025em !important;
            }

            .fc-button-primary:hover {
                background-color: #EA580C !important;
                border-color: #EA580C !important;
                color: white !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(251, 146, 60, 0.2);
            }

            .fc-button-primary:active {
                transform: translateY(0);
                box-shadow: 0 2px 8px rgba(251, 146, 60, 0.1);
            }

            .fc-event {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                cursor: pointer;
                border: 1px solid rgba(251, 146, 60, 0.3) !important;
            }

            .fc-event:hover {
                transform: translateY(-2px) scale(1.02) !important;
                box-shadow: 0 8px 24px rgba(251, 146, 60, 0.15) !important;
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
        `;
        document.head.appendChild(style);

        window.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
            events: calendarEvents,
            slotMinTime: '09:00:00',
            slotMaxTime: '24:00:00',
            height: 'auto',
            slotDuration: '01:00:00',
            allDaySlot: false,
            businessHours: {
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '09:00',
                endTime: '24:00',
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

                // Remove clicked class from all cells
                document.querySelectorAll('.fc-day').forEach(cell => {
                    cell.classList.remove('clicked');
                });

                // Add clicked class to the clicked cell
                info.dayEl.classList.add('clicked');

                if (clickedDate < today) {
                    Swal.fire({
                        title: 'Invalid Date',
                        text: 'You cannot select a date in the past.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                            confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl px-6 py-3 transition duration-300'
                        },
                        buttonsStyling: false
                    });
                    return;
                }

                try {
                    const reservations = await fetchReservationsByDate(info.dateStr);
                    displayReservations(reservations);
                } catch (error) {
                    console.error('Error fetching reservations by date:', error);
                    showErrorMessage('Failed to fetch reservations for the selected date.');
                }
            }
        });

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