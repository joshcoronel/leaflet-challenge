var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

function markerSize(mag) {
    return mag * 40000;
}

function markerColor(depth) {
    if (depth > 89) {
        return "orangered";
    } else if (depth > 69) {
        return "orange";
    } else if (depth > 49) {
        return "yellow";
    } else if (depth > 29) {
        return "greenyellow";
    } else if (depth > 9) {
        return "lightgreen";
    } else {
        return "green";
    };
}

d3.json(queryURL,function(data) {
    // Pass the data.feature object to the createFeatures function
    createFeatures(data.features)
    console.log(data)
})

function createFeatures(earthquakeData) {

    //  Run this funciton on each feature to add a popup describing the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + 
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
        "<p> Magnitude: " + feature.properties.mag + "</p>");
    }

    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function (feature,latlng) {
            return L.circle(latlng,
                {
                    radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    fillOpacity: 1,
                    stroke: false
                });
        },
        onEachFeature: onEachFeature
    })

    createMap(earthquakes);
}

function createMap(earthquakes) {
    var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "satellite-v9",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Outdoor": outdoor,
        "Satellite": satellite
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom:3,
        layers: [outdoor, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
            depth = [-10, 10, 30, 50, 70, 90];
        labels = ['<strong> Depth</strong>'];
        
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            labels.push(
                '<i style="background:' + markerColor(depth[i] + 1) + '">&nbsp&nbsp&nbsp</i> ' +
                    depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] : '+'));
        }
        div.innerHTML = labels.join('<br>')
        return div;
    };

    legend.addTo(myMap);
}