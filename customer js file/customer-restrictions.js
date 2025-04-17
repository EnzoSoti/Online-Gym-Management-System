// ========== Reservation Form Submit Handler ==========
async function handleReservationSubmit(e) {
    e.preventDefault(); // Prevent form from reloading the page

    try {
        const formData = getFormData(); // Collect form input values
        if (!formData) return;

        // ========== Get Current Date & Time ==========
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // ========== Parse Selected Date & Time from Form ==========
        const selectedDateTime = new Date(formData.reservation_date + 'T' + formData.start_time);
        const selectedHour = selectedDateTime.getHours();
        const selectedMinute = selectedDateTime.getMinutes();
        const selectedDate = new Date(formData.reservation_date);

        // Check if the selected date is today
        const today = new Date();
        const isSameDay = selectedDate.toDateString() === today.toDateString();

        // ========== Validation 1: Block Past Time Slots on Same Day ==========
        if (isSameDay && (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute))) {
            Swal.fire({
                title: '⚠️ Time Restriction',
                html: `<div class="space-y-2">
                        <p class="text-yellow-400 font-semibold">Selected time has already passed</p>
                       </div>`,
                icon: 'warning',
                confirmButtonText: 'Update Time',
                buttonsStyling: true
            });
            return;
        }

        // ========== Validation 2: Prevent Booking for Past Dates ==========
        const dayStart = new Date(); // Midnight of today
        dayStart.setHours(0, 0, 0, 0);
        if (selectedDate < dayStart) {
            Swal.fire({
                title: '⚠️ Reservation Date Restricted',
                text: 'Reservations cannot be made for past dates. Please select a future date.',
                icon: 'warning',
                confirmButtonText: 'Update Date',
                buttonsStyling: true
            });
            return;
        }

        // ========== Validation 3: Duration Must Be At Least 1 Hour ==========
        const startTime = formData.start_time;
        const endTime = formData.end_time;
        const startTimeMinutes = parseTimeToMinutes(startTime);
        const endTimeMinutes = parseTimeToMinutes(endTime);
        const timeDifference = endTimeMinutes - startTimeMinutes;

        if (timeDifference < 60) {
            Swal.fire({
                title: '⏱️ Duration Restriction',
                html: `<div class="space-y-2">
                        <p class="text-red-400 font-semibold">Minimum booking duration not met</p>
                        <p class="text-sm text-gray-300">Reservations must be at least 1 hour long</p>
                       </div>`,
                icon: 'error',
                confirmButtonText: 'Adjust Time',
                buttonsStyling: true
            });
            return;
        }

        // ========== Validation 4: Duration Cannot Exceed 4 Hours ==========
        const maxReservationTime = 240; // 4 hours in minutes
        if (timeDifference > maxReservationTime) {
            Swal.fire({
                title: '⏰ Maximum Duration Exceeded',
                html: `<div class="space-y-2">
                        <p class="text-red-400 font-semibold">Booking duration exceeds limit</p>
                        <p class="text-sm text-gray-300">Reservations cannot exceed 4 hours</p>
                        <p class="text-xs text-gray-400 mt-2">Please adjust your end time or make multiple bookings</p>
                       </div>`,
                icon: 'error',
                confirmButtonText: 'Adjust Duration',
                buttonsStyling: true
            });
            return;
        }

        // ========== Validation 5: Check Time Slot Availability ==========
        const isAvailable = isTimeSlotAvailable(
            formData.start_time,
            formData.end_time,
            formData.reservation_date,
            formData.service_type
        );
        if (!isAvailable) {
            Swal.fire({
                title: '⚠️ Time Slot Unavailable',
                html: `<div class="space-y-2">
                        <p class="text-red-400 font-semibold">Selected time slot is already booked</p>
                        <p class="text-sm text-gray-300">Please select a different time slot</p>
                       </div>`,
                icon: 'warning',
                confirmButtonText: 'Select Another Time',
                buttonsStyling: true
            });
            return;
        }

        // ========== Step 1: Calculate Pricing ==========
        const additional_members = getAdditionalMembers(); // Array of added members
        const price = calculatePrice(
            formData.service_type,
            formData.start_time,
            additional_members
        );

        console.log('Additional Members:', additional_members);
        console.log('Calculated Price:', price);

        // ========== Step 2: Confirm Pricing with Client ==========
        const priceConfirmed = await showPricingDialog(
            formData.service_type,
            price,
            additional_members,
            formData.start_time
        );
        if (!priceConfirmed) return;

        // ========== Step 3: Show Payment Modal ==========
        const paymentResult = await showPaymentDialog(price);
        if (!paymentResult) return;

        // ========== Step 4: Final Submission ==========
        await processReservation({
            ...formData,
            additional_members: additional_members.length > 0 ? additional_members : undefined,
            price,
            payment_details: paymentResult
        });

        // ========== Final Cleanup ==========
        const mainClientNameInput = document.querySelector('input[type="text"]');
        if (mainClientNameInput) {
            const mainClientName = mainClientNameInput.value;
            e.target.reset();
            mainClientNameInput.value = mainClientName; // Preserve main name field
        } else {
            e.target.reset();
        }

        clearAdditionalMembers();
        showSuccessMessage();

        // Optional: Refresh calendar if available
        if (typeof initializeCalendar === 'function') {
            initializeCalendar();
        }

    } catch (error) {
        console.error('Reservation error:', error);
        showErrorMessage(error.message);
    }
}

// ========== Utility: Convert Time String to Minutes ==========
function parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}
