// Add this to your sales_report.js file

document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and content
    const tabButtons = document.querySelectorAll('[role="tab"]');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        // Set aria-controls to link the button to its corresponding panel
        const targetId = button.getAttribute('data-tabs-target').substring(1);
        button.setAttribute('aria-controls', targetId);

        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-600');
                btn.classList.add('border-transparent');
                btn.setAttribute('aria-selected', 'false');
            });

            // Hide all tab panels
            tabPanels.forEach(panel => {
                panel.classList.add('hidden');
            });

            // Activate clicked tab
            button.classList.remove('border-transparent');
            button.classList.add('border-blue-600');
            button.setAttribute('aria-selected', 'true');

            // Show corresponding panel
            const targetPanel = document.getElementById(targetId);
            targetPanel.classList.remove('hidden');
        });
    });

    // Set initial active tab
    document.getElementById('monthly-tab').click();
});
