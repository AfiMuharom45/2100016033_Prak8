// Inisialisasi peta
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([0, 0]),
        zoom: 2
    })
});

// Memuat data gempa dari file CSV
fetch('katalog_gempa.csv')
    .then(response => response.text())
    .then(data => {
        // Parsing data CSV menjadi array objek
        var features = [];
        var rows = data.trim().split('\n');
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i].split(',');
            var lon = parseFloat(row[3]);
            var lat = parseFloat(row[2]);
            var depth = parseFloat(row[4]);
            var mag = parseFloat(row[5]);

            // Membuat fitur marker untuk setiap gempa
            var marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
                depth: depth,
                mag: mag
            });
            features.push(marker);
        }

        // Membuat source dan cluster
        var vectorSource = new ol.source.Vector({
            features: features
        });
        var clusterSource = new ol.source.Cluster({
            distance: 40, // Jarak untuk menggabungkan marker menjadi cluster
            source: vectorSource
        });

        // Membuat style untuk cluster
        var clusterStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 12,
                fill: new ol.style.Fill({
                    color: [255, 153, 0, 1]
                }),
                stroke: new ol.style.Stroke({
                    color: [255, 204, 0, 1],
                    width: 2
                })
            }),
            text: new ol.style.Text({
                text: '{features.length}',
                fill: new ol.style.Fill({
                    color: '#fff'
                })
            })
        });

        // Membuat layer cluster
        var clusterLayer = new ol.layer.Vector({
            source: clusterSource,
            style: clusterStyle
        });

        // Menambahkan layer cluster ke peta
        map.addLayer(clusterLayer);

        // Membuat fungsi pencarian
        var searchInput = document.getElementById('search-input');
        var searchButton = document.getElementById('search-button');

        searchButton.addEventListener('click', function() {
            var searchText = searchInput.value.trim();
            if (searchText !== '') {
                // Menghapus marker sebelumnya
                vectorSource.clear();

                // Melakukan pencarian
                var searchFeatures = features.filter(function(feature) {
                    var magString = feature.get('mag').toString();
                    return magString.indexOf(searchText) !== -1;
                });

                // Menambahkan hasil pencarian ke source
                vectorSource.addFeatures(searchFeatures);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
