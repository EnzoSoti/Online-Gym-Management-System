class SupplementManager {
    constructor() {
        this.API_URL = 'http://localhost:3000/api/supplements';
        this.modal = document.getElementById('supplementModal');
        this.form = document.getElementById('supplementForm');
        this.table = document.getElementById('supplementsTable');
        this.modalTitle = document.getElementById('modalTitle');
        this.currentId = null;

        this.initializeEventListeners();
        this.loadSupplements();
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
    }

    openModal(supplement = null) {
        this.currentId = supplement ? supplement.id : null;
        this.modalTitle.textContent = supplement ? 'Edit Supplement' : 'Add Supplement';
        
        document.getElementById('name').value = supplement ? supplement.supplement_name : '';
        document.getElementById('quantity').value = supplement ? supplement.quantity : '';
        
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.form.reset();
        this.currentId = null;
    }

    async loadSupplements() {
        try {
            const response = await fetch(this.API_URL);
            const supplements = await response.json();
            
            this.table.innerHTML = supplements.map(supplement => this.createTableRow(supplement)).join('');
        } catch (error) {
            this.showError('Failed to load supplements');
        }
    }

    createTableRow(supplement) {
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
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${supplement.quantity} Items
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${supplement.price} ₱
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="edit-btn text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button class="delete-btn text-red-600 hover:text-red-900">Delete</button>
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
        const quantity = parseInt(row.querySelector('.bg-green-100').textContent);
        const price = parseInt(row.querySelector('.bg-green-100').textContent);
        
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
