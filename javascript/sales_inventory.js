// Open Modal for Adding/Updating Supplement
const addSupplementBtn = document.getElementById('addSupplementBtn');
const addSupplementModal = document.getElementById('addSupplementModal');
const supplementForm = document.getElementById('supplementForm');
let selectedSupplementRow = null;

// Smooth Open Modal
addSupplementBtn.onclick = function() {
    addSupplementModal.classList.remove('hidden');
    setTimeout(() => {
        addSupplementModal.classList.remove('opacity-0', 'scale-95'); // Fade in
        addSupplementModal.classList.add('opacity-100', 'scale-100');
    }, 10); // Delay to trigger transition
}

// Smooth Close Modal
function closeSupplementModal() {
    addSupplementModal.classList.add('opacity-0', 'scale-95'); // Fade out
    addSupplementModal.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => {
        addSupplementModal.classList.add('hidden'); // Fully hide modal after transition
        supplementForm.reset();
        selectedSupplementRow = null;
    }, 300); // Match duration with transition timing (300ms)
}

// Add or Update Supplement
supplementForm.onsubmit = function(event) {
    event.preventDefault();
    const supplementName = document.getElementById('supplementName').value;
    const supplementQuantity = document.getElementById('supplementQuantity').value;
    
    if (selectedSupplementRow) {
        // Update existing supplement
        selectedSupplementRow.cells[0].innerText = supplementName;
        selectedSupplementRow.cells[1].innerText = supplementQuantity;
    } else {
        // Add new supplement
        const supplementTableBody = document.getElementById('supplementTableBody');
        const newRow = supplementTableBody.insertRow();
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${supplementName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${supplementQuantity}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-4" onclick="updateSupplement(this)">Update</button>
                <button class="text-red-600 hover:text-red-900" onclick="deleteSupplement(this)">Delete</button>
            </td>
        `;
    }

    closeSupplementModal();
}

// Update Supplement
function updateSupplement(btn) {
    selectedSupplementRow = btn.closest('tr');
    document.getElementById('supplementName').value = selectedSupplementRow.cells[0].innerText;
    document.getElementById('supplementQuantity').value = selectedSupplementRow.cells[1].innerText;
    
    addSupplementModal.classList.remove('hidden');
    setTimeout(() => {
        addSupplementModal.classList.remove('opacity-0', 'scale-95');
        addSupplementModal.classList.add('opacity-100', 'scale-100');
    }, 10); // Trigger smooth opening
}

// Delete Supplement with SweetAlert Confirmation
function deleteSupplement(btn) {
    const row = btn.closest('tr');
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            row.remove();
            Swal.fire('Deleted!', 'Supplement has been deleted.', 'success');
        }
    });
}
