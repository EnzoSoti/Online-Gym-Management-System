// Add event listener for admin login button
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginBtn = document.querySelector('a[href="#"]');
    adminLoginBtn.addEventListener('click', showAdminLogin);

    // Add the existing team member functionality
    let memberCount = 0;
    const maxMembers = 8;

    function addTeamMember() {
        if (memberCount >= maxMembers) {
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

    // Make these functions available globally
    window.addTeamMember = addTeamMember;
    window.removeTeamMember = removeTeamMember;

    // Add click event listener to the "Add Player" button
    document.querySelector('button[type="button"]').addEventListener('click', addTeamMember);
});

// Admin login functionality
function showAdminLogin(e) {
    e.preventDefault();
    
    Swal.fire({
        title: 'Admin Login',
        html: `
            <div class="space-y-4">
                <div class="relative">
                    <input type="text" id="admin-username" class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all bg-orange-50" placeholder="Username">
                </div>
                <div class="relative">
                    <input type="password" id="admin-password" class="w-full px-4 py-3 rounded-xl border border-orange-200 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all bg-orange-50" placeholder="Password">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'swal2-confirm',
            popup: 'rounded-3xl'
        },
        preConfirm: () => {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            
            if (!username || !password) {
                Swal.showValidationMessage('Please fill in all fields');
                return false;
            }
            
            // Check credentials
            if (username === 'admin' && password === 'admin') {
                return true;
            } else {
                Swal.showValidationMessage('Invalid username or password');
                return false;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Show success message before redirect
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: 'Redirecting to admin panel...',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'rounded-3xl'
                }
            }).then(() => {
                // Redirect to admin.html
                window.location.href = '../main/admin.html';
            });
        }
    });
}