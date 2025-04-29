let map;
let markers = [];

function initMap() {
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
        zoom: 12
    });

    // Add campaign location marker if exists
    const mapElement = document.getElementById('map');
    if (mapElement.dataset.lat && mapElement.dataset.lng) {
        const position = {
            lat: parseFloat(mapElement.dataset.lat),
            lng: parseFloat(mapElement.dataset.lng)
        };

        addMarker(position, mapElement.dataset.title || 'Campaign Location');
        map.setCenter(position);
        map.setZoom(15);
    }

    // Add blood banks markers if on campaigns page
    if (window.bloodBanks) {
        window.bloodBanks.forEach(bank => {
            addMarker(
                { lat: bank.location.coordinates[1], lng: bank.location.coordinates[0] },
                bank.name,
                '/images/blood-bank-marker.png'
            );
        });
    }
}

function addMarker(position, title, icon = null) {
    const marker = new google.maps.Marker({
        position,
        map,
        title,
        icon
    });

    markers.push(marker);
    return marker;
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Load Google Maps API
function loadGoogleMaps() {
    if (!document.getElementById('map')) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Initialize when DOM is ready
if (document.readyState === 'complete') {
    loadGoogleMaps();
} else {
    document.addEventListener('DOMContentLoaded', loadGoogleMaps);
}