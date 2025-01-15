const API_BASE_URL = 'http://localhost:3000/api';

// Add new time validation functions
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Retrieve the full name from sessionStorage
    const fullName = sessionStorage.getItem('full_name');
    const admin = JSON.parse(sessionStorage.getItem('admin'));

    // Update the welcome message in the header
    const welcomeMessageElement = document.getElementById('welcome-message');
    if (welcomeMessageElement && fullName) {
        welcomeMessageElement.textContent = `Welcome, ${fullName}`;
    }
    
    // Fix: Only attach admin login to the specific admin login button
    const adminLoginBtn = document.querySelector('a[href="#"].text-orange-600');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', showAdminLogin);
    }

    if (admin) {
        const welcomeTextElement = document.getElementById('welcomeText');
        const adminFullNameElement = document.getElementById('adminFullName');
        const adminNameDisplayElement = document.getElementById('adminNameDisplay');

        if (welcomeTextElement && adminFullNameElement && adminNameDisplayElement) {
            adminFullNameElement.textContent = admin.full_name;
            adminNameDisplayElement.textContent = admin.full_name;
        }
    }

    const logoutBtn = document.querySelector('a[href="#"].text-orange-600:last-of-type');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Populate the "Main Client Name" field
    const mainClientNameInput = document.querySelector('input[type="text"]');
    if (mainClientNameInput && fullName) {
        mainClientNameInput.value = fullName;
        mainClientNameInput.readOnly = true;
    }

    // Add event listener to prevent numbers in the main client name field
    if (mainClientNameInput) {
        mainClientNameInput.addEventListener('input', function(e) {
            const value = e.target.value;
            if (/\d/.test(value)) {
                Swal.fire({
                    title: '⚠️ Invalid Input',
                    text: 'Numbers are not allowed in the Main Client Name field.',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    showClass: {
                        popup: ''
                    },
                    customClass: {},
                    buttonsStyling: true
                });
                e.target.value = value.replace(/\d/g, ''); // Remove numbers from the input
            }
        });
    }

    // +1 hour start time to end time
    const startTimeInput = document.querySelectorAll('input[type="time"]')[0];
    const endTimeInput = document.querySelectorAll('input[type="time"]')[1];

    if (startTimeInput && endTimeInput) {
        startTimeInput.addEventListener('change', function() {
            const startTime = this.value;
            const endTime = addOneHour(startTime);
            endTimeInput.value = endTime;
        });
    }

    // Hamburger menu functionality
    const hamburgerBtn = document.querySelector('nav button');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function() {
            const mobileMenu = document.querySelector('.md\\:hidden');
            if (mobileMenu) {
                mobileMenu.classList.toggle('active');
            }
        });
    }

    // Team member functionality
    let memberCount = 0;
    const maxMembers = 8;
    const addPlayerBtn = document.getElementById('add-player-btn');
    const teamMembersSection = document.getElementById('team-members-section');
    const serviceTypeSelect = document.getElementById('service-type');
    
    // Initialize team members section based on initial service selection
    if (serviceTypeSelect && teamMembersSection) {
        const initialValue = serviceTypeSelect.value;
        toggleTeamMembersSection(initialValue);

        // Add change event listener to service type dropdown
        serviceTypeSelect.addEventListener('change', function() {
            toggleTeamMembersSection(this.value);
        });
    }

    // Function to toggle team members section
    function toggleTeamMembersSection(serviceType) {
        if (serviceType === 'zumba') {
            teamMembersSection.style.display = 'none';
            // Clear existing team members when switching to zumba
            const teamMembersContainer = document.getElementById('team-members');
            if (teamMembersContainer) {
                teamMembersContainer.innerHTML = '';
                memberCount = 0;
            }
        } else {
            teamMembersSection.style.display = 'block';
        }
    }

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
                // timer: 3000,
                timerProgressBar: true,
                customClass: {}
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
    };

    // Initialize the calendar
    initializeCalendar();

    // Initialize form submission
    const reservationForm = document.getElementById('booking-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }

    // Start polling for real-time updates
    startPolling();
});

// + one hour every time the client set a start time
function addOneHour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + 1;
    let newMinutes = minutes;

    if (newHours >= 24) {
        newHours = 0;
    }
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

function logout() {
    // Show a confirmation dialog before logging out
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will be logged out and redirected to the login page.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel',
        customClass: {},
        buttonsStyling: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear session storage
            sessionStorage.clear();

            // Redirect to the login page
            window.location.href = '../landing_images/index.html';

            // Prevent going back to the previous page
            window.addEventListener('popstate', function(event) {
                window.location.href = '../landing_images/index.html';
            });

            // Push a new state to the history to prevent going back
            history.pushState(null, null, window.location.href);
            window.onpopstate = function () {
                history.pushState(null, null, window.location.href);
            };
        }
    });
}

// Add this function to check for time slot conflicts
function isTimeSlotAvailable(newStartTime, newEndTime, newDate, newServiceType) {
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
        // const conflict = existingReservations.find(reservation => {
        //     if (reservation.reservation_date !== newDate) {
        //         return false;
        //     }

        //     const existingStart = parseTimeToMinutes(reservation.start_time);
        //     const existingEnd = parseTimeToMinutes(reservation.end_time);

        //     // Check if there's any overlap
        //     const hasOverlap = (newStartMinutes < existingEnd && newEndMinutes > existingStart);

        //     if (hasOverlap) {
        //         throw new Error(
        //             `This time slot is already booked by another client for ${reservation.service_type} ` +
        //             `from ${reservation.start_time} to ${reservation.end_time}. ` +
        //             `First come, first served policy applies.`
        //         );
        //     }

        //     return hasOverlap;
        // });

        return true;
    } catch (error) {
        throw error;
    }
}

function checkReservationTimes() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const now = new Date();

    reservations.forEach((reservation, index) => {
        const endTime = new Date(`${reservation.reservation_date}T${reservation.end_time}`);
        if (now >= endTime) {
            // Remove the reservation from the list
            reservations.splice(index, 1);
        }
    });

    // Update the reservations in localStorage
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

// Check every minute (adjust the interval as needed)
setInterval(checkReservationTimes, 60000);

// Price calculation module
function calculatePrice(serviceType, startTime, additionalMembers = []) {
    // Log incoming parameters for debugging
    console.log('Price Calculation Parameters:', {
        serviceType,
        startTime,
        additionalMembers
    });

    if (serviceType === 'court') {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        const after6PM = 18 * 60; // 6 PM in minutes
        return totalMinutes >= after6PM ? 200 : 180;
    } 
    else if (serviceType === 'zumba') {
        const basePrice = 60; // Base price per participant
        // Ensure additionalMembers is an array
        const additionalMembersArray = Array.isArray(additionalMembers) ? additionalMembers : [];
        const totalParticipants = additionalMembersArray.length + 1; // Including the main client
        const totalPrice = basePrice * totalParticipants;

        // Detailed logging for debugging
        console.log('Zumba Price Calculation:', {
            basePrice,
            additionalMembersCount: additionalMembersArray.length,
            totalParticipants,
            totalPrice,
            breakdown: `${basePrice} × ${totalParticipants} = ${totalPrice}`
        });

        return totalPrice;
    }
    return 0;
}

// Helper function to parse time string to minutes
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Form data collection
function getFormData() {
    const service_type = document.querySelector('select')?.value;
    const customer_name = document.querySelector('input[type="text"]')?.value;
    const start_time = document.querySelectorAll('input[type="time"]')[0]?.value;
    const end_time = document.querySelectorAll('input[type="time"]')[1]?.value;
    const reservation_date = document.querySelector('input[type="date"]')?.value;

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
            Swal.fire({
                title: '⚠️ Required Fields Missing',
                html: '<div class="space-y-2">' +
                    `<p class="text-red-400 font-semibold">Please fill in all required fields</p>` +
                    '</div>',
                icon: 'warning',
                confirmButtonText: 'Complete Fields',
                showClass: {
                    popup: ''
                },
                customClass: {},
                buttonsStyling: true
            });
            return;
        }

    return { service_type, customer_name, start_time, end_time, reservation_date };
}
// Dialog modules
async function showPricingDialog(serviceType, price, additionalMembers, startTime) {
    let pricingContent = '';
    const RATE_PER_PERSON = 60;
    
    if (serviceType === 'court') {
        const hour = parseInt(startTime.split(':')[0]);
        pricingContent = `
            <div class="text-center mb-4">
                <h3 class="text-lg font-bold mb-2">Basketball Court Reservation</h3>
                <p class="text-gray-600">
                    Court rate: ₱${price} (${hour >= 18 ? 'After' : 'Before'} 6 PM)
                </p>
            </div>
            <div class="text-center font-bold">
                Total Amount: ₱${price}
            </div>
        `;
    } else if (serviceType === 'zumba') {
        let initialParticipants = additionalMembers.length + 1;
        
        pricingContent = `
            <div class="text-center mb-4">
                <h3 class="text-lg font-bold mb-2">Zumba Class Reservation</h3>
                <div class="mb-3">
                    <label class="block mb-1">Number of Participants:</label>
                    <input type="number" 
                           id="participantsInput" 
                           value="${initialParticipants}" 
                           min="1" 
                           class="w-20 px-2 py-1 border rounded text-center mx-auto"
                           oninput="updateZumbaPrice(this.value)">
                </div>
                <div class="mt-3">
                    <table class="mx-auto">
                        <tr>
                            <td class="pr-3">Rate per person:</td>
                            <td>₱${RATE_PER_PERSON}</td>
                        </tr>
                        <tr class="border-t">
                            <td class="pr-3 pt-2">Total Amount:</td>
                            <td class="pt-2 font-bold" id="totalAmount">₱${initialParticipants * RATE_PER_PERSON}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    window.updateZumbaPrice = function(participants) {
        participants = Math.max(1, parseInt(participants) || 1);
        const total = participants * RATE_PER_PERSON;
        document.getElementById('totalAmount').textContent = `₱${total}`;
        document.getElementById('participantsInput').value = participants;
    };

    const { isConfirmed } = await Swal.fire({
        title: 'Pricing Details',
        html: `
            <div class="p-4 border rounded">
                ${pricingContent}
            </div>
        `,
        confirmButtonText: 'Proceed to Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded border'
        },
        buttonsStyling: true,  // Enable default SweetAlert button styling
        preConfirm: () => {
            if (serviceType === 'zumba') {
                const participants = document.getElementById('participantsInput').value;
                return {
                    participants: parseInt(participants),
                    totalAmount: participants * RATE_PER_PERSON
                };
            }
            return true;
        }
    });

    if (isConfirmed && serviceType === 'zumba') {
        const participants = document.getElementById('participantsInput').value;
        return {
            confirmed: true,
            participants: parseInt(participants),
            totalAmount: participants * RATE_PER_PERSON
        };
    }

    return isConfirmed;
}

function handleServiceTypeChange(e) {
    const serviceType = e.target.value;
    const teamMembersSection = document.getElementById('team-members-section');
    
    if (serviceType === 'zumba') {
        teamMembersSection.classList.remove('hidden');
    } else {
        teamMembersSection.classList.add('hidden');
        clearAdditionalMembers();
    }
}

async function showPaymentDialog(totalPrice) {
    const { isConfirmed, value: paymentDetails } = await Swal.fire({
        html: `
            <div class="p-4">
                <div class="mb-6 text-center">
                    <h2 class="text-xl font-bold">Select Payment Method</h2>
                    <p class="mt-2 text-gray-600">Choose your preferred way to pay</p>
                </div>

                <div class="space-y-4">
                    <button id="gym-payment" class="w-full p-4 rounded border hover:bg-gray-50 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded bg-orange-100 flex items-center justify-center">
                                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div class="flex-1 text-left">
                                <h3 class="font-semibold">Pay in the Gym</h3>
                                <p class="text-sm text-gray-600">Pay when you arrive at the facility</p>
                            </div>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </button>

                    <button id="gcash-payment" class="w-full p-4 rounded border hover:bg-gray-50 transition-all">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                                <img src="../img/gcash-seeklogo.png" alt="GCash Logo" class="w-6 h-6">
                            </div>
                            <div class="flex-1 text-left">
                                <h3 class="font-semibold">Pay with GCash</h3>
                                <p class="text-sm text-gray-600">Pay securely using GCash</p>
                            </div>
                            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded'
        },
        buttonsStyling: true,  // Enable default SweetAlert button styling
        didOpen: () => {
            const gymBtn = document.getElementById('gym-payment');
            const gcashBtn = document.getElementById('gcash-payment');

            gymBtn.addEventListener('click', () => {
                Swal.clickConfirm();
                return { method: 'gym', amount: totalPrice };
            });

            gcashBtn.addEventListener('click', async () => {
                const result = await handleGcashPayment(totalPrice);
                if (result) {
                    Swal.clickConfirm();
                    return { method: 'gcash', ...result };
                }
            });
        }
    });

    return isConfirmed ? paymentDetails : null;
}

async function handleGcashPayment(totalAmount) {
    const { isConfirmed, value } = await Swal.fire({
        html: `
            <div class="p-4">
                <div class="mb-6 text-center">
                    <h2 class="text-xl font-bold">GCash Payment Details</h2>
                    <p class="mt-2 text-gray-600">Please enter your GCash transaction information</p>
                </div>

                <div class="space-y-6">
                    <div class="text-center">
                        <div class="p-4 bg-gray-50 rounded border">
                            <img 
                                src="../img/photo_2024-11-30_21-50-23.jpg" 
                                alt="GCash QR Code" 
                                class="mx-auto w-64 h-64 rounded object-cover border-4 border-blue-100"
                            >
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm mb-2 font-medium">GCash Reference Number</label>
                            <input 
                                type="text" 
                                id="gcash-ref" 
                                class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" 
                                placeholder="Enter reference number"
                            >
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm mb-2 font-medium">Account Name</label>
                            <input 
                                type="text" 
                                id="gcash-name" 
                                class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all" 
                                placeholder="Enter GCash account name"
                            >
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Confirm Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded'
        },
        buttonsStyling: true,  // Enable default SweetAlert button styling
        preConfirm: () => {
            const refNumber = document.getElementById('gcash-ref').value;
            const accountName = document.getElementById('gcash-name').value;

            if (!refNumber || !accountName) {
                Swal.showValidationMessage('Please fill in all GCash payment details');
                return false;
            }

            return {
                referenceNumber: refNumber,
                accountName: accountName,
                amount: totalAmount
            };
        }
    });

    return isConfirmed ? value : null;
}

// Helper functions
function getAdditionalMembers() {
    const memberInputs = document.querySelectorAll('#team-members input[type="text"]');
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

async function processReservation(reservationData) {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create reservation');
    }

    return data;
}

function showSuccessMessage() {
    const successSound = document.getElementById('success-sound');
    successSound.play();
    Swal.fire({
        title: '✅ Success!',
        html: '<div class="space-y-2">' +
            '<p class="text-green-400 font-semibold">Your reservation has been successfully booked!</p>' +
            '</div>',
        icon: 'success',
        confirmButtonText: 'OK',
        showClass: {
            popup: '' // Removed animation
        },
        customClass: {
            popup: '',
            title: '',
            confirmButton: ''
        },
        buttonsStyling: true // Reverted to default styling
    });
}

function showErrorMessage(message) {
    Swal.fire({
        title: '⚠️ Time Slot Unavailable',
        html: '<div class="space-y-2">' +
            '<p class="text-red-400 font-semibold">Selected time slot is already booked</p>' +
            '<p class="text-sm text-gray-300">Please select a different time slot</p>' +
            '</div>',
        icon: 'warning',
        confirmButtonText: 'Select Another Time',
        showClass: {
            popup: '' // Removed animation
        },
        customClass: {
            popup: '',
            title: '',
            confirmButton: ''
        },
        buttonsStyling: true // Reverted to default styling
    });
    return;
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleReservationSubmit);
    }

    const serviceTypeSelect = document.querySelector('select');
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', handleServiceTypeChange);
    }
});

// Admin login function
async function showAdminLogin(e) {
    e.preventDefault();

    const { value: formValues } = await Swal.fire({
        title: '<div class="flex flex-col items-center gap-3">' +
               '<div class="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">' +
               '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
               '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>' +
               '</svg></div>' +
               '<h2 class="text-2xl font-bold text-gray-800">Admin Login</h2>' +
               '</div>',

        html: `
            <div class="space-y-6 pt-4">
                <div class="space-y-5">
                    <div class="group">
                        <label class="block text-gray-500 text-sm mb-2 ml-1 text-left">Username</label>
                        <div class="relative">
                            <input type="text" 
                                id="admin-username" 
                                class="w-full px-5 py-3 rounded bg-gray-200 text-gray-800
                                        border border-gray-400 focus:outline-none focus:ring-0"
                                placeholder="Enter your username">
                        </div>
                    </div>
                    <div class="group">
                        <label class="block text-gray-500 text-sm mb-2 ml-1 text-left">Password</label>
                        <div class="relative">
                            <input type="password" 
                                id="admin-password" 
                                class="w-full px-5 py-3 rounded bg-gray-200 text-gray-800
                                        border border-gray-400 focus:outline-none focus:ring-0"
                                placeholder="Enter your password">
                        </div>
                    </div>
                </div>
            </div>
        `,

        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-lg bg-white border border-gray-300 shadow',
            title: 'text-center border-b border-gray-200 pb-4',
            htmlContainer: 'px-6',
            confirmButton: 'w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded px-4 py-2',
            cancelButton: 'w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded px-4 py-2',
            actions: 'grid grid-cols-2 gap-4 px-6 pb-6 pt-6',
            validationMessage: 'bg-red-100 text-red-500 rounded py-2 px-4 mt-3 text-sm font-medium'
        },

        buttonsStyling: false,
        showLoaderOnConfirm: true,

        preConfirm: async () => {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            if (!username || !password) {
                Swal.showValidationMessage('All fields are required to proceed');
                return false;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/admin/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Store the full name in sessionStorage
                    sessionStorage.setItem('admin_full_name', data.admin.full_name);
                    return true;
                } else {
                    Swal.showValidationMessage(data.error || 'Invalid credentials');
                    return false;
                }
            } catch (error) {
                console.error('Login error:', error);
                Swal.showValidationMessage('An error occurred during login');
                return false;
            }
        }
    });

    if (formValues) {
        Swal.fire({
            html: `
                <div class="flex flex-col items-center gap-4 py-8">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800">Access Granted</h3>
                </div>
            `,
            showConfirmButton: false,
            timer: 500,
            customClass: {
                popup: 'rounded-lg bg-white border border-gray-300'
            }
        }).then(() => {
            window.location.href = '../main/admin.html';
        });
    }
}

// Improved function to clear additional members
function clearAdditionalMembers() {
    const teamMembersContainer = document.getElementById('team-members');
    if (teamMembersContainer) {
        teamMembersContainer.innerHTML = '';
        window.memberCount = 0; 
    }
}

// Polling function for real-time updates
function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`);
            const reservations = await response.json();

            // Update the UI with the latest reservations
            updateReservationsUI(reservations);
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 5000); // Poll every 5 seconds
}

function updateReservationsUI(reservations) {
    const reservationsContainer = document.getElementById('reservations-container');
    if (!reservationsContainer) return;

    reservationsContainer.innerHTML = '';

    reservations.forEach(reservation => {
        const reservationElement = document.createElement('div');
        reservationElement.className = 'reservation-item';
        reservationElement.innerHTML = `
            <p>Customer: ${reservation.customer_name}</p>
            <p>Service: ${reservation.service_type}</p>
            <p>Date: ${reservation.reservation_date}</p>
            <p>Time: ${reservation.start_time} - ${reservation.end_time}</p>
            <p>Price: ₱${reservation.price}</p>
        `;
        reservationsContainer.appendChild(reservationElement);
    });
}