const API_BASE_URL = 'http://localhost:3000/api';

// Add new time validation functions
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

document.addEventListener('DOMContentLoaded', function() {
    // Fix: Only attach admin login to the specific admin login button
    const adminLoginBtn = document.querySelector('a[href="#"].text-orange-600');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', showAdminLogin);
    }

    // Hamburger menu functionality
    const hamburgerBtn = document.querySelector('nav button');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            // Add your hamburger menu toggle logic here
            // For example:
            const mobileMenu = document.querySelector('.md\\:hidden');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        });
    }

    // Team member functionality
    let memberCount = 0;
    const maxMembers = 8;
    const addPlayerBtn = document.querySelector('#team-members + button');
    
    // Fix: Properly attach add player functionality to the specific button
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            addTeamMember();
        });
    }

    // Add team member function
    window.addTeamMember = function() {
        if (memberCount >= maxMembers) {
            Swal.fire({
                title: 'Maximum Players Reached!',
                text: 'You can only add up to 8 additional players.',
                icon: 'warning',
                confirmButtonText: 'Got it',
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
                iconColor: '#ea580c',
                customClass: {
                    confirmButton: 'swal2-confirm',
                    popup: 'rounded-3xl'
                }
            });
            return;
        }

        const teamMembersContainer = document.getElementById('team-members');
        if (!teamMembersContainer) return;

        const memberField = document.createElement('div');
        memberField.className = 'flex gap-2';
        memberField.innerHTML = `
            <input type="text" 
                   placeholder="Enter player name" 
                   class="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all bg-white">
            <button type="button" 
                    class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors remove-member">
                ✕
            </button>
        `;

        // Add click event listener to the remove button
        const removeButton = memberField.querySelector('.remove-member');
        removeButton.addEventListener('click', function() {
            memberField.remove();
            memberCount--;
        });

        teamMembersContainer.appendChild(memberField);
        memberCount++;

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Player Added Successfully!',
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            customClass: {
                popup: 'rounded-3xl'
            }
        });
    };

    // Initialize the calendar
    initializeCalendar();

    // Initialize form submission
    const reservationForm = document.getElementById('booking-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
});

// Add this function to check for time slot conflicts
function isTimeSlotAvailable(newStartTime, newEndTime, newDate) {
    try {
        const existingReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        
        // Convert times to minutes for easier comparison
        const newStartMinutes = parseTimeToMinutes(newStartTime);
        const newEndMinutes = parseTimeToMinutes(newEndTime);
        
        // Basic time validation
        if (newStartMinutes >= newEndMinutes) {
            throw new Error('End time must be after start time');
        }

        // Validate business hours (9 AM to 12 AM)
        const openingTime = parseTimeToMinutes('09:00');
        const closingTime = parseTimeToMinutes('24:00');
        
        if (newStartMinutes < openingTime || newEndMinutes > closingTime) {
            throw new Error('Reservations are only available between 9:00 AM and 12:00 AM');
        }

        // Duration validation (minimum 1 hour, maximum 4 hours)
        const duration = newEndMinutes - newStartMinutes;
        if (duration < 60) {
            throw new Error('Minimum reservation duration is 1 hour');
        }
        if (duration > 240) {
            throw new Error('Maximum reservation duration is 4 hours');
        }

        // Check for overlapping reservations
        const conflict = existingReservations.find(reservation => {
            if (reservation.reservation_date !== newDate) {
                return false;
            }
            
            const existingStart = parseTimeToMinutes(reservation.start_time);
            const existingEnd = parseTimeToMinutes(reservation.end_time);
            
            // Check if there's any overlap
            const hasOverlap = (newStartMinutes < existingEnd && newEndMinutes > existingStart);
            
            if (hasOverlap) {
                throw new Error(
                    `This time slot conflicts with an existing reservation from ` +
                    `${reservation.start_time} to ${reservation.end_time}`
                );
            }
            
            return hasOverlap;
        });

        return true;
    } catch (error) {
        throw error;
    }
}

async function handleReservationSubmit(e) {
    e.preventDefault();

    // Show loading state
    Swal.fire({
        title: 'Processing...',
        text: 'Checking availability',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Get form data with validation
        const service_type = document.querySelector('select')?.value;
        const customer_name = document.querySelector('input[type="text"]')?.value;
        const start_time = document.querySelectorAll('input[type="time"]')[0]?.value;
        const end_time = document.querySelectorAll('input[type="time"]')[1]?.value;
        const reservation_date = document.querySelector('input[type="date"]')?.value;
        
        // Validate required fields first
        const requiredFields = {
            'Service Type': service_type,
            'Customer Name': customer_name,
            'Start Time': start_time,
            'End Time': end_time,
            'Reservation Date': reservation_date
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }

        // Validate time format and logic
        const startDateTime = new Date(`${reservation_date}T${start_time}`);
        const endDateTime = new Date(`${reservation_date}T${end_time}`);

        if (endDateTime <= startDateTime) {
            throw new Error('End time must be after start time');
        }

        // Check if the time slot is available
        const timeSlotCheck = checkTimeSlotAvailability(start_time, end_time, reservation_date);
        if (!timeSlotCheck.available) {
            throw new Error(timeSlotCheck.message);
        }

        // Get and validate additional members
        const additional_members = getAdditionalMembers();
        
        // Create the form data object
        const formData = {
            service_type,
            customer_name,
            start_time,
            end_time,
            reservation_date,
            additional_members: additional_members.length > 0 ? additional_members : undefined
        };

        // Make the API call to your backend server
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Parse the response
        const data = await response.json();

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create reservation');
        }

        // Close loading alert and show success message
        Swal.fire({
            title: 'Success!',
            text: 'Your reservation has been successfully saved to the database!',
            icon: 'success',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'bg-orange-600 text-white px-4 py-2 rounded-xl'
            }
        });

        // Reset form
        e.target.reset();
        clearAdditionalMembers();

        // Refresh the calendar if it exists
        if (typeof initializeCalendar === 'function') {
            initializeCalendar();
        }

    } catch (error) {
        console.error('Reservation error:', error);
        
        // Show error message
        Swal.fire({
            title: 'Booking Error',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'OK',
            customClass: {
                confirmButton: 'bg-orange-600 text-white px-4 py-2 rounded-xl'
            }
        });
    }
}

// Local time slot availability checker
function checkTimeSlotAvailability(newStartTime, newEndTime, newDate) {
    // Convert times to minutes for easier comparison
    const getMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const newStartMinutes = getMinutes(newStartTime);
    const newEndMinutes = getMinutes(newEndTime);

    // Get all existing reservations from the page
    // Assuming you have a way to access existing reservations, modify this part
    // to match how you store existing reservations in your application
    const existingReservations = window.existingReservations || []; // You need to define this array somewhere in your code

    // Check for conflicts
    for (const reservation of existingReservations) {
        if (reservation.date === newDate) {
            const existingStartMinutes = getMinutes(reservation.start_time);
            const existingEndMinutes = getMinutes(reservation.end_time);

            // Check if there's any overlap
            if (
                (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
            ) {
                return {
                    available: false,
                    message: `This time slot overlaps with an existing booking from ${formatTime(reservation.start_time)} to ${formatTime(reservation.end_time)}. Please choose a different time.`
                };
            }
        }
    }

    return {
        available: true,
        message: 'Time slot is available'
    };
}

// Helper function to format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Existing helper functions
function getAdditionalMembers() {
    const memberInputs = document.querySelectorAll('#team-members input[type="text"]');
    if (!memberInputs) return [];
    
    return Array.from(memberInputs)
        .map(input => input.value.trim())
        .filter(Boolean);
}

function clearAdditionalMembers() {
    const teamMembersContainer = document.getElementById('team-members');
    if (teamMembersContainer) {
        teamMembersContainer.innerHTML = '';
        window.memberCount = 0;
    }
}

// Admin login function
function showAdminLogin(e) {
    e.preventDefault();
    
    Swal.fire({
        title: '<div class="flex flex-col items-center gap-3">' +
               '<div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">' +
               '<div class="w-16 h-16 bg-gray-900 rounded-2xl -rotate-12 flex items-center justify-center border-2 border-orange-500/20">' +
               '<svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
               '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>' +
               '</svg></div></div>' +
               '<h2 class="text-2xl font-bold text-white">Secure Access</h2>' +
               '</div>',
        html: `
            <div class="space-y-6 pt-4">
                <div class="space-y-5">
                    <div class="group">
                        <label class="block text-gray-400 text-sm mb-2 ml-1">Username</label>
                        <div class="relative">
                            <input type="text" 
                                   id="admin-username" 
                                   class="w-full px-5 py-3 rounded-xl bg-gray-800/50 text-white
                                          border-2 border-gray-700/50
                                          group-focus-within:border-orange-500/50
                                          focus:outline-none focus:ring-0
                                          transition-all duration-300"
                                   placeholder="Enter your username">
                            <div class="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="group">
                        <label class="block text-gray-400 text-sm mb-2 ml-1">Password</label>
                        <div class="relative">
                            <input type="password" 
                                   id="admin-password" 
                                   class="w-full px-5 py-3 rounded-xl bg-gray-800/50 text-white
                                          border-2 border-gray-700/50
                                          group-focus-within:border-orange-500/50
                                          focus:outline-none focus:ring-0
                                          transition-all duration-300"
                                   placeholder="Enter your password">
                            <div class="absolute right-4 top-1/2 -translate-y-1/2">
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Authenticate',
        cancelButtonText: 'Back',
        customClass: {
            container: 'font-sans',
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50 shadow-2xl',
            title: 'text-center border-b border-gray-800/50 pb-6',
            htmlContainer: 'px-6',
            confirmButton: 'w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 ' +
                         'text-white font-semibold rounded-xl px-6 py-3 transition duration-300 shadow-lg shadow-orange-500/20',
            cancelButton: 'w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 ' +
                        'transition duration-300 border border-gray-700/50',
            actions: 'grid grid-cols-2 gap-4 px-6 pb-6 pt-8',
            validationMessage: 'bg-red-500/10 text-red-400 rounded-lg py-2.5 px-4 mt-3 text-sm font-medium'
        },
        buttonsStyling: false,
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return new Promise((resolve) => {
                const username = document.getElementById('admin-username').value;
                const password = document.getElementById('admin-password').value;
                
                if (!username || !password) {
                    Swal.showValidationMessage('All fields are required to proceed');
                    resolve(false);
                    return;
                }
                
                // Loading state
                Swal.update({
                    html: `
                        <div class="flex flex-col items-center gap-6 py-10">
                            <div class="relative">
                                <div class="w-20 h-20">
                                    <div class="absolute inset-0 rounded-3xl bg-orange-500/20 animate-ping"></div>
                                    <div class="absolute inset-0 rounded-3xl border-4 border-orange-500/40 animate-pulse"></div>
                                    <div class="absolute inset-2 rounded-2xl border-4 border-orange-500 border-l-transparent animate-spin"></div>
                                </div>
                            </div>
                            <div class="text-center">
                                <p class="text-orange-500 font-medium mb-1">Authenticating</p>
                                <p class="text-gray-400 text-sm">Please wait while we verify your credentials</p>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCancelButton: false
                });
                
                setTimeout(() => {
                    if (username === 'admin' && password === 'admin') {
                        resolve(true);
                    } else {
                        Swal.showValidationMessage('Invalid credentials provided');
                        resolve(false);
                    }
                }, 1500);
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                html: `
                    <div class="flex flex-col items-center gap-4 py-8">
                        <div class="relative w-16 h-16">
                            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 rotate-12"></div>
                            <div class="absolute inset-0 rounded-2xl bg-gray-900 -rotate-12 flex items-center justify-center border-2 border-orange-500/20">
                                <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-xl font-bold text-white">Access Granted</h3>
                        <div class="flex items-center gap-2 text-gray-400">
                            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <p class="text-sm">Preparing secure environment</p>
                        </div>
                    </div>
                `,
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
                }
            }).then(() => {
                window.location.href = '../main/admin.html';
            });
        }
    });
}

// Improved function to clear additional members
function clearAdditionalMembers() {
    const teamMembersContainer = document.getElementById('team-members');
    if (teamMembersContainer) {
        teamMembersContainer.innerHTML = '';
        window.memberCount = 0; // Reset the global member count
    }
}

// Add this function to initialize the calendar with localStorage data
function initializeCalendar() {
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
            events: reservations,
            height: 'auto',
            slotDuration: '01:00:00',
            allDaySlot: false,
            businessHours: {
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: '09:00',
                endTime: '24:00',
            },
            // New theme customization
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
            eventContent: function(arg) {
                const timeIn = arg.event.extendedProps.timeIn;
                const timeOut = arg.event.extendedProps.timeOut;
                const service = arg.event.extendedProps.service;
                const client = arg.event.extendedProps.client;

                return {
                    html: `
                        <div class="p-1">
                            <div class="font-semibold text-orange-900">
                                ${timeIn} - ${timeOut}
                            </div>
                            <div class="text-orange-700 font-medium">
                                ${service}
                            </div>
                            <div class="text-orange-600 text-sm mt-1">
                                ${client}
                            </div>
                        </div>
                    `
                };
            },
            dayMaxEvents: true,
            eventDisplay: 'block',
            views: {
                dayGrid: {
                    dayMaxEvents: 4
                }
            }
        });

        calendar.render();
    } catch (error) {
        console.error('Error in initializeCalendar:', error);
        throw error;
    }
}