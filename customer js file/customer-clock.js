document.addEventListener('DOMContentLoaded', () => {

    // ========== Clock Update Function ==========
    function updateClock() {
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';

            // Convert to 12-hour format and handle midnight as 12
            hours = hours % 12;
            hours = hours ? hours : 12;

            // Display the formatted time
            clockElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

            // Trigger notification at exactly 12:00:00 AM
            if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
                showNotification();
            }
        }
    }

    // ========== Notification Function ==========
    // This function shows a browser notification when triggered (e.g. at midnight)
    function showNotification() {
        if (Notification.permission === 'granted') {
            // Show notification immediately if permission is already granted
            new Notification('Fitworx Gym', {
                body: 'The website is now closed. Please visit again tomorrow.',
                icon: '../img/Fitworx logo.jpg'
            });
        } else if (Notification.permission !== 'denied') {
            // Request permission from the user to show notifications
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Fitworx Gym', {
                        body: 'The website is now closed. Please visit again tomorrow.',
                        icon: '../img/Fitworx logo.jpg'
                    });
                }
            });
        }
    }

    // ========== Clock Initialization ==========
    // Set up an interval to update the clock every second
    setInterval(updateClock, 1000);

    // Call once immediately on page load
    updateClock();

});
