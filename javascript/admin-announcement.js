// localStorage
const STORAGE_KEY = 'gym_announcements';

// Mga icons para ma identify yung types
const ICON_MAPPINGS = {
    'fa-bolt': {
        path: 'M13 10V3L4 14h7v7l9-11h-7z',
        bg: 'bg-orange-600'
    },
    'fa-dumbbell': {
        path: 'M6.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm8 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-8 8a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm8 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM12 2v20M3 12h18',
        bg: 'bg-orange-600'
    },
    'fa-calendar': {
        path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        bg: 'bg-orange-600'
    },
    'fa-tag': {
        path: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
        bg: 'bg-orange-600'
    },
    'fa-clock': {
        path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-orange-600'
    }
};

function initializeAnnouncements() {
    const storedAnnouncements = localStorage.getItem(STORAGE_KEY);
    return storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
}

function saveAnnouncements(announcements) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements));
}

// Add 
function addAnnouncement(title, description, icon) {
    const announcements = initializeAnnouncements();
    const newAnnouncement = {
        id: Date.now(),
        title,
        description,
        icon,
        date: new Date().toISOString()
    };
    announcements.push(newAnnouncement);
    saveAnnouncements(announcements);
    updateAnnouncementsDisplay();
    updateLandingPageAnnouncements();
}

// display
function updateAnnouncementsDisplay() {
    const announcements = initializeAnnouncements();
    const container = document.getElementById('announcementsContainer');
    if (!container) return;

    container.innerHTML = announcements.map(announcement => `
        <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 ${ICON_MAPPINGS[announcement.icon].bg} rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ICON_MAPPINGS[announcement.icon].path}" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">${announcement.title}</h3>
                    <p class="text-sm text-slate-500">${new Date(announcement.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p class="text-slate-600">${announcement.description}</p>
            <div class="mt-4 flex justify-end gap-2">
                <button onclick="editAnnouncement(${announcement.id})" class="text-slate-600 hover:text-orange-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="deleteAnnouncement(${announcement.id})" class="text-slate-600 hover:text-red-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Update ang landing page 
function updateLandingPageAnnouncements() {
    const announcements = initializeAnnouncements();
    const container = document.querySelector('.grid.md\\:grid-cols-3');
    if (!container) return;

    // pakita yung 3 latest annoucments
    const recentAnnouncements = announcements.slice(-3).reverse();
    
    container.innerHTML = recentAnnouncements.map(announcement => `
        <div class="bg-orange-50 rounded-lg p-6 shadow-lg transform hover:-translate-y-1 transition duration-300">
            <div class="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ICON_MAPPINGS[announcement.icon].path}" />
                </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2 text-gray-800">${announcement.title}</h3>
            <p class="text-gray-600">${announcement.description}</p>
        </div>
    `).join('');
}

// Delete 
function deleteAnnouncement(id) {
    const announcements = initializeAnnouncements();
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    saveAnnouncements(updatedAnnouncements);
    updateAnnouncementsDisplay();
    updateLandingPageAnnouncements();
}

// Edit 
function editAnnouncement(id) {
    const announcements = initializeAnnouncements();
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;

    document.getElementById('announcementId').value = announcement.id;
    document.getElementById('title').value = announcement.title;
    document.getElementById('description').value = announcement.description;
    document.getElementById('icon').value = announcement.icon;
    
    document.getElementById('modalTitle').textContent = 'Edit Announcement';
    
    document.getElementById('announcementModal').classList.remove('hidden');
}

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize displays
    updateAnnouncementsDisplay();
    updateLandingPageAnnouncements();

    // Form submission handler
    const form = document.getElementById('announcementForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('announcementId').value;
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const icon = document.getElementById('icon').value;

            if (id) {
                const announcements = initializeAnnouncements();
                const index = announcements.findIndex(a => a.id === parseInt(id));
                if (index !== -1) {
                    announcements[index] = {
                        ...announcements[index],
                        title,
                        description,
                        icon,
                    };
                    saveAnnouncements(announcements);
                }
            } else {
                addAnnouncement(title, description, icon);
            }

            // Reset form and close modal
            form.reset();
            document.getElementById('announcementId').value = '';
            document.getElementById('announcementModal').classList.add('hidden');
            document.getElementById('modalTitle').textContent = 'New Announcement';
        });
    }

    // open button
    const addBtn = document.getElementById('addAnnouncementBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('announcementModal').classList.remove('hidden');
        });
    }

    // close button
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('announcementForm').reset();
            document.getElementById('announcementId').value = '';
            document.getElementById('announcementModal').classList.add('hidden');
            document.getElementById('modalTitle').textContent = 'New Announcement';
        });
    }

    // Search input
    const searchInput = document.getElementById('searchAnnouncement');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchAnnouncements(query);
        });
    }
});

// Search 
function searchAnnouncements(query) {
    const announcements = initializeAnnouncements();
    const filteredAnnouncements = announcements.filter(announcement => 
        announcement.title.toLowerCase().includes(query) || 
        announcement.description.toLowerCase().includes(query)
    );
    updateAnnouncementsDisplay(filteredAnnouncements);
}

// filtered
function updateAnnouncementsDisplay(announcements = null) {
    const allAnnouncements = initializeAnnouncements();
    const displayAnnouncements = announcements || allAnnouncements;
    const container = document.getElementById('announcementsContainer');
    if (!container) return;

    container.innerHTML = displayAnnouncements.map(announcement => `
        <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 ${ICON_MAPPINGS[announcement.icon].bg} rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${ICON_MAPPINGS[announcement.icon].path}" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-slate-800">${announcement.title}</h3>
                    <p class="text-sm text-slate-500">${new Date(announcement.date).toLocaleDateString()}</p>
                </div>
            </div>
            <p class="text-slate-600">${announcement.description}</p>
            <div class="mt-4 flex justify-end gap-2">
                <button onclick="editAnnouncement(${announcement.id})" class="text-slate-600 hover:text-orange-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="deleteAnnouncement(${announcement.id})" class="text-slate-600 hover:text-red-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}