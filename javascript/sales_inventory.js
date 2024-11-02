class SupplementManager {
    constructor() {
        this.API_URL = 'http://localhost:3000/api/supplements';
        this.modal = document.getElementById('supplementModal');
        this.form = document.getElementById('supplementForm');
        this.table = document.getElementById('supplementsTable');
        this.modalTitle = document.getElementById('modalTitle');
        this.currentId = null;
        this.LOW_STOCK_THRESHOLD = 10;
        this.POLLING_INTERVAL = 5000; // 5 seconds polling interval
        this.currentSupplements = []; // Store current state
        this.isPolling = true; // Flag to control polling
        this.lowStockNotified = new Set(); // Track which items have been notified

        this.initializeEventListeners();
        this.loadSupplements(true); // Initial load
        this.startPolling();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('openModalBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Table actions
        this.table.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;

            if (e.target.classList.contains('edit-btn')) {
                this.editSupplement(row);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteSupplement(row);
            }
        });

        // Add visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
                this.loadSupplements(); // Refresh data when page becomes visible
            }
        });
    }

    startPolling() {
        this.isPolling = true;
        this.poll();
    }

    stopPolling() {
        this.isPolling = false;
    }

    async poll() {
        if (!this.isPolling) return;

        await this.loadSupplements();
        setTimeout(() => this.poll(), this.POLLING_INTERVAL);
    }

    openModal(supplement = null) {
        this.stopPolling(); // Stop polling when modal is open
        this.currentId = supplement ? supplement.id : null;
        this.modalTitle.textContent = supplement ? 'Edit Supplement' : 'Add Supplement';
        
        document.getElementById('name').value = supplement ? supplement.supplement_name : '';
        document.getElementById('quantity').value = supplement ? supplement.quantity : '';
        document.getElementById('price').value = supplement ? supplement.price : '';
        
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.form.reset();
        this.currentId = null;
        this.startPolling(); // Resume polling when modal is closed
    }

    async loadSupplements(isInitialLoad = false) {
        try {
            const response = await fetch(this.API_URL);
            const newSupplements = await response.json();
            
            // Check if data has changed
            const hasChanges = JSON.stringify(this.currentSupplements) !== JSON.stringify(newSupplements);
            
            if (hasChanges || isInitialLoad) {
                this.table.innerHTML = newSupplements.map(supplement => this.createTableRow(supplement)).join('');
                
                // Update current state before checking low stock
                const previousSupplements = [...this.currentSupplements];
                this.currentSupplements = newSupplements;

                // Check for low stock items with immediate notification
                this.checkLowStockWithUpdates(previousSupplements, newSupplements);
                
                // Show update notification if it's not the initial load
                if (hasChanges && !isInitialLoad && !this.modal.classList.contains('hidden')) {
                    this.showUpdateNotification();
                }
            }
        } catch (error) {
            console.error('Failed to load supplements:', error);
            // Only show error if it's the initial load
            if (isInitialLoad) {
                this.showError('Failed to load supplements');
            }
        }
    }

    checkLowStockWithUpdates(previousSupplements, newSupplements) {
        // Find items that are now below threshold
        const newLowStockItems = newSupplements.filter(supp => {
            const prevSupp = previousSupplements.find(ps => ps.id === supp.id);
            return supp.quantity <= this.LOW_STOCK_THRESHOLD && (
                !prevSupp || 
                prevSupp.quantity > this.LOW_STOCK_THRESHOLD ||
                (supp.quantity < prevSupp.quantity && prevSupp.quantity <= this.LOW_STOCK_THRESHOLD)
            );
        });

        if (newLowStockItems.length > 0) {
            this.showLowStockNotification(newLowStockItems);
        }
    }

    showUpdateNotification() {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Inventory Updated',
            text: 'The supplement list has been updated.',
            showConfirmButton: false,
            timer: 2000
        });
    }

    showLowStockNotification(items) {
        Swal.fire({
            icon: 'warning',
            title: 'Low Stock Alert!',
            html: `
                <div class="text-left">
                    <p class="mb-2">The following items are running low:</p>
                    <div class="bg-yellow-50 p-3 rounded-lg">
                        ${items.map(item => `
                            <div class="mb-2">
                                <span class="font-semibold">${item.supplement_name}</span>
                                <span class="text-red-600 ml-2">(${item.quantity} remaining)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `,
            showConfirmButton: true,
            confirmButtonText: 'Acknowledge',
            confirmButtonColor: '#4F46E5'
        });
    }

    createTableRow(supplement) {
        const stockClass = supplement.quantity <= this.LOW_STOCK_THRESHOLD 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800';
    
        return `
            <tr data-id="${supplement.id}" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-slate-900">${supplement.supplement_name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockClass}">
                        ${supplement.quantity} Available
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${supplement.price} ₱
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-btn bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md transition-colors duration-200 text-sm mr-3">Edit</button>
                    <button class="delete-btn bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md transition-colors duration-200 text-sm">Delete</button>
                </td>
            </tr>
        `;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            supplement_name: document.getElementById('name').value,
            quantity: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value)
        };
    
        try {
            const url = this.currentId ? `${this.API_URL}/${this.currentId}` : this.API_URL;
            const method = this.currentId ? 'PUT' : 'POST';
    
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) throw new Error('Failed to save supplement');
    
            // Store previous state before loading new data
            const previousSupplements = [...this.currentSupplements];
            
            // Load new data and check for low stock
            const newSupplements = await response.json();
            this.checkLowStockWithUpdates(previousSupplements, [newSupplements]);
            
            await this.loadSupplements();
            this.closeModal();
            this.showSuccess(`Supplement ${this.currentId ? 'updated' : 'added'} successfully`);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async deleteSupplement(row) {
        const id = row.dataset.id;
        const name = row.querySelector('.text-slate-900').textContent;

        if (await this.confirmDelete(name)) {
            try {
                const response = await fetch(`${this.API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Failed to delete supplement');

                await this.loadSupplements();
                this.showSuccess('Supplement deleted successfully');
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    editSupplement(row) {
        const id = row.dataset.id;
        const name = row.querySelector('.text-slate-900').textContent;
        const quantityText = row.querySelector('.rounded-full').textContent;
        const priceText = row.querySelectorAll('.rounded-full')[1].textContent;
        
        const quantity = parseInt(quantityText);
        const price = parseFloat(priceText);
        
        this.openModal({
            id: id,
            supplement_name: name,
            quantity: quantity,
            price: price
        });
    }

    async confirmDelete(name) {
        return await Swal.fire({
            title: 'Are you sure?',
            text: `Delete supplement "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Delete'
        }).then(result => result.isConfirmed);
    }

    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            timer: 2000,
            showConfirmButton: false
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

// Initialize the supplement manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SupplementManager();
});