document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidenav = document.querySelector('.sidenav');
    const mainContent = document.querySelector('.main-content');
    
    hamburgerBtn.addEventListener('click', function() {
        sidenav.classList.toggle('collapsed');
        if (mainContent) {
            mainContent.classList.toggle('collapsed');
        }
    });
});