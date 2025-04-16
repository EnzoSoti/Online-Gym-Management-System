// ========== Reservation Manager Class ==========
class ReservationManager {
    constructor() {
        this.API_URL = 'http://localhost:3000/api/admin/reservations';
        this.table = document.getElementById('reservations-body');
        this.POLLING_INTERVAL = 5000;
        this.isPolling = true;
        this.reservationsData = [];

        this.initializeEventListeners();
        this.loadReservations(true);
        this.startPolling();
    }

    // ========== Event Listeners ==========
    initializeEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
                this.loadReservations();
            }
        });
        
        this.table.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const row = target.closest('tr');
            const reservationId = row.querySelector('td').textContent;

            if (target.classList.contains('view-btn')) {
                this.viewReservation(reservationId);
            } else if (target.classList.contains('cancel-btn')) {
                this.cancelReservation(reservationId);
            }
        });
    }

    // ========== Polling Methods ==========
    startPolling() {
        this.isPolling = true;
        this.poll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async poll() {
        if (!this.isPolling) return;
        await this.loadReservations();
        setTimeout(() => this.poll(), this.POLLING_INTERVAL);
    }

    // ========== Reservation Management ==========
    async loadReservations(isInitialLoad = false) {
        try {
            const response = await fetch(this.API_URL);
            const reservations = await response.json();
            
            this.reservationsData = reservations;
            this.table.innerHTML = reservations.map(reservation => this.createTableRow(reservation)).join('');
        } catch (error) {
            console.error('Failed to load reservations:', error);
            if (isInitialLoad) {
                this.showError('Failed to load reservations');
            }
        }
    }

    createTableRow(reservation) {
        return `
            <tr class="hover:bg-indigo-50 transition-colors duration-200 ease-in-out border-b border-indigo-100 last:border-none">
                <td class="px-6 py-4 text-sm font-medium text-indigo-900 whitespace-nowrap">${reservation.id}</td>
                <td class="px-6 py-4 text-sm text-indigo-700 whitespace-nowrap">${reservation.reservation_date}</td>
                <td class="px-6 py-4 text-sm text-indigo-700 whitespace-nowrap">${reservation.start_time}</td>
                <td class="px-6 py-4 text-sm text-indigo-700 whitespace-nowrap">${reservation.end_time}</td>
                <td class="px-6 py-4 text-sm font-semibold text-indigo-900 whitespace-nowrap">${reservation.customer_name}</td>
                <td class="px-6 py-4 text-sm text-indigo-700 whitespace-nowrap">${reservation.service_type}</td>
                <td class="px-6 py-4 text-sm font-medium text-emerald-600 whitespace-nowrap">Active</td>
                <td class="px-6 py-4 flex items-center space-x-3 whitespace-nowrap">
                    <button class="view-btn group flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-lg shadow-sm" title="View">
                        <svg class="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button class="cancel-btn group flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300 rounded-lg shadow-sm" title="Cancel">
                        <svg class="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }

    async cancelReservation(id) {
        try {
            const result = await Swal.fire({
                title: 'Cancel Reservation',
                text: 'Are you sure you want to cancel this reservation? This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, cancel it!',
                cancelButtonText: 'No, keep it'
            });

            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Cancelling Reservation...',
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false
                });

                const response = await fetch(`${this.API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.playSound('success-sound');
                    Swal.close();

                    Toastify({
                        text: "The reservation has been cancelled successfully.",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#4CAF50",
                        stopOnFocus: true
                    }).showToast();

                    await this.loadReservations(); // Refresh the table
                } else {
                    throw new Error('Failed to cancel reservation');
                }
            }
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to cancel reservation. Please try again.'
            });
        }
    }

    // ========== Reservation Viewing ==========
    viewReservation(id) {
        const reservation = this.reservationsData.find(r => r.id.toString() === id.toString());
        
        if (reservation) {
            const printStyles = `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .swal2-popup * {
                        visibility: visible;
                    }
                    .swal2-popup {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm !important;
                        min-height: 148mm !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .receipt-content {
                        font-size: 12pt;
                    }
                    @page {
                        size: A5;
                        margin: 0;
                    }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.innerText = printStyles;
            document.head.appendChild(styleSheet);

            Swal.fire({
                title: '<h4 class="text-dark fw-bold mb-0">COURT RESERVATION</h4>',
                html: `
                    <div class="text-left p-3" style="font-family: sans-serif;">
                        <div class="text-center mb-4">
                            <h6 class="text-secondary mb-2">COURT BOOKING DETAILS</h6>
                            <small class="text-muted">Booking ID: #${reservation.id}</small>
                            <hr class="my-3">
                        </div>
                        <div class="row g-3">
                            <div class="col-12">
                                <div class="d-flex justify-content-start">
                                    <span class="text-secondary">Play Date: ${reservation.reservation_date}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="d-flex justify-content-start">
                                    <span class="text-secondary">Court Hours: ${reservation.start_time} - ${reservation.end_time}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="d-flex justify-content-start">
                                    <span class="text-secondary">Reserved By: ${reservation.customer_name}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="d-flex justify-content-start">
                                    <span class="text-secondary">Court Type: ${reservation.service_type}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="d-flex justify-content-start">
                                    <span class="text-secondary">Players: ${reservation.additional_members || 'Single Player'}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <hr class="my-2">
                            </div>
                            <div class="col-12">
                                <div class="d-flex justify-content-between">
                                    <span class="text-dark fw-bold">COURT FEE:</span>
                                    <span class="text-dark fw-bold">₱${reservation.price}</span>
                                </div>
                            </div>
                            <div class="col-12">
                                <hr class="my-2">
                            </div>
                            <div class="col-12 text-center">
                                <p class="mb-2 fw-bold text-secondary">IMPORTANT REMINDERS:</p>
                                <ul class="list-unstyled text-secondary" style="font-size: 0.9rem;">
                                    <li>• Wear appropriate sports attire and shoes</li>
                                    <li>• No food inside the court</li>
                                    <li>• Time extension subject to availability</li>
                                    <li>• Non-refundable and non-transferable</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <button onclick="window.print()" class="btn btn-secondary w-100 mt-2 mb-2 no-print">
                        <i class="fas fa-print me-2"></i> Print Booking Details
                    </button>
                `,
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#198754',
                width: '26rem',
                padding: '1.5em',
                background: '#fff',
                customClass: {
                    container: 'custom-swal-popup',
                    popup: 'custom-swal-popup'
                }
            }).then(() => {
                styleSheet.remove();
            });
        } else {
            this.showError('Reservation not found');
        }
    }

    // ========== Helper Methods ==========
    playSound(soundId) {
        const sound = document.getElementById(soundId);
        sound.play();
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

// ========== Initialize Reservation Manager ==========
document.addEventListener('DOMContentLoaded', () => {
    new ReservationManager();
});
