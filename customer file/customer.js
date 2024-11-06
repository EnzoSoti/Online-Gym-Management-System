let memberCount = 0;
const maxMembers = 8;

function addTeamMember() {
    if (memberCount >= maxMembers) {
        // Replace standard alert with SweetAlert
        Swal.fire({
            title: 'Maximum Players Reached!',
            text: 'You can only add up to 8 additional players.',
            icon: 'warning',
            confirmButtonText: 'Got it',
            showConfirmButton: true,
            timer: 3000,
            timerProgressBar: true,
            iconColor: '#ea580c',
            customClass: {
                confirmButton: 'swal2-confirm',
                popup: 'rounded-3xl'
            }
        });
        return;
    }

    const memberField = document.createElement('div');
    memberField.className = 'flex gap-2';
    memberField.innerHTML = `
        <input type="text" 
               placeholder="Enter player name" 
               class="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all bg-white">
        <button type="button" 
                onclick="removeTeamMember(this)" 
                class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            ✕
        </button>
    `;

    document.getElementById('team-members').appendChild(memberField);
    memberCount++;

    // Show success toast when member is added
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Player Added Successfully!',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        customClass: {
            popup: 'rounded-3xl'
        }
    });
}

function removeTeamMember(button) {
    button.parentElement.remove();
    memberCount--;
}

// Add click event listener to the "Add Player" button
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('button[type="button"]').addEventListener('click', addTeamMember);
});