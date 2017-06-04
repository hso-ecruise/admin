'use strict';

application.controller('Ctrl_Stations', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog, $q) {

	var stations_all = {};
	
	var markers = [];
	
	var marker_Address = undefined;
	
	var heatmap_shown = false;
	var heatmap;
	
	
	var map = new google.maps.Map(document.getElementById('map_stations'), {
        zoom: 16,
        center: new google.maps.LatLng(49.5, 8.434),
        mapTypeId: 'roadmap'
    });
	
	var icons = {
        station_available:{
            icon: "images/icons/station_available.png"
        },
        station_occupied:{
            icon: "images/icons/station_occupied.png"
        }
    };
	
	function AddMarker(id, title, content, image_string, lat, lon){

        var img = {
            url: 'images/icons/station_available.png',
            scaledSize: new google.maps.Size(60, 87),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(30, 87)
        };

        img.url = icons[image_string].icon;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            icon: img,
			optimized: false,
			id: id
        });

        marker.addListener('click', function(event){
            var new_alert = $mdDialog.alert({
                title: title,
                textContent: content,
				clickOutsideToClose: true,
                ok: 'OK'
            });

            $mdDialog
                .show( new_alert )
                .finally(function() {
                new_alert = undefined;
            });
        });
		
		markers.push(marker);
		
    }
	
	function Delete_Markers(){
		
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		
		markers = [];
		
	}
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		stations_all = {};
		
		$scope.station_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		new Delete_Markers();
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Charging_Stations_Get_Charging_StationID(value);
		}else{
			prom = RESTFactory.Charging_Stations_Get();
		}
		
		prom.then(function(response){
			
			console.log(response);
			
			var data = [];
			
			if(type === "ID"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			data.forEach(function(data_use, index){
				
				var station = {};
				
				var ID_STR = data_use.chargingStationId;
				
				station.stationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupied;
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				
				stations_all[ID_STR] = station;
				$scope.stations = stations_all;
				$scope.$apply();
				
				var diff = station.slots - station.slotsOccupied;
				var title = "Ladestation " + ID_STR;
				var content =  diff + " von " + station.slots + " Slots frei";
				
				if(diff === 0){
					new AddMarker(ID_STR, title, content, "station_occupied", station.lat, station.lon);
				}else{
					new AddMarker(ID_STR, title, content, "station_available", station.lat, station.lon);
				}
				
				
				//GET CUSTOMER
				Helper.Get_Address(station.lat, station.lon).then(function(address){
					
					station.address = address;
				
					stations_all[ID_STR] = station;
					$scope.stations = stations_all;
					$scope.$apply();
				
				}, function(response){
					
					station.address = {};
					
					station.address.street = "Error";
					
				});
				
			});
			
		}, function(response){
			
			$scope.stations = stations_all;
			$scope.$apply();
		
		});
		
	}
	
	function Load_Details(id){
		
		new DisabledEditMode();
		
		RESTFactory.Charging_Stations_Get_Charging_StationID(id).then(function(response){
			
			$scope.station_selected = "true";
			
			var data_use = response.data;
			
			var station = {};
			
			station.stationID = data_use.chargingStationId;
			station.slots = data_use.slots;
			station.slotsOccupied = data_use.slotsOccupied;
			station.lat = data_use.latitude;
			station.lon = data_use.longitude;
			
			$scope.currentStation = station;
			$scope.$apply();
			
			map.panTo(new google.maps.LatLng(station.lat, station.lon));
			
			//GET CUSTOMER
			Helper.Get_Address(station.lat, station.lon).then(function(address){
				
				station.address = address;
				
				$scope.currentStation = station;
				$scope.$apply();
				
			}, function(response){
				
			});
			
		}, function(response){
			
			$scope.station_selected = "false";
			$scope.$apply();			
			
		});
		
	}
	
	
	
	function EnableEditMode(){
		$scope.editDisabled = false;
	}
	
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	/*
	var Safe_Changes = function(){
		
		var station = $scope.currentStation;
		
		var stationID = station.stationID;
		
		//REST CALL TO MAKE CHANGES
		
	};
	
	var Dismiss_Changes = function(){
		Load_Details($scope.currentStation.stationID);
	};
	*/
	
	
	function Safe_New(){
		
		if($scope.new_station.hasPosition === false){
			alert("Bitte Position auf Karte markieren");
			return;
		}
		
		var station = {};
		
		station.slots = $scope.new_station.slots;
		station.slotsOccupied = $scope.new_station.slotsOccupied;
		station.latitude = $scope.new_station.lat;
		station.longitude = $scope.new_station.lon;
		
		RESTFactory.Charging_Stations_Post(station).then(function(response){
			alert("Ladestation erfolgreich hinzugefügt");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		}, function(response){
			alert("Ladestation konnte nicht hinzugefügt werden");
			new Hide_AddStation();
			setTimeout(Update, 1000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddStation();
		
	}
	
	
	
	function Show_AddStation(){
		
		$scope.view = "add";
		
		var new_station = {};
		
		new_station.slots = 0;
		new_station.slotsOccupied = 0;
		new_station.lat = 0;
		new_station.lon = 0;
		new_station.address_state = "false";
		new_station.hasPosition = false;

		
		$scope.new_station = new_station;
		
		function Init_Map(){
			
			var input = document.getElementById('search_input');
			var searchBox = new google.maps.places.SearchBox(input);
			
			var map2 = new google.maps.Map(document.getElementById('map_station_new'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
				mapTypeId: 'roadmap'
			});
			
			map2.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
			
			map2.addListener('bounds_changed', function() {
				searchBox.setBounds(map2.getBounds());
			});
			
			searchBox.addListener('places_changed', function() {
				
				var places = searchBox.getPlaces();

				if (places.length === 0) {
					return;
				}
				
				var place = places[0].geometry.location;
			
				var lat = place.lat();
				var lon = place.lng();
				
				new PositionSelected(map2, lat, lon);
				
			});
				
			
			map2.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				new PositionSelected(map2, lat, lon);
			});
			
		}
		
		setTimeout(Init_Map, 2000);
		
	}
	
		function PositionSelected(map2, lat, lon){
		
		map2.panTo(new google.maps.LatLng(lat, lon));
		
		$scope.new_station.lat = lat;
		$scope.new_station.lon = lon;
		$scope.new_station.hasPosition = true;
		
		Helper.Get_Address(lat, lon).then(function(address){
			$scope.new_station.address_state = "true";
			$scope.new_station.address = address;
			$scope.$apply();
			
			if(marker_Address !== undefined){
				marker_Address.setMap(null);
			}
			
			marker_Address = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lon),
				map: map2,
				title: "Aktuelle Position"
			});
			
		}, function(response){
			$scope.new_station.address_state = "false";
		});

	}
	
	function Hide_AddStation(){
		$scope.new_station = {};
		$scope.view = "info";
		$scope.station_selected = "false";
		$scope.$apply();
	}
	
	function Show_Heatmap(){
		
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		
		heatmap_shown = true;
		
		var heatmap_data = [];
		var promises = [];
		var stations = {};
		
		RESTFactory.Charging_Stations_Get().then(function(response){
			
			var data = response.data;
			
			data.forEach(function(data_use, index){
				
				var station = {};
				
				var ID_STR = data_use.chargingStationId;
				
				station.stationID = data_use.chargingStationId;
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				
				stations[ID_STR] = station;
				
				promises.push(RESTFactory.Car_Charging_Stations_Get_ChargingStationID(ID_STR));

			});
			
			$q.all(promises).then(function(response){
				
				var data = response;
				
				data.forEach(function(item, index){
					
					var data2 = item.data;

					if(data2.length > 0){
					
						var lat = stations[data2[0].chargingStationId].lat;
						var lon = stations[data2[0].chargingStationId].lon;
						var heat = {};
						
						heat.location = new google.maps.LatLng(lat, lon);
						heat.weight = data2.length;
						
						heatmap_data.push(heat);
					}
				});
				
				heatmap = new google.maps.visualization.HeatmapLayer({
					data: heatmap_data
				});
				
				heatmap.setMap(map);
				
				var gradient = [
					'rgba(0, 0, 255, 0)',
					'rgba(0, 0, 255, 1)',
					'rgba(0, 255, 0, 1)',
					'rgba(255, 0, 0, 1)'
				]
				
				heatmap.set('gradient', gradient);
				
				heatmap.set('radius', 100);
				
			});
			
		}, function(response){
			
		});
		
		
	}
	
	function Hide_Heatmap(){
		
		heatmap_shown = false;
		heatmap.setMap(null);
		
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(map);
		}
		
	}
	
	
	
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	/*
	$scope.Safe_Changes = function(){
		Safe_Changes();
	};
	
	$scope.Dismiss_Changes = function(){
		Dismiss_Changes();
	};
	*/
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	$scope.Show_AddStation = function(){
		new Show_AddStation();
	};
	
	$scope.Hide_AddStation = function(){
		new Hide_AddStation();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	$scope.ToggleHeatmap = function(){
		if(heatmap_shown === true){
			new Hide_Heatmap();
		}else{
			new Show_Heatmap();
		}
		
	}
	
	function Init(){
		
		var input = document.getElementById('toggle_heatmap');
		
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});
