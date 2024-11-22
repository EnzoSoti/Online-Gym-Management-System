// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberModal = document.getElementById('addMemberModal');
const memberForm = document.getElementById('memberForm');
const closeModalBtn = document.getElementById('closeModalBtn');
const searchInput = document.getElementById('memberSearch');
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
                icon: '/img/Fitworx logo.jpg' // Add your notification icon path
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
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredMembers = allMembers.filter(member => 
            member.member_name.toLowerCase().includes(searchTerm) ||
            member.type.toLowerCase().includes(searchTerm) ||
            member.status.toLowerCase().includes(searchTerm)
        );
        renderMembers(filteredMembers);
    });
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${member.type}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-100 text-green-800' : member.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">${member.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.start_date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.end_date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="inline-flex items-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="updateMember(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update
                </button>

                <button class="inline-flex items-center gap-2 border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white px-4 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="deleteMember(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </button>

                <button class="inline-flex items-center gap-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="renewMembership(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Renew
                </button>

                <button class="inline-flex items-center gap-2 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="verifyMember(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Verify
                </button>
                <button class="inline-flex items-center gap-2 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 transition-all duration-200 text-sm font-medium mr-4" onclick="viewPicture(this)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View ID Picture
                </button>
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
            const memberName = document.getElementById('memberName');
            const memberType = document.getElementById('memberType');
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            const schoolIdPicture = document.getElementById('school_id_picture').files[0];

            if (!memberName || !memberType || !startDate || !endDate) {
                throw new Error('Missing required form fields');
            }

            const formData = new FormData();
            formData.append('member_name', memberName.value.trim());
            formData.append('type', memberType.value.trim());
            formData.append('start_date', startDate.value);
            formData.append('end_date', endDate.value);
            if (schoolIdPicture) {
                formData.append('school_id_picture', schoolIdPicture);
            }

            const url = selectedRow 
                ? `${API_BASE_URL}/monthly-members/${selectedRow.dataset.id}`
                : `${API_BASE_URL}/monthly-members`;

            const method = selectedRow ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process member');
            }

            await loadMembers();
            closeMemberModal();
            
            notificationSystem.notify(
                selectedRow ? 'Member Updated' : 'Member Added',
                {
                    body: selectedRow 
                        ? `Successfully updated ${memberName.value.trim()}`
                        : `Successfully added ${memberName.value.trim()}`,
                    icon: 'success'
                }
            );
        } catch (error) {
            console.error('Form submission error:', error);
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
    const memberType = document.getElementById('memberType');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (memberName && memberType && startDate && endDate) {
        memberName.value = selectedRow.cells[0].innerText;
        memberType.value = selectedRow.cells[1].innerText.trim();
        startDate.value = new Date(selectedRow.cells[3].innerText).toISOString().split('T')[0];
        endDate.value = new Date(selectedRow.cells[4].innerText).toISOString().split('T')[0];
        openMemberModal();
    }
}

// Renew function
function getTodayFormatted() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getOneMonthFromDate(dateString) {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
}

async function renewMembership(btn) {
    const row = btn.closest('tr');
    const memberId = row.dataset.id;
    const memberName = row.cells[0].innerText;
    const memberType = row.cells[1].innerText;
    const originalData = {
        status: row.cells[2].querySelector('span').innerText,
        start_date: row.cells[3].innerText,
        end_date: row.cells[4].innerText
    };

    try {
        const today = getTodayFormatted();
        const nextMonth = getOneMonthFromDate(today);

        const memberData = {
            member_name: memberName,
            type: memberType,
            status: 'Active',
            start_date: today,
            end_date: nextMonth
        };

        // Show processing alert
        let timerInterval;
        const result = await Swal.fire({
            title: 'Renewing Membership',
            html: `Updating membership for ${memberName}`,
            timer: 10000,
            timerProgressBar: true,
            showCancelButton: true,
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                timerInterval = setInterval(() => {
                    const content = Swal.getHtmlContainer();
                    if (content) {
                        const seconds = Math.ceil(Swal.getTimerLeft() / 1000);
                        content.textContent = `Updating membership for ${memberName} (${seconds}s to undo)`;
                    }
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        });

        // If cancelled, don't proceed with the update
        if (result.dismiss === Swal.DismissReason.cancel) {
            return;
        }

        // Proceed with the update
        const response = await fetch(`${API_BASE_URL}/monthly-members/${memberId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });

        if (!response.ok) throw new Error('Failed to renew membership');

        await loadMembers();

        // Show success message with undo option
        const undoResult = await Swal.fire({
            icon: 'success',
            title: 'Membership Renewed!',
            html: `${memberName}'s membership has been renewed successfully`,
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Undo',
            timer: 5000,
            timerProgressBar: true
        });

        // If undo is clicked, revert the changes
        if (undoResult.dismiss === Swal.DismissReason.cancel) {
            const undoResponse = await fetch(`${API_BASE_URL}/monthly-members/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member_name: memberName,
                    type: memberType,
                    ...originalData
                })
            });

            if (!undoResponse.ok) throw new Error('Failed to undo renewal');

            await loadMembers();
            
            // Show undo success message
            await Swal.fire({
                icon: 'info',
                title: 'Changes Undone',
                text: 'Membership renewal has been reversed',
                timer: 3000,
                showConfirmButton: false
            });
        }

    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            timer: 3000,
            showConfirmButton: false
        });
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

// Verify Member
async function verifyMember(btn) {
    const row = btn.closest('tr');
    const memberId = row.dataset.id;
    const memberName = row.cells[0].innerText;

    const result = await Swal.fire({
        title: 'Verify Member',
        text: `Are you sure you want to verify ${memberName}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, verify',
        cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/monthly-members/${memberId}/verify`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Failed to verify member');

            await loadMembers();
            notificationSystem.notify('Member Verified', {
                body: `Successfully verified ${memberName}`,
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

// View Picture
async function viewPicture(btn) {
    const row = btn.closest('tr');
    const memberId = row.dataset.id;
    const memberType = row.cells[1].innerText.trim();

    if (memberType === 'regular') {
        Swal.fire({
            icon: 'info',
            title: 'No ID Required',
            text: 'Regular members do not need to add an ID.',
            confirmButtonText: 'OK'
        });
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/monthly-members/${memberId}/picture`);
        if (!response.ok) {
            throw new Error('Failed to retrieve picture');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        Swal.fire({
            title: 'Student ID Picture',
            imageUrl: imageUrl,
            imageAlt: 'Student ID Picture',
            showConfirmButton: true,
            confirmButtonText: 'Close'
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            timer: 3000,
            showConfirmButton: false
        });
    }
}