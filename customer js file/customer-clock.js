document.addEventListener('DOMContentLoaded', () => {
    function updateClock() {
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            // Convert hours to 12-hour format
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            
            clockElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

            // Check if the time is 12:00 AM
            if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
                showNotification();
            }
        }
    }

    function showNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Fitworx Gym', {
                body: 'The website is now closed. Please visit again tomorrow.',
                icon: '../img/Fitworx logo.jpg'
            });
        } else if (Notification.permission !== 'denied') {
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

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Initialize the clock immediately
    updateClock();
});