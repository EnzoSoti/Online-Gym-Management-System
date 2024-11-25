

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
async function renderMembers(members) {
    const memberTableBody = document.getElementById('memberTableBody');
    
    if (!memberTableBody) {
        console.error('Table body element not found');
        return;
    }

    // Store current scroll position
    const scrollPos = memberTableBody.parentElement.scrollTop;

    memberTableBody.innerHTML = ''; 
    
    for (const member of members) {
        // Calculate days left before status check
        const endDate = new Date(member.end_date);
        const today = new Date();
        const timeDiff = endDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Check and update expired status before rendering
        if (daysLeft < 0 && member.status === 'Active') {
            try {
                const response = await fetch(`${API_BASE_URL}/monthly-members/${member.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        member_name: member.member_name,
                        status: 'Inactive',
                        type: member.type,
                        start_date: member.start_date,
                        end_date: member.end_date
                    })
                });

                if (response.ok) {
                    member.status = 'Inactive';
                    // Show notification about the status change
                    notificationSystem.notify('Status Updated', {
                        body: `${member.member_name}'s membership has expired and status has been set to inactive`,
                        icon: 'warning'
                    });
                } else {
                    throw new Error('Failed to update member status');
                }
            } catch (error) {
                console.error('Error updating member status:', error);
                // Continue with rendering even if update fails
            }
        }

        const row = memberTableBody.insertRow();
        row.dataset.id = member.id;

        // Fetch the profile picture
        let profilePictureUrl = '';
        try {
            const response = await fetch(`${API_BASE_URL}/monthly-members/${member.id}/profile-picture`);
            if (response.ok) {
                const blob = await response.blob();
                profilePictureUrl = URL.createObjectURL(blob);
            } else {
                console.error('Failed to fetch profile picture for member:', member.id);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full profile-picture" src="${profilePictureUrl || '/path/to/default-profile.png'}" alt="Profile Picture">
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${member.member_name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${member.type}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    member.status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                }">${member.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.start_date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(member.end_date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${daysLeft < 0 ? 'text-red-500 font-semibold' : 'text-gray-500'}">${daysLeft}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-start gap-2">
                    <button class="w-8 h-8 flex items-center justify-center border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 rounded-lg" onclick="updateMember(this)" title="Update">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
        
                    <button class="w-8 h-8 flex items-center justify-center border-2 border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 rounded-lg" onclick="deleteMember(this)" title="Delete">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
        
                    <button class="w-8 h-8 flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 rounded-lg" onclick="renewMembership(this)" title="Renew">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
        
                    <button class="w-8 h-8 flex items-center justify-center border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 rounded-lg ${member.type === 'regular' ? 'hidden' : ''}" onclick="verifyMember(this)" title="Verify">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
        
                    <button class="w-8 h-8 flex items-center justify-center border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 rounded-lg ${member.type === 'regular' ? 'hidden' : ''}" onclick="viewPicture(this)" title="View ID Picture">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        `;

        // Add click event listener to the profile picture
        const profilePicture = row.querySelector('.profile-picture');
        if (profilePicture) {
            profilePicture.addEventListener('click', () => {
                showEnlargedPicture(profilePictureUrl);
            });
        }
    }

    // Restore scroll position
    memberTableBody.parentElement.scrollTop = scrollPos;
}

function showEnlargedPicture(imageUrl) {
    const modal = document.getElementById('enlargedPictureModal');
    const enlargedPicture = document.getElementById('enlargedPicture');
    enlargedPicture.src = imageUrl;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10); // Small delay to ensure the transition starts after the modal is displayed
}

document.getElementById('closeEnlargedPicture').addEventListener('click', () => {
    const modal = document.getElementById('enlargedPictureModal');
    modal.classList.remove('visible');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300); // Wait for the transition to complete before hiding the modal
});

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

// Handle member type change
function handleMemberTypeChange() {
    const memberType = document.getElementById('memberType');
    const schoolIdContainer = document.getElementById('schoolIdContainer');
    const schoolIdInput = document.getElementById('school_id_picture');
    
    if (memberType.value === 'Student') {
        schoolIdContainer.classList.remove('hidden');
        schoolIdInput.required = true;
    } else {
        schoolIdContainer.classList.add('hidden');
        schoolIdInput.required = false;
        // Clear school ID input and preview when switching to Regular
        schoolIdInput.value = '';
        const schoolIdPreview = document.getElementById('school_id_preview');
        schoolIdPreview.classList.add('hidden');
        schoolIdPreview.querySelector('img').src = '';
    }
}

// Image preview handlers with proper URL cleanup
function setupImagePreviews() {
    const schoolIdInput = document.getElementById('school_id_picture');
    const profileInput = document.getElementById('profile_picture');
    const schoolIdPreview = document.getElementById('school_id_preview').querySelector('img');
    const profilePreview = document.getElementById('profile_preview').querySelector('img');

    function handlePreview(file, previewElement, previewContainer) {
        // Revoke previous object URL if it exists
        if (previewElement.src) {
            URL.revokeObjectURL(previewElement.src);
        }

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            previewElement.src = objectUrl;
            previewContainer.classList.remove('hidden');
        } else {
            previewElement.src = '';
            previewContainer.classList.add('hidden');
        }
    }

    schoolIdInput?.addEventListener('change', (e) => {
        handlePreview(e.target.files[0], schoolIdPreview, schoolIdPreview.parentElement);
    });

    profileInput?.addEventListener('change', (e) => {
        handlePreview(e.target.files[0], profilePreview, profilePreview.parentElement);
    });
}

// Clear modal function
function clearModal() {
    const form = document.getElementById('memberForm');
    const schoolIdPreview = document.getElementById('school_id_preview');
    const profilePreview = document.getElementById('profile_preview');
    
    // Reset form
    form.reset();
    
    // Clear previews and revoke object URLs
    const previews = [schoolIdPreview, profilePreview];
    previews.forEach(preview => {
        const img = preview.querySelector('img');
        if (img.src) {
            URL.revokeObjectURL(img.src);
            img.src = '';
        }
        preview.classList.add('hidden');
    });

    // Reset member type related fields
    handleMemberTypeChange();
}

// Modified close modal function
function closeMemberModal() {
    const modal = document.getElementById('addMemberModal');
    modal.classList.add('hidden');
    clearModal();
}

// Add or Update Member
if (memberForm) {
    setupImagePreviews();
    
    memberForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            const memberName = document.getElementById('memberName');
            const memberStatus = document.getElementById('memberStatus');
            const memberType = document.getElementById('memberType');
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            const schoolIdPicture = document.getElementById('school_id_picture');
            const profilePicture = document.getElementById('profile_picture');

            // Validate required fields based on member type
            const isStudent = memberType.value === 'Student';
            if (!memberName.value || !memberStatus.value || !memberType.value || 
                !startDate.value || !endDate.value || !profilePicture.files[0] || 
                (isStudent && !schoolIdPicture.files[0])) {
                throw new Error('Please fill in all required fields');
            }

            const formData = new FormData();
            formData.append('member_name', memberName.value.trim());
            formData.append('status', memberStatus.value);
            formData.append('type', memberType.value);
            formData.append('start_date', startDate.value);
            formData.append('end_date', endDate.value);
            formData.append('profile_picture', profilePicture.files[0]);
            
            if (isStudent && schoolIdPicture.files[0]) {
                formData.append('school_id_picture', schoolIdPicture.files[0]);
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
            closeMemberModal(); // This will also clear the form
            
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
        // Get cells with correct indices based on your table structure
        const cells = selectedRow.cells;
        memberName.value = cells[1].textContent.trim(); // Member name is in second column
        memberType.value = cells[2].textContent.trim(); // Type is in third column
        
        // Convert date strings to proper format
        const startDateStr = cells[4].textContent.trim(); // Start date is in fifth column
        const endDateStr = cells[5].textContent.trim();   // End date is in sixth column
        
        // Parse and format dates correctly
        const formatDate = (dateStr) => {
            const [month, day, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        };
        
        startDate.value = formatDate(startDateStr);
        endDate.value = formatDate(endDateStr);
        
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
    const cells = row.cells;
    
    // Get values from correct cell indices
    const memberName = cells[1].textContent.trim();  // Member name is in second column
    const memberType = cells[2].textContent.trim();  // Type is in third column
    const statusSpan = cells[3].querySelector('span');  // Status is in fourth column
    
    const originalData = {
        status: statusSpan ? statusSpan.textContent.trim() : 'Unknown',
        start_date: cells[4].textContent.trim(),  // Start date is in fifth column
        end_date: cells[5].textContent.trim()     // End date is sixth column
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

        // First confirmation
        const initialConfirm = await Swal.fire({
            title: 'Renew Membership',
            html: `Do you want to renew membership for ${memberName}?`,
            showCancelButton: true,
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false
        });

        // If cancelled, don't proceed
        if (initialConfirm.dismiss === Swal.DismissReason.cancel) {
            return;
        }

        // Second confirmation
        const finalConfirm = await Swal.fire({
            title: 'Are you sure?',
            html: `This will renew ${memberName}'s membership and cannot be undone`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false
        });

        // If cancelled at second confirmation, don't proceed
        if (finalConfirm.dismiss === Swal.DismissReason.cancel) {
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

        // Show success message
        await Swal.fire({
            icon: 'success',
            title: 'Membership Renewed!',
            html: `${memberName}'s membership has been renewed successfully`,
            timer: 3000,
            showConfirmButton: false
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