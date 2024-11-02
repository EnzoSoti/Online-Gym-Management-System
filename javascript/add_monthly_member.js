// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const memberForm = document.getElementById('memberForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const searchInput = document.getElementById('searchInput');
let selectedRow = null;
let allMembers = [];
let lastPolledData = null;
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

// Notification System
class NotificationSystem {
    constructor() {
        this.hasPermission = false;
        this.init();
    }

    async init() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
        }
    }

    async notify(title, options = {}) {
        // Always show SweetAlert2 notification
        Swal.fire({
            icon: options.icon || 'info',
            title: title,
            text: options.body || '',
            showConfirmButton: false,
            timer: 3000,
            position: 'top-end',
            toast: true
        });

        // Show system notification if permitted
        if (this.hasPermission) {
            new Notification(title, {
                body: options.body,
                icon: '../img/Fitworx logo.jpg' // Add your notification icon path
            });
        }
    }
}

const notificationSystem = new NotificationSystem();

// Load members on page load and start polling
document.addEventListener('DOMContentLoaded', () => {
    loadMembers();
    startPolling();
});

// Add search event listener
if (searchInput) {
    searchInput.addEventListener('input', filterMembers);
}

// Polling function with notification for changes
function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/monthly-members`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const newData = await response.json();
            
            // Check if data has changed before updating
            if (JSON.stringify(newData) !== JSON.stringify(lastPolledData)) {
                // Detect changes
                if (lastPolledData) {
                    const added = newData.filter(member => 
                        !lastPolledData.find(old => old.id === member.id)
                    );
                    const deleted = lastPolledData.filter(member => 
                        !newData.find(current => current.id === member.id)
                    );
                    const updated = newData.filter(member => {
                        const oldMember = lastPolledData.find(old => old.id === member.id);
                        return oldMember && JSON.stringify(member) !== JSON.stringify(oldMember);
                    });

                    // Notify of changes made by other users
                    if (added.length > 0) {
                        notificationSystem.notify('New Member Added', {
                            body: `${added.length} new member(s) have been added`,
                            icon: 'success'
                        });
                    }
                    if (updated.length > 0) {
                        notificationSystem.notify('Member Updated', {
                            body: `${updated.length} member(s) have been updated`,
                            icon: 'info'
                        });
                    }
                    if (deleted.length > 0) {
                        notificationSystem.notify('Member Deleted', {
                            body: `${deleted.length} member(s) have been removed`,
                            icon: 'warning'
                        });
                    }
                }

                allMembers = newData;
                lastPolledData = newData;
                
                // If search input has value, filter the new data
                if (searchInput && searchInput.value) {
                    filterMembers();
                } else {
                    renderMembers(allMembers);
                }
            }
        } catch (error) {
            console.error('Polling error:', error);
            notificationSystem.notify('Connection Error', {
                body: 'Failed to fetch latest updates',
                icon: 'error'
            });
        }
    }, POLLING_INTERVAL);
}

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

// Filter members based on search input
function filterMembers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredMembers = allMembers.filter(member => 
        member.member_name.toLowerCase().includes(searchTerm)
    );
    renderMembers(filteredMembers);
}

// Render members to table
function renderMembers(members) {
    const memberTableBody = document.getElementById('memberTableBody');
    
    if (!memberTableBody) {
        console.error('Table body element not found');
        return;
    }

    // Store current scroll position
    const scrollPos = memberTableBody.parentElement.scrollTop;

    memberTableBody.innerHTML = ''; 
    
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
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors duration-200 text-sm mr-4" onclick="updateMember(this)">Update</button>
                <button class="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md transition-colors duration-200 text-sm" onclick="deleteMember(this)">Delete</button>
            </td>
        `;
    });

    // Restore scroll position
    memberTableBody.parentElement.scrollTop = scrollPos;
}

async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allMembers = await response.json();
        lastPolledData = [...allMembers]; // Store initial data for polling comparison
        renderMembers(allMembers);
    } catch (error) {
        console.error('Error loading members:', error);
        notificationSystem.notify('Error Loading Members', {
            body: 'Failed to load member data',
            icon: 'error'
        });
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
            
            notificationSystem.notify(
                selectedRow ? 'Member Updated' : 'Member Added',
                {
                    body: selectedRow 
                        ? `Successfully updated ${memberData.member_name}`
                        : `Successfully added ${memberData.member_name}`,
                    icon: 'success'
                }
            );
        } catch (error) {
            console.error('Error:', error);
            notificationSystem.notify('Error', {
                body: error.message,
                icon: 'error'
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
    const memberName = row.cells[0].innerText;

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
            notificationSystem.notify('Member Deleted', {
                body: `Successfully deleted ${memberName}`,
                icon: 'success'
            });
        } catch (error) {
            console.error('Error:', error);
            notificationSystem.notify('Error', {
                body: error.message,
                icon: 'error'
            });
        }
    }
}