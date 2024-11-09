document.addEventListener('DOMContentLoaded', function() {
    // Fix: Only attach admin login to the specific admin login button
    const adminLoginBtn = document.querySelector('a[href="#"].text-orange-600');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', showAdminLogin);
    }

    // Fix: Remove event listeners from navigation links
    const navLinks = document.querySelectorAll('nav a:not([href="#"].text-orange-600)');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Prevent default only if the href is #
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });

    // Team member functionality
    let memberCount = 0;
    const maxMembers = 8;
    const addPlayerBtn = document.querySelector('button[type="button"]');
    
    // Fix: Properly attach add player functionality
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', function() {
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
});

// Admin login functionality
function showAdminLogin(e) {
    e.preventDefault();
    
    Swal.fire({
        title: '<h2 class="text-2xl font-semibold mb-2">Administrator Access</h2>',
        html: `
            <div class="space-y-5">
                <div class="relative">
                    <label for="admin-username" class="block text-sm font-medium text-gray-700 mb-1 text-left">Username</label>
                    <div class="relative">
                        <input type="text" 
                               id="admin-username" 
                               class="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                      transition-all bg-white text-gray-900"
                               placeholder="Enter your username">
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-1 text-left">Password</label>
                    <div class="relative">
                        <input type="password" 
                               id="admin-password" 
                               class="w-full px-4 py-2.5 rounded-lg border border-gray-300 
                                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                                      transition-all bg-white text-gray-900"
                               placeholder="Enter your password">
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Cancel',
        customClass: {
            container: 'font-sans',
            popup: 'rounded-xl shadow-xl',
            header: 'border-b pb-4',
            title: 'text-gray-800',
            closeButton: 'focus:outline-none hover:text-gray-700',
            confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition duration-200',
            cancelButton: 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm px-6 py-2.5 transition duration-200 border border-gray-300',
            actions: 'border-t pt-4 space-x-3',
            validationMessage: 'bg-red-50 text-red-600 rounded-lg py-2 px-3 mt-2'
        },
        buttonsStyling: false,
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return new Promise((resolve) => {
                const username = document.getElementById('admin-username').value;
                const password = document.getElementById('admin-password').value;
                
                if (!username || !password) {
                    Swal.showValidationMessage('Please complete all required fields');
                    resolve(false);
                    return;
                }
                
                // Simulate API call
                setTimeout(() => {
                    if (username === 'admin' && password === 'admin') {
                        resolve(true);
                    } else {
                        Swal.showValidationMessage('Invalid credentials. Please try again.');
                        resolve(false);
                    }
                }, 1000);
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'success',
                title: '<h3 class="text-xl font-medium text-gray-900">Welcome Back!</h3>',
                text: 'Redirecting you to the admin dashboard...',
                showConfirmButton: false,
                timer: 2000,
                customClass: {
                    popup: 'rounded-xl shadow-xl',
                    title: 'font-sans',
                    htmlContainer: 'text-gray-600'
                }
            }).then(() => {
                window.location.href = '../main/admin.html';
            });
        }
    });
}

function initializeCalendar() {
    try {
        const reservations = [];
        const rows = document.querySelectorAll('#reservations-body tr');
        
        rows.forEach(row => {
            const date = row.cells[1].textContent;
            const timeIn = row.cells[2].textContent;
            const timeOut = row.cells[3].textContent;
            const client = row.cells[4].textContent;
            const service = row.cells[5].textContent;
            
            const startDateTime = new Date(`${date} ${convertTo24HourFormat(timeIn)}`);
            const endDateTime = new Date(`${date} ${convertTo24HourFormat(timeOut)}`);
            
            reservations.push({
                title: '',
                start: startDateTime,
                end: endDateTime,
                backgroundColor: '#FFF7ED', // Orange-50
                borderColor: '#EA580C',     // Orange-600
                textColor: '#431407',       // Orange-950
                extendedProps: {
                    service: service,
                    client: client,
                    timeIn: timeIn,
                    timeOut: timeOut
                }
            });
        });

        const calendarEl = document.getElementById('calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
            },
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