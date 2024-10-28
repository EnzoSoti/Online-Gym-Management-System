// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const memberForm = document.getElementById('memberForm');
const closeModalBtn = document.getElementById('closeModalBtn');
let selectedRow = null;

// Load members on page load
document.addEventListener('DOMContentLoaded', loadMembers);

// Modal functions
function openMemberModal() {
    if (addMemberModal) {
        addMemberModal.classList.remove('hidden');
    }
}

function closeMemberModal() {
    if (addMemberModal) {
        addMemberModal.classList.add('hidden');
        selectedRow = null;
        if (memberForm) {
            memberForm.reset();
        }
    }
}

// Event listeners
if (addMemberBtn) {
    addMemberBtn.addEventListener('click', openMemberModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeMemberModal);
}

async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const members = await response.json();
        const memberTableBody = document.getElementById('memberTableBody');
        
        if (!memberTableBody) {
            console.error('Table body element not found');
            return;
        }

        memberTableBody.innerHTML = ''; // Clear existing rows
        
        members.forEach(member => {
            const row = memberTableBody.insertRow();
            row.dataset.id = member.id;
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${member.member_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${member.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.start_date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.end_date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-4" onclick="updateMember(this)">Update</button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteMember(this)">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading members:', error);
        Swal.fire('Error', 'Failed to load members', 'error');
    }
}

// Add or Update Member
if (memberForm) {
    memberForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            const memberData = {
                member_name: document.getElementById('memberName').value,
                status: document.getElementById('memberStatus').value,
                start_date: document.getElementById('startDate').value,
                end_date: document.getElementById('endDate').value
            };

            const url = selectedRow 
                ? `${API_BASE_URL}/monthly-members/${selectedRow.dataset.id}`
                : `${API_BASE_URL}/monthly-members`;

            const method = selectedRow ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });

            if (!response.ok) {
                throw new Error('Failed to process member');
            }

            await loadMembers();
            closeMemberModal();
            
            Swal.fire({
                icon: 'success',
                title: selectedRow ? 'Member updated successfully' : 'Member added successfully',
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

// Update Member
function updateMember(btn) {
    selectedRow = btn.closest('tr');
    const memberName = document.getElementById('memberName');
    const memberStatus = document.getElementById('memberStatus');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (memberName && memberStatus && startDate && endDate) {
        memberName.value = selectedRow.cells[0].innerText;
        memberStatus.value = selectedRow.cells[1].querySelector('span').innerText;
        startDate.value = new Date(selectedRow.cells[2].innerText).toISOString().split('T')[0];
        endDate.value = new Date(selectedRow.cells[3].innerText).toISOString().split('T')[0];
        openMemberModal();
    }
}

// Delete Member
async function deleteMember(btn) {
    const row = btn.closest('tr');
    const memberId = row.dataset.id;

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
            const response = await fetch(`${API_BASE_URL}/monthly-members/${memberId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete member');

            await loadMembers();
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Member has been deleted.',
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