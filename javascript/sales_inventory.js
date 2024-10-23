// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addSupplementBtn = document.getElementById('addSupplementBtn');
const addSupplementModal = document.getElementById('addSupplementModal');
const supplementForm = document.getElementById('supplementForm');
const closeModalBtn = document.getElementById('closeModalBtn');
let selectedSupplementRow = null;

// Load supplements on page load
document.addEventListener('DOMContentLoaded', loadSupplements);

// Modal functions
function openSupplementModal() {
    if (addSupplementModal) {
        addSupplementModal.classList.remove('hidden');
    }
}

function closeSupplementModal() {
    if (addSupplementModal) {
        addSupplementModal.classList.add('hidden');
        selectedSupplementRow = null;
        if (supplementForm) {
            supplementForm.reset();
        }
    }
}

// Event listeners
if (addSupplementBtn) {
    addSupplementBtn.addEventListener('click', openSupplementModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeSupplementModal);
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

        supplementTableBody.innerHTML = ''; // Clear existing rows
        
        supplements.forEach(supplement => {
            const row = supplementTableBody.insertRow();
            row.dataset.id = supplement.id;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supplement.supplement_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${supplement.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-4" onclick="updateSupplement(this)">Update</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteSupplement(this)">Delete</button>
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

// Add or Update Supplement
if (supplementForm) {
    supplementForm.addEventListener('submit', async function(event) {
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
    });
}

// Update Supplement
function updateSupplement(btn) {
    selectedSupplementRow = btn.closest('tr');
    const supplementName = document.getElementById('supplementName');
    const supplementQuantity = document.getElementById('supplementQuantity');
    
    if (supplementName && supplementQuantity) {
        supplementName.value = selectedSupplementRow.cells[0].innerText;
        supplementQuantity.value = selectedSupplementRow.cells[1].innerText;
        openSupplementModal();
    }
}

// Delete Supplement
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