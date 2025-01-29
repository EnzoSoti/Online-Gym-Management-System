
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', function() {
        // Toggle the mobile menu
        mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
});

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
            title: '📅 Reservations',
            text: 'No reservations found for this date.',
            icon: 'info',
            confirmButtonText: 'Close',
            showClass: {
                popup: ''
            },
            customClass: {},
            buttonsStyling: true
        });
        return;
    }

    let htmlContent = `
        <div class="bg-white">
            <div class="max-h-[70vh] overflow-y-auto">
                <div class="grid gap-3">
    `;
    
    reservations.forEach((reservation) => {
        const getServiceInfo = (serviceType) => {
            const type = serviceType.toLowerCase();
            if (type.includes('zumba')) return {
                color: 'bg-pink-600 text-white',
                label: 'Zumba',
                icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M13 17h8m0 0l-3-3m3 3l-3 3M3 7h8m0 0L8 4m3 3L8 10" />
                </svg>`
            };
            if (type.includes('court')) return {
                color: 'bg-blue-600 text-white',
                label: 'Court',
                icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M4 8h16M4 16h16M8 4v16M16 4v16" />
                </svg>`
            };
            return {
                color: 'bg-indigo-600 text-white',
                label: serviceType,
                icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`
            };
        };

        const serviceInfo = getServiceInfo(reservation.service_type);
        const startTime12 = formatTo12Hour(reservation.start_time);
        const endTime12 = formatTo12Hour(reservation.end_time);
        
        htmlContent += `
            <div class="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center text-gray-900">
                            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M12 8v4l2 2m8-4a10 10 0 11-20 0 10 10 0 0120 0z" />
                            </svg>
                            <span class="font-semibold text-base">${startTime12} - ${endTime12}</span>
                        </div>
                        <div class="${serviceInfo.color} px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2">
                            ${serviceInfo.icon}
                            <span>${serviceInfo.label}</span>
                        </div>
                    </div>
                    <div class="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Confirmed</span>
                    </div>
                </div>
                
                <div class="flex items-center space-x-2 text-gray-900">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="font-medium text-base">
                        ${reservation.customer_name}
                    </span>
                </div>
            </div>
        `;
    });

    htmlContent += '</div></div></div>';

    Swal.fire({
        title: 'Today\'s Reservations',
        html: htmlContent,
        confirmButtonText: 'Close',
        showClass: {
            popup: ''
        },
        customClass: {},
        buttonsStyling: true
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

