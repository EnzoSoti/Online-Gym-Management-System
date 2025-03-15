document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown triggers
    const dropdownTriggers = document.querySelectorAll('.nav-item:has(.fa-chevron-down)');
    
    // Add click event to each dropdown trigger
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const subMenu = this.nextElementSibling;
            
            // Toggle submenu visibility
            if(subMenu.classList.contains('hidden')) {
                subMenu.classList.remove('hidden');
                this.querySelector('.fa-chevron-down').classList.add('rotate-180');
            } else {
                subMenu.classList.add('hidden');
                this.querySelector('.fa-chevron-down').classList.remove('rotate-180');
            }
        });
    });
});