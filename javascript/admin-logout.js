const TOAST_DISPLAY_DURATION = 1500; 
const LOGOUT_DELAY = 1200; 

document.getElementById("navLogout").addEventListener("click", function (e) {
  e.preventDefault();

  Swal.fire({
    title: "Logout Confirmation",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      Toastify({
        text: "You have been successfully logged out.",
        duration: TOAST_DISPLAY_DURATION,
        gravity: "top", 
        position: "center",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        close: true,
      }).showToast();
      
      // Add a small delay to show the toast before logout processing
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            // Redirect to landing page
            sessionStorage.clear();
            window.location.href = "/index.html";
          } else {
            // Handle unsuccessful logout
            console.error("Logout failed:", await response.text());
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
      }, LOGOUT_DELAY);
    }
  });
});