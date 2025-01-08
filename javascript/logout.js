document.getElementById('navLogout').addEventListener('click', function(e) {
    e.preventDefault();
    
    Swal.fire({
        title: 'Logout Confirmation',
        text: "Are you sure you want to logout?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show success message before redirecting
            Swal.fire({
                title: 'Logging out!',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Redirect to landing page
                window.location.href = '../landing_images/landing.html';
            });
        }
    });
});