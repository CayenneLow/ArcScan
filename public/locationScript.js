mapboxgl.accessToken = 'pk.eyJ1IjoiY2F5ZW5uZWxvdyIsImEiOiJjanUyY2l0MHUwYjFnNDRyMW1rbDMxNXJyIn0.fo6Wm8R2hEZk-PVW_fT14w';


// current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(currentLocFunc);
}


let unswLong = 151.230753;
let unswLat = -33.917687;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [unswLong, unswLat],
    // center defaults to UNSW
    zoom: 16
});
var marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([unswLong, unswLat])
    .addTo(map);

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
        // event listeners
        var longitude = document.getElementById('long');
        var latitude = document.getElementById('lat');
        longitude.value = lngLat.lng;
        latitude.value = lngLat.lat;
    }

    marker.on('dragend', onDragEnd);
}
