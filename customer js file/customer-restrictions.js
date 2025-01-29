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
                    '</div>',
                icon: 'warning',
                confirmButtonText: 'Update Time',
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
                    popup: ''  // Removed animation
                },
                customClass: {
                    popup: '',  // Removed custom styling
                    title: '',  // Removed custom styling
                    confirmButton: ''  // Removed custom styling
                },
                buttonsStyling: true  // Reverted to default button styling
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
                    popup: ''  // Removed animation
                },
                customClass: {
                    popup: '',  // Removed custom styling
                    title: '',  // Removed custom styling
                    confirmButton: ''  // Removed custom styling
                },
                buttonsStyling: true  // Reverted to default button styling
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

        // Preserve the "Main Client Name" field
        const mainClientNameInput = document.querySelector('input[type="text"]');
        if (mainClientNameInput) {
            const mainClientName = mainClientNameInput.value;
            e.target.reset();
            mainClientNameInput.value = mainClientName;
        } else {
            e.target.reset();
        }

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

