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

    const logoutBtn = document.querySelector('a[href="#"].text-orange-600:last-of-type');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
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

function logout() {
    // Show a confirmation dialog before logging out
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will be logged out and redirected to the login page.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear session storage
            sessionStorage.clear();

            // Redirect to the login page
            window.location.href = '../customer file/login.html';

            // Prevent going back to the previous page
            window.addEventListener('popstate', function(event) {
                window.location.href = '../customer file/login.html';
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
                    `This time slot is already booked by another client for ${reservation.service_type} ` +
                    `from ${reservation.start_time} to ${reservation.end_time}. ` +
                    `First come, first served policy applies.`
                );
            }

            return hasOverlap;
        });

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

// Form handling module
async function handleReservationSubmit(e) {
    e.preventDefault();

    try {
        const formData = getFormData();
        if (!formData) return;

        // Check if the selected date is in the past
        const selectedDate = new Date(formData.reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to midnight for accurate date comparison

        if (selectedDate < today) {
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

        // Check if the time slot is at least one hour and does not exceed four hours
        const startTime = formData.start_time;
        const endTime = formData.end_time;
        const startTimeMinutes = parseTimeToMinutes(startTime);
        const endTimeMinutes = parseTimeToMinutes(endTime);
        const timeDifference = endTimeMinutes - startTimeMinutes;

        if (timeDifference < 60) {
            Swal.fire({
                title: 'Invalid Time Slot',
                text: 'The time slot must be at least one hour.',
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

        const maxReservationTime = 240; // 4 hours in minutes
        if (timeDifference > maxReservationTime) {
            Swal.fire({
                title: 'Invalid Time Slot',
                text: 'The maximum reservation time is 4 hours.',
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

        const additional_members = getAdditionalMembers();
        console.log('Additional Members:', additional_members); // Debugging statement
        const price = calculatePrice(formData.service_type, formData.start_time, additional_members);
        console.log('Calculated Price:', price); // Debugging statement

        const priceConfirmed = await showPricingDialog(formData.service_type, price, additional_members, formData.start_time);
        if (!priceConfirmed) return;

        const paymentResult = await showPaymentDialog(price);
        if (!paymentResult) return;

        // Check if the time slot is available
        if (!isTimeSlotAvailable(formData.start_time, formData.end_time, formData.reservation_date, formData.service_type)) {
            return;
        }

        await processReservation({
            ...formData,
            additional_members: additional_members.length > 0 ? additional_members : undefined,
            price: price, // Include the calculated price
            payment_details: paymentResult
        });

        // Reset form and show success message
        e.target.reset();
        clearAdditionalMembers();
        showSuccessMessage();

        // Refresh calendar if it exists
        if (typeof initializeCalendar === 'function') {
            initializeCalendar();
        }

    } catch (error) {
        console.error('Reservation error:', error);
        showErrorMessage(error.message);
    }
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
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-white mb-2">Basketball Court Reservation</h3>
                <p class="text-gray-400">
                    Court rate: ₱${price} (${hour >= 18 ? 'After' : 'Before'} 6 PM)
                </p>
            </div>
            <div class="text-center text-white text-lg font-bold">
                Total Amount: ₱${price}
            </div>
        `;
    } else if (serviceType === 'zumba') {
        // Initialize with current user + additional members
        let initialParticipants = additionalMembers.length + 1;
        
        pricingContent = `
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-white mb-2">Zumba Class Reservation</h3>
                <div class="mb-4">
                    <label class="text-gray-400 block mb-2">Number of Participants:</label>
                    <input type="number" 
                           id="participantsInput" 
                           value="${initialParticipants}" 
                           min="1" 
                           class="w-24 px-3 py-2 bg-gray-800 text-white rounded-lg text-center mx-auto block"
                           oninput="updateZumbaPrice(this.value)">
                </div>
                <div class="mt-4">
                    <table class="mx-auto text-left">
                        <tr>
                            <td class="pr-4 text-gray-400">Rate per person:</td>
                            <td class="text-white">₱${RATE_PER_PERSON}</td>
                        </tr>
                        <tr class="border-t border-gray-700">
                            <td class="pr-4 pt-2 text-gray-400">Total Amount:</td>
                            <td class="pt-2 text-white font-bold" id="totalAmount">₱${initialParticipants * RATE_PER_PERSON}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    // Add the updateZumbaPrice function to window scope
    window.updateZumbaPrice = function(participants) {
        // Ensure the value is at least 1
        participants = Math.max(1, parseInt(participants) || 1);
        const total = participants * RATE_PER_PERSON;
        document.getElementById('totalAmount').textContent = `₱${total}`;
        // Update the input value in case it was adjusted
        document.getElementById('participantsInput').value = participants;
    };

    const { isConfirmed } = await Swal.fire({
        title: 'Pricing Details',
        html: `
            <div class="p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                ${pricingContent}
            </div>
        `,
        confirmButtonText: 'Proceed to Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
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
            <div class="max-w-2xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-8 text-center">
                    <h2 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Select Payment Method
                    </h2>
                    <p class="mt-2 text-gray-400">Choose your preferred way to pay</p>
                </div>

                <div class="space-y-4">
                    <button id="gym-payment" class="group w-full p-1 rounded-2xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300">
                        <div class="px-6 py-4 rounded-xl bg-gray-900 hover:bg-gray-900/80 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-white group-hover:text-orange-400 transition-colors">Pay in the Gym</h3>
                                    <p class="text-sm text-gray-400">Pay when you arrive at the facility</p>
                                </div>
                                <svg class="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </button>

                    <button id="gcash-payment" class="group w-full p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                        <div class="px-6 py-4 rounded-xl bg-gray-900 hover:bg-gray-900/80 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <img src="../img/gcash-seeklogo.png" alt="GCash Logo" class="w-8 h-8">
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-white group-hover:text-blue-400 transition-colors">Pay with GCash</h3>
                                    <p class="text-sm text-gray-400">Pay securely using GCash</p>
                                </div>
                                <svg class="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </button>

                    <button id="split-payment" class="group w-full p-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300">
                        <div class="px-6 py-4 rounded-xl bg-gray-900 hover:bg-gray-900/80 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-white group-hover:text-green-400 transition-colors">Split Payment</h3>
                                    <p class="text-sm text-gray-400">Pay using multiple methods</p>
                                </div>
                                <svg class="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
        didOpen: () => {
            const gymBtn = document.getElementById('gym-payment');
            const gcashBtn = document.getElementById('gcash-payment');
            const splitBtn = document.getElementById('split-payment');

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

            splitBtn.addEventListener('click', async () => {
                const result = await handleSplitPayment(totalPrice);
                if (result) {
                    Swal.clickConfirm();
                    return { method: 'split', ...result };
                }
            });
        }
    });

    return isConfirmed ? paymentDetails : null;
}

// Payment handling modules
async function handleGcashPayment(totalAmount) {
    const { isConfirmed, value } = await Swal.fire({
        html: `
            <div class="max-w-2xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-8 text-center">
                    <h2 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        GCash Payment Details
                    </h2>
                    <p class="mt-2 text-gray-400">Please enter your GCash transaction information</p>
                </div>

                <div class="space-y-6">
                    <div class="text-left space-y-6">
                        <div class="group">
                            <label class="block text-gray-400 text-sm mb-3 font-medium">GCash Reference Number</label>
                            <div class="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                                <input type="text" id="gcash-ref" class="w-full px-4 py-3 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Enter reference number">
                            </div>
                        </div>
                        <div class="group">
                            <label class="block text-gray-400 text-sm mb-3 font-medium">Account Name</label>
                            <div class="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                                <input type="text" id="gcash-name" class="w-full px-4 py-3 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Enter GCash account name">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Confirm Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
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

async function handleSplitPayment(totalAmount) {
    const { isConfirmed, value } = await Swal.fire({
        html: `
            <div class="max-w-2xl mx-auto p-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl">
                <div class="mb-8 text-center">
                    <h2 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                        Split Payment Details
                    </h2>
                    <p class="mt-2 text-gray-400">Enter both GCash and cash payment information</p>
                </div>

                <div class="space-y-6">
                    <div class="text-left space-y-6">
                        <div class="group">
                            <label class="block text-gray-400 text-sm mb-3 font-medium">GCash Amount</label>
                            <div class="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                                <input type="number" id="split-gcash-amount" class="w-full px-4 py-3 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Enter GCash amount">
                            </div>
                        </div>
                        <div class="group">
                            <label class="block text-gray-400 text-sm mb-3 font-medium">GCash Reference Number</label>
                            <div class="p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300">
                                <input type="text" id="split-gcash-ref" class="w-full px-4 py-3 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Enter reference number">
                            </div>
                        </div>
                        <div class="group">
                            <label class="block text-gray-400 text-sm mb-3 font-medium">Cash Amount</label>
                            <div class="p-1 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300">
                                <input type="number" id="split-cash-amount" class="w-full px-4 py-3 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all" placeholder="Enter cash amount">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        confirmButtonText: 'Confirm Split Payment',
        showCancelButton: true,
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300',
            cancelButton: 'bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl px-6 py-3 transition duration-300 border border-gray-700/50',
        },
        buttonsStyling: false,
        preConfirm: () => {
            const gcashAmount = document.getElementById('split-gcash-amount').value;
            const gcashRef = document.getElementById('split-gcash-ref').value;
            const cashAmount = document.getElementById('split-cash-amount').value;

            if (!gcashAmount || !gcashRef || !cashAmount) {
                Swal.showValidationMessage('Please fill in all split payment details');
                return false;
            }

            const total = parseFloat(gcashAmount) + parseFloat(cashAmount);
            if (total !== totalAmount) {
                Swal.showValidationMessage(`Total amount must equal ₱${totalAmount}`);
                return false;
            }

            return {
                gcash: {
                    amount: parseFloat(gcashAmount),
                    referenceNumber: gcashRef
                },
                cash: {
                    amount: parseFloat(cashAmount)
                }
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
    Swal.fire({
        title: 'Success!',
        text: 'Your reservation has been successfully booked!',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl px-6 py-3 transition duration-300'
        },
        buttonsStyling: false
    });
}

function showErrorMessage(message) {
    Swal.fire({
        title: 'Booking Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'rounded-2xl bg-gray-900 border-2 border-gray-800/50',
            confirmButton: 'bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl px-6 py-3 transition duration-300'
        },
        buttonsStyling: false
    });
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
// end of split payment




// Admin login function
function showAdminLogin(e) {
    e.preventDefault();

    Swal.fire({
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
            container: 'Poppins',
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

        preConfirm: () => {
            return new Promise((resolve) => {
                const username = document.getElementById('admin-username').value;
                const password = document.getElementById('admin-password').value;

                if (!username || !password) {
                    Swal.showValidationMessage('All fields are required to proceed');
                    resolve(false);
                    return;
                }

                Swal.update({
                    html: `
                        <div class="flex flex-col items-center gap-4 py-8">
                            <div class="w-8 h-8 border-t-2 border-gray-400 border-solid rounded-full animate-spin"></div>
                            <p class="text-gray-500">Authenticating, please wait...</p>
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
                }, 500);
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
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
    });
}


// Improved function to clear additional members
function clearAdditionalMembers() {
    const teamMembersContainer = document.getElementById('team-members');
    if (teamMembersContainer) {
        teamMembersContainer.innerHTML = '';
        window.memberCount = 0; 
    }
}