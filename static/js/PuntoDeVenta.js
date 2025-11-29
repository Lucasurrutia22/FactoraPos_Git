// Punto de Venta (map-only) Module
(function() {
    'use strict';

    let selectedStore = 1;
    let map = null;
    let markers = {};

    // Store locations with coordinates
    const storeLocations = [
        { id: 1, name: 'Local Centro', address: 'Calle Principal 123, Centro', phone: '+1 234 567 8900', hours: '09:00 - 21:00', lat: 40.7128, lng: -74.0060 },
        { id: 2, name: 'Local Norte', address: 'Avenida del Norte 456, Zona Norte', phone: '+1 234 567 8901', hours: '09:00 - 21:00', lat: 40.7614, lng: -73.9776 },
        { id: 3, name: 'Local Sur', address: 'Boulevard del Sur 789, Zona Sur', phone: '+1 234 567 8902', hours: '09:00 - 21:00', lat: 40.6895, lng: -74.0447 },
        { id: 4, name: 'Local Este', address: 'Avenida del Este 321, Zona Este', phone: '+1 234 567 8903', hours: '10:00 - 20:00', lat: 40.7505, lng: -73.9934 },
        // Nuevo local en Santiago, Chile (Plaza de Armas)
        { id: 5, name: 'Local Santiago - Plaza de Armas', address: 'Plaza de Armas, Santiago, Chile', phone: '+56 2 2345 6789', hours: '10:00 - 20:00', lat: -33.4378, lng: -70.6505 }
    ];

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeMap();
    });

    // Initialize Leaflet map (centered and restricted to Chile)
    function initializeMap() {
        // Chile approximate bounds (south, west) to (north, east)
        const chileBounds = L.latLngBounds([[-56.0, -76.0], [-17.0, -66.0]]);

        // Center map on Chile and restrict panning to country bounds
        map = L.map('map', {
            maxBounds: chileBounds,
            maxBoundsViscosity: 0.9,
            minZoom: 4,
            maxZoom: 16
        }).setView([-33.45, -70.6667], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        storeLocations.forEach(store => {
            const marker = L.circleMarker([store.lat, store.lng], {
                radius: 18,
                fillColor: '#3b82f6',
                color: '#2563eb',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);

            const popupContent = `
                <div class="popup-content">
                    <div class="popup-title">${store.name}</div>
                    <div class="popup-address">📍 ${store.address}</div>
                    <div class="popup-phone">☎️ ${store.phone}</div>
                    <div class="popup-phone">⏰ ${store.hours}</div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', function() { selectStore(store.id); });

            const label = L.divIcon({ html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:50%;color:white;font-weight:bold;">${store.id}</div>`, iconSize: [36,36], className: 'custom-icon' });
            L.marker([store.lat, store.lng], { icon: label }).addTo(map);

            markers[store.id] = marker;
        });

        highlightStoreOnMap(selectedStore);
    }

    // Select store (called from HTML onclick or marker click)
    window.selectStore = function(storeId) {
        selectedStore = storeId;

        // Update cards UI (find by .store-number)
        document.querySelectorAll('.store-card').forEach(card => {
            card.classList.remove('selected');
            const numEl = card.querySelector('.store-number');
            if (numEl && String(numEl.textContent).trim() === String(storeId)) {
                card.classList.add('selected');
            }
        });

        // Update selected store info if present
        const store = storeLocations.find(s => s.id === storeId);
        if (store) {
            const infoDiv = document.getElementById('selectedStoreInfo');
            if (infoDiv) {
                infoDiv.style.display = 'block';
                const nameEl = document.getElementById('selectedStoreName');
                const addrEl = document.getElementById('selectedStoreAddress');
                if (nameEl) nameEl.textContent = store.name;
                if (addrEl) addrEl.textContent = store.address;
            }
        }

        // Center map
        if (map && store) {
            map.setView([store.lat, store.lng], 13);
        }

        highlightStoreOnMap(storeId);
    };

    function highlightStoreOnMap(storeId) {
        Object.keys(markers).forEach(id => {
            const marker = markers[id];
            if (!marker) return;
            if (String(id) === String(storeId)) {
                marker.setStyle({ fillColor: '#10b981', color: '#059669', weight: 4, fillOpacity: 1 });
            } else {
                marker.setStyle({ fillColor: '#3b82f6', color: '#2563eb', weight: 3, fillOpacity: 0.9 });
            }
        });
    }
})();

// Global UI helpers (profile, modals)
window.toggleProfileMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('show');
};

document.addEventListener('click', function(e) {
    const profileWrapper = document.querySelector('.user-profile-wrapper');
    const dropdown = document.getElementById('userDropdown');
    if (profileWrapper && !profileWrapper.contains(e.target) && dropdown) dropdown.classList.remove('show');
});

function openUserProfile(event) { if (event) event.preventDefault(); const modal = document.getElementById('userProfileModal'); if (modal) modal.style.display = 'flex'; }
function openSettings(event) { if (event) event.preventDefault(); const modal = document.getElementById('settingsModal'); if (modal) modal.style.display = 'flex'; }
function closeModalById(id) { const modal = document.getElementById(id); if (modal) modal.style.display = 'none'; }
