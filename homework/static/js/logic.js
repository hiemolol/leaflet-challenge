// link to API
var API_KEY = "pk.eyJ1Ijoic2FtaWFtbm90IiwiYSI6ImNrNzEzdmZ5bjAydmMzZW1sc3JvaDY3ODgifQ.5tAcfa9yEQ2KSfi15SW76w";

// map layers
var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// create map objects with options
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoors]
});

// add 'graymap' tile layer to the map.
graymap.addTo(map);

// create the layers for earthquakes and tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// defining an object that contains all of our different map choices
var baseMaps = {
  Satellite: satellitemap,
  Grayscale: graymap,
  Outdoors: outdoors
};

// define an object that contains all of our overlays
var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// use to control map
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// retrieve earthquake geoJSON data
d3.json("static/all_week.geojson", function(data) {
    console.log(data);

    // determines the color of the marker based on the magnitude of the earthquake
    function getColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "orange";
        case magnitude > 4:
            return "pink";
        case magnitude > 3:
            return "blue";
        case magnitude > 2:
            return "red";
        case magnitude > 1:
            return "yellow";
        default:
            return "black";
        }
    }

    // determine radius of the earthquake marker based on its magnitude
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // add geojson layer and add circle feature
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: function(feature) {
            return {
                opacity: 1,
                fillOpacity: 3,
                fillColor: getColor(feature.properties.mag),
                color: "teal",
                radius: getRadius(feature.properties.mag),
                stroke: true,
                weight: 0.8
            }
        },
        // create a popup for each marker to display the magnitude and location of the earthquake 
        onEachFeature: function(feature, layer) {
        layer.bindPopup(`Magnitude: ${feature.properties.mag}<br> Location: ${feature.properties.place}`);
        }
    }).addTo(earthquakes);

    // add earthquake layer to map
    earthquakes.addTo(map);

    // create legend
    var legend = L.control({
        position: "bottomright"
    });

    // legned details and colors 
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
        "black",
        "yellow",
        "red",
        "blue",
        "pink",
        "orange"
        ];

        // loop through to determine color in relation to magnitude 
        for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // add legend to map
    legend.addTo(map);

    // tectonic Plate geoJSON data.
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
        L.geoJson(platedata, {
        color: "orange",
        weight: 2
        })
        .addTo(tectonicplates);

        // add tectonicplates layer to map
        tectonicplates.addTo(map);
    });

});