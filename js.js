var geocoder;
var map;
var markers = Array();
var infos = Array();
var picture_references = [];
var restArr = [];

function initialize() {
    // prepare Geocoder
    geocoder = new google.maps.Geocoder();
    // set initial position (New York)
    var myLatlng = new google.maps.LatLng(40.7143528, -74.0059731);
    var myOptions = { // default map options
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
}
// clear overlays function
function clearOverlays() {
    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
        markers = [];
        infos = [];
    }
}
// clear infos function
function clearInfos() {
    if (infos) {
        for (i in infos) {
            if (infos[i].getMap()) {
                infos[i].close();
            }
        }
    }
}
function findbyDestination() {
    var address_typed = document.getElementById("dest");

}

// find address function
function findAddress() {
    var address = document.getElementById("gmap_where").value;
    $("#photos-div").empty();
    $("#photography-div").empty();

    //$(".countryFacts").empty();
    // script uses our 'geocoder' in order to find location by address name
    console.log("PLACE SEARCHED IS: " + address);
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok
            // we will center map
            var addrLocation = results[0].geometry.location;
            map.setCenter(addrLocation);
            // store current coordinates into hidden variables
            document.getElementById('lat').value = results[0].geometry.location.lat();
            document.getElementById('lng').value = results[0].geometry.location.lng();
            // and then - add new custom marker
            var addrMarker = new google.maps.Marker({
                position: addrLocation,
                map: map,
                title: results[0].formatted_address,
                //icon: 'marker.png'
            });
            var type = "restaurant";
            var radius = 500;
            //var radius = document.getElementById('gmap_radius').value;
            //var keyword = document.getElementById('gmap_keyword').value;
            var lat = document.getElementById('lat').value;
            var lng = document.getElementById('lng').value;
            var cur_location = new google.maps.LatLng(lat, lng);
            // prepare request to Places
            var request = {
                location: cur_location,
                radius: radius,
                types: [type]
            };
            //if (keyword) {
            //    request.keyword = [keyword];
            //}
            // send request
            service = new google.maps.places.PlacesService(map);
            service.search(request, createMarkers);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}
// find custom places function
function findPlaces() {
    //Empties the div for every search
    $("#photos-div").empty();
    $("#photography-div").empty();
    // prepare variables (filter)
    var type = document.getElementById('gmap_type').value;
    //var type = "art gallery";
    //var radius = 500;
    var radius = document.getElementById('gmap_radius').value;
    var keyword = document.getElementById('gmap_keyword').value;
    var lat = document.getElementById('lat').value;
    var lng = document.getElementById('lng').value;
    var cur_location = new google.maps.LatLng(lat, lng);
    // prepare request to Places
    var request = {
        location: cur_location,
        radius: radius,
        types: [type]
    };
    if (keyword) {
        request.keyword = [keyword];
    }
    // send request
    service = new google.maps.places.PlacesService(map);
    service.search(request, createMarkers);
}
// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        // if we have found something - clear map (overlays)
        clearOverlays();
        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            //console.log(result);
        }
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('Sorry, nothing is found');
    }
}
// creare single marker function
function createMarker(obj) {
    // prepare new Marker object
    var mark = new google.maps.Marker({
        position: obj.geometry.location,
        map: map,
        title: obj.name
    });
    markers.push(mark)
    // prepare info window
    var infowindow = new google.maps.InfoWindow({
        content: '<img src="' + obj.icon + '" /><font style="color:#000;">' + obj.name +
            '<br />Rating: ' + obj.rating + '<br />Address: ' + obj.vicinity + '</font>'
    });
    // add event handler to current marker
    google.maps.event.addListener(mark, 'click', function () {
        clearInfos();
        infowindow.open(map, mark);
    });
    infos.push(infowindow);
    console.log("Accesing Object: " + obj);

    var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=' + obj.place_id + '&key=AIzaSyAB6hBjI4Pq16M1kIXqSD7rW2hXcY9CE_k';

    var ref;
    var image_ref;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        console.log(response);

        console.log("Name " + response.result.name);
        console.log(response.result.photos[0].photo_reference);
        ref = response.result.photos[0].photo_reference;

        //THIS IS WHERE I USE THE GOOGLE PHOTO REFERENCE TO APPEND PHOTOS TO THE BOTTOM DIV 
        var queryURL2 = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=' + ref + '&key=AIzaSyAB6hBjI4Pq16M1kIXqSD7rW2hXcY9CE_k';
        console.log(queryURL2);
        var new_img = $("<img>");
        new_img.attr("src", queryURL2);
        new_img.addClass("googleImg")
        //$('#category').text(response.result.types[0]);
        new_img.width('33%');
        new_img.height('300px');
        $('#photos-div').append('<li>' + response.result.name + ': ' + response.result.vicinity + '</li>');
    
        $("#photography-div").append(new_img);
    });
};
// restcountries api


var input = document.getElementById('gmap_where');
var autocomplete = new google.maps.places.Autocomplete(input, { types: ['(cities)'] });
google.maps.event.addListener(autocomplete, 'place_changed', function () {
    var place = autocomplete.getPlace();
$(".countryFacts").empty();
    var country = place.adr_address;
    var html = "<div>" + country.split(",").join("") + "</div>";
    var countryName = ($(html).find(".country-name").text());
    var Name = "Country: " + ($(html).find(".country-name").text());
    console.log(Name);
    restArr.push(Name);

    var queryURL = "https://restcountries.eu/rest/v2/name/" + countryName + "?fullText=true";

    $.ajax({
        url: queryURL,
        method: "GET"
    })

        .then(function (response) {
            var currencies = response[0].currencies;
            var currenciesString = currencies.map(function (currency) {
                var currencyName = "Currency: " + currency['name'];
                console.log(currencyName);
                restArr.push(currencyName);
            });
            var capital = ("Capital: " + response[0].capital);
            console.log(capital);
            restArr.push(capital);

            var languages = response[0].languages;
            var languagesString = languages.map(function (language) {
                var langName = "Language: " + language['name'];
                console.log(langName);
                restArr.push(langName);

            });
            var population = "Population: " + response[0].population;
            console.log(population);
            restArr.push(population);


            var region = "Region: " + response[0].region;
            console.log(region);
            restArr.push(region);


            console.log(restArr);
            var ul = $("<ul>");

            restArr.forEach(function (item) {
                var li = $("<li>");
                ul.append(li);
                li.text(item);
                $(".countryFacts").append(li);
            });
            if (restArr.length >= 6) {
                restArr = [];
            };


        });
});

// initialization
google.maps.event.addDomListener(window, 'load', initialize);
