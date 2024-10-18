// Open Modal
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const memberForm = document.getElementById('memberForm');
let selectedRow = null;

// Smooth Open Modal
addMemberBtn.onclick = function() {
    addMemberModal.classList.remove('hidden');
    setTimeout(() => {
        addMemberModal.classList.remove('opacity-0', 'scale-95');   // Fade in
        addMemberModal.classList.add('opacity-100', 'scale-100');
    }, 10); // Delay to trigger transition
}

// Smooth Close Modal
function closeModal() {
    addMemberModal.classList.add('opacity-0', 'scale-95');   // Fade out
    addMemberModal.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => {
        addMemberModal.classList.add('hidden');   // Fully hide modal after transition
        memberForm.reset();
        selectedRow = null;
    }, 300);  // Match duration with transition timing (300ms)
}

// Add or Update Member
memberForm.onsubmit = function(event) {
    event.preventDefault();
    const memberName = document.getElementById('memberName').value;
    const memberStatus = document.getElementById('memberStatus').value;
    
    if (selectedRow) {
        // Update existing member
        selectedRow.cells[0].innerText = memberName;
        selectedRow.cells[1].innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${memberStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${memberStatus}</span>`;
    } else {
        // Add new member
        const memberTableBody = document.getElementById('memberTableBody');
        const newRow = memberTableBody.insertRow();
        newRow.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${memberName}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${memberStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${memberStatus}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-4" onclick="updateMember(this)">Update</button>
                <button class="text-red-600 hover:text-red-900" onclick="deleteMember(this)">Delete</button>
            </td>
        `;
    }

    closeModal();
}

// Update Member
function updateMember(btn) {
    selectedRow = btn.closest('tr');
    document.getElementById('memberName').value = selectedRow.cells[0].innerText;
    document.getElementById('memberStatus').value = selectedRow.cells[1].innerText;
    
    addMemberModal.classList.remove('hidden');
    setTimeout(() => {
        addMemberModal.classList.remove('opacity-0', 'scale-95');
        addMemberModal.classList.add('opacity-100', 'scale-100');
    }, 10); // Trigger smooth opening
}

// Delete Member with SweetAlert Confirmation
function deleteMember(btn) {
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
            Swal.fire('Deleted!', 'Member has been deleted.', 'success');
        }
    });
}
