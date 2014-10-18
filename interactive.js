var map = L.map( "map" );

L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
	attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	subdomains: '1234'
}).addTo(map);

var violationsLayer,
	clusterLayer;

$.getJSON( "restaurants.geojson", function(data){
	violationsLayer = L.geoJson( data,
		{
			onEachFeature: function(feature,layer){
				var name = feature.properties.name;
				var inspections = feature.properties.inspections;
				var str = "<p><strong>" + name + "</strong></p>" +
					"<p>Inspections:</p>";
				for ( var i in inspections ){
					if ( inspections[i].violations.length )
						str += "<p>" + inspections[i].date + "<br/>Violation codes: " + inspections[i].violations.toString() + "</p>";
					else
						str += "<p>" + inspections[i].date + "<br/>No violations!</p>";
				}
				layer.bindPopup( str );
			}
		}
	);
	clusterLayer = new L.MarkerClusterGroup().addLayer( violationsLayer );
	map.addLayer(clusterLayer)
	map.fitBounds( violationsLayer.getBounds() );

	createFilters();
});

var rodentIcon = L.icon( {iconUrl: 'rodentInsectInfestation.png'} );
var spoiledIcon = L.icon( {iconUrl: 'spoiledFood.png'} );
var temperatureIcon = L.icon( {iconUrl: 'incorrectTemperature.png'} );

function createFilters(){
	$("#filters").append( $("<div>Show all</div>")
			.css("display","inline-block")
			.css("margin","10px")
			.css("cursor","pointer")
			.click(function(){
				clusterLayer.clearLayers();
				clusterLayer.addLayer(violationsLayer);
			})
		);

	$("#filters")
		.append( "<div class='filter' id='filter1' title='Incorrect food temperature'></div>")
		.append( "<div class='filter' id='filter2' title='Rodent/insect infestation'></div>")
		.append( "<div class='filter' id='filter3' title='Spoiled food'></div>");

	$(".filter").click( function(){
		var id = $(this).attr("id");
		if ( id == "filter1" ) filterViolations( [3,4,5,6], temperatureIcon );
		if ( id == "filter2" ) filterViolations( [28], rodentIcon );
		if ( id == "filter3" ) filterViolations( [1], spoiledIcon );
	});
}

function filterViolations( codes, icon ){
	clusterLayer.clearLayers();
	violationsLayer.eachLayer(function(layer){
		var hasViolation = false;
		var inspections = layer.feature.properties.inspections;
		_.each( inspections, function(i){
			for ( var c in codes ){
				if ( i.violations.indexOf( codes[c] ) != -1 ){
					hasViolation = true;
				}
			}
		});
		if ( hasViolation ){
			var name = layer.feature.properties.name;
			var inspections = layer.feature.properties.inspections;
			var str = "<p><strong>" + name + "</strong></p>" +
				"<p>Inspections:</p>";
			for ( var i in inspections ){
				if ( inspections[i].violations.length )
					str += "<p>" + inspections[i].date + "<br/>Violation codes: " + inspections[i].violations.toString() + "</p>";
				else
					str += "<p>" + inspections[i].date + "<br/>No violations!</p>";
			}
			clusterLayer.addLayer(
				L.marker( layer.getLatLng(), {
					icon: icon
				}).bindPopup( str )
			)
		}
	});
}