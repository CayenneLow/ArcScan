mapboxgl.accessToken = 'pk.eyJ1IjoiY2F5ZW5uZWxvdyIsImEiOiJjanUyY2l0MHUwYjFnNDRyMW1rbDMxNXJyIn0.fo6Wm8R2hEZk-PVW_fT14w';
var coordinates = document.getElementsByName("location");
console.log(coordinates);

// current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(currentLocFunc);
}

function currentLocFunc(place) {
    currentLong = place.coords.longitude;
    currentLat = place.coords.latitude;
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [currentLong, currentLat],
        zoom: 16
    });

    var marker = new mapboxgl.Marker({
        draggable: true
    })
        .setLngLat([currentLong, currentLat])
        .addTo(map);

    function onDragEnd() {
        var lngLat = marker.getLngLat();
        coordinates.style.display = 'block';
        coordinates.innerHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
    }

    marker.on('dragend', onDragEnd);
}
