const map = L.map('map').setView([14.7669369, 121.0442142], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Location ng Fitworx 
const marker = L.marker([14.7669369, 121.0442142]).addTo(map);
marker.bindPopup("<b>Fitworx Gym</b><br>Capt. F. S. Samano, Caloocan, Metro Manila").openPopup();