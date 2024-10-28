// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addSupplementBtn = document.getElementById('addSupplementBtn');
const addSupplementModal = document.getElementById('addSupplementModal');
const supplementForm = document.getElementById('supplementForm');
const closeModalBtn = document.getElementById('closeModalBtn');
let selectedSupplementRow = null;

// Load supplements on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSupplements();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Modal open button
    addSupplementBtn.addEventListener('click', () => {
        openSupplementModal();
    });

    // Modal close button
    closeModalBtn.addEventListener('click', () => {
        closeSupplementModal();
    });

    // Form submission
    supplementForm.addEventListener('submit', handleFormSubmit);

    // Event delegation for update and delete buttons
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('update-btn')) {
            updateSupplement(event.target);
        } else if (event.target.classList.contains('delete-btn')) {
            deleteSupplement(event.target);
        }
    });

    // Close modal when clicking outside
    addSupplementModal.addEventListener('click', (event) => {
        if (event.target === addSupplementModal) {
            closeSupplementModal();
        }
    });
}

// Modal functions
function openSupplementModal() {
    addSupplementModal.classList.remove('hidden');
}

function closeSupplementModal() {
    addSupplementModal.classList.add('hidden');
    selectedSupplementRow = null;
    supplementForm.reset();
}

async function loadSupplements() {
    try {
        const response = await fetch(`${API_BASE_URL}/supplements`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const supplements = await response.json();
        const supplementTableBody = document.getElementById('supplementTableBody');
        
        if (!supplementTableBody) {
            console.error('Table body element not found');
            return;
        }

        supplementTableBody.innerHTML = '';
        
        supplements.forEach(supplement => {
            const row = supplementTableBody.insertRow();
            row.dataset.id = supplement.id;
            row.classList.add('hover:bg-slate-50', 'transition-colors', 'duration-150');
            
            row.innerHTML = `
                <td class="py-4">
                    <div class="flex items-center space-x-4">
                        <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-slate-900">${supplement.supplement_name}</div>
                            <div class="text-sm text-slate-500">In Stock</div>
                        </div>
                    </div>
                </td>
                <td class="py-4">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        ${supplement.quantity} units
                    </span>
                </td>
                <td class="py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 font-medium mr-4 transition-colors duration-150 update-btn">
                        Edit
                    </button>
                    <button class="text-rose-600 hover:text-rose-900 font-medium transition-colors duration-150 delete-btn">
                        Delete
                    </button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading supplements:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load supplements. Please check if the server is running.'
        });
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        const supplementData = {
            supplement_name: document.getElementById('supplementName').value,
            quantity: parseInt(document.getElementById('supplementQuantity').value)
        };

        const url = selectedSupplementRow 
            ? `${API_BASE_URL}/supplements/${selectedSupplementRow.dataset.id}`
            : `${API_BASE_URL}/supplements`;

        const method = selectedSupplementRow ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplementData)
        });

        if (!response.ok) {
            throw new Error('Failed to process supplement');
        }

        await loadSupplements();
        closeSupplementModal();
        
        Swal.fire({
            icon: 'success',
            title: selectedSupplementRow ? 'Supplement updated successfully' : 'Supplement added successfully',
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message
        });
    }
}

function updateSupplement(btn) {
    selectedSupplementRow = btn.closest('tr');
    const supplementName = document.getElementById('supplementName');
    const supplementQuantity = document.getElementById('supplementQuantity');
    
    if (supplementName && supplementQuantity) {
        const nameElement = selectedSupplementRow.querySelector('.text-slate-900');
        const quantityElement = selectedSupplementRow.querySelector('.bg-emerald-100');
        
        supplementName.value = nameElement.textContent;
        supplementQuantity.value = parseInt(quantityElement.textContent);
        openSupplementModal();
    }
}

async function deleteSupplement(btn) {
    const row = btn.closest('tr');
    const supplementId = row.dataset.id;

    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/supplements/${supplementId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete supplement');

            await loadSupplements();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Supplement has been deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message
            });
        }
    }
}