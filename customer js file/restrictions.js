// Form handling module
async function handleReservationSubmit(e) {
    e.preventDefault();

    try {
        const formData = getFormData();
        if (!formData) return;

        // Get current date and time
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Convert current hour to 12-hour format
        const period = currentHour >= 12 ? 'PM' : 'AM';
        const displayHour = currentHour % 12 || 12; // Convert 0 to 12 for midnight
        
        // Get selected date and time
        const selectedDateTime = new Date(
            formData.reservation_date + 'T' + formData.start_time
        );
        const selectedHour = selectedDateTime.getHours();
        const selectedMinute = selectedDateTime.getMinutes();

        // Check if dates are the same
        const selectedDate = new Date(formData.reservation_date);
        const today = new Date();
        const isSameDay = selectedDate.toDateString() === today.toDateString();

        // If it's the same day, check if the selected time is before current hour
        if (isSameDay && (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute))) {
            Swal.fire({
                title: '⚠️ Time Restriction',
                html: '<div class="space-y-2">' +
                    '<p class="text-yellow-400 font-semibold">Selected time has already passed</p>' +
                    `<p class="text-sm text-gray-300">Please select ${displayHour}:${currentMinute.toString().padStart(2, '0')} ${period} or a future time</p>` +
                    '</div>',
                icon: 'warning',
                confirmButtonText: 'Update Time',
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

        // Check if the selected date is in the past
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);

        if (selectedDate < dayStart) {
            Swal.fire({
                title: '⚠️ Reservation Date Restricted',
                text: 'Reservations cannot be made for past dates. Please select a future date.',
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

        // Check if the time slot is at least one hour
        const startTime = formData.start_time;
        const endTime = formData.end_time;
        const startTimeMinutes = parseTimeToMinutes(startTime);
        const endTimeMinutes = parseTimeToMinutes(endTime);
        const timeDifference = endTimeMinutes - startTimeMinutes;

        if (timeDifference < 60) {
            Swal.fire({
                title: '⏱️ Duration Restriction',
                html: '<div class="space-y-2">' +
                    '<p class="text-red-400 font-semibold">Minimum booking duration not met</p>' +
                    '<p class="text-sm text-gray-300">Reservations must be at least 1 hour long</p>' +
                    '</div>',
                icon: 'error',
                confirmButtonText: 'Adjust Time',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                },
                customClass: {
                    popup: 'rounded-lg border-l-4 border-l-red-500 bg-gray-900',
                    title: 'text-red-500 font-bold',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg px-6 py-2.5 transition-colors duration-200'
                },
                buttonsStyling: false
            });
            return;
        }

        const maxReservationTime = 240; // 4 hours in minutes
        if (timeDifference > maxReservationTime) {
            Swal.fire({
                title: '⏰ Maximum Duration Exceeded',
                html: '<div class="space-y-2">' +
                    '<p class="text-red-400 font-semibold">Booking duration exceeds limit</p>' +
                    '<p class="text-sm text-gray-300">Reservations cannot exceed 4 hours</p>' +
                    '<p class="text-xs text-gray-400 mt-2">Please adjust your end time or make multiple bookings</p>' +
                    '</div>',
                icon: 'error',
                confirmButtonText: 'Adjust Duration',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                },
                customClass: {
                    popup: 'rounded-lg border-l-4 border-l-red-500 bg-gray-900',
                    title: 'text-red-500 font-bold',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg px-6 py-2.5 transition-colors duration-200'
                },
                buttonsStyling: false
            });
            return;
        }

        // Check if the time slot is available
        if (!isTimeSlotAvailable(formData.start_time, formData.end_time, formData.reservation_date, formData.service_type)) {
            Swal.fire({
                title: '⚠️ Time Slot Unavailable',
                html: '<div class="space-y-2">' +
                    '<p class="text-red-400 font-semibold">Selected time slot is already booked</p>' +
                    '<p class="text-sm text-gray-300">Please select a different time slot</p>' +
                    '</div>',
                icon: 'warning',
                confirmButtonText: 'Select Another Time',
                showClass: {
                    popup: 'animate__animated animate__fadeIn'
                },
                customClass: {
                    popup: 'rounded-lg border-l-4 border-l-red-500 bg-gray-900',
                    title: 'text-red-500 font-bold',
                    confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg px-6 py-2.5 transition-colors duration-200'
                },
                buttonsStyling: false
            });
            return;
        }

        const additional_members = getAdditionalMembers();
        console.log('Additional Members:', additional_members);
        const price = calculatePrice(formData.service_type, formData.start_time, additional_members);
        console.log('Calculated Price:', price);

        const priceConfirmed = await showPricingDialog(formData.service_type, price, additional_members, formData.start_time);
        if (!priceConfirmed) return;

        const paymentResult = await showPaymentDialog(price);
        if (!paymentResult) return;

        await processReservation({
            ...formData,
            additional_members: additional_members.length > 0 ? additional_members : undefined,
            price: price,
            payment_details: paymentResult
        });

        e.target.reset();
        clearAdditionalMembers();
        showSuccessMessage();

        if (typeof initializeCalendar === 'function') {
            initializeCalendar();
        }

    } catch (error) {
        console.error('Reservation error:', error);
        showErrorMessage(error.message);
    }
}

// Helper function to parse time string to minutes
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to check for time slot conflicts
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