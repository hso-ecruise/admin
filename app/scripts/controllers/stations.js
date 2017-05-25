'use strict';

application.controller('Ctrl_Stations', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	var stations_all = {};
	
	
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
	
	var AddMarker = function(title, content, image_string, lat, lon){

        var img = {
            url: 'images/icons/car_available.png',
            scaledSize: new google.maps.Size(60, 87),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(30, 87)
        };

        img.url = icons[image_string].icon;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            icon: img
        });

        marker.addListener('click', function(event){
            alert = $mdDialog.alert({
                title: title,
                textContent: content,
                ok: 'OK'
            });

            $mdDialog
                .show( alert )
                .finally(function() {
                alert = undefined;
            });
        });

    }
	
	var Update = function(){
		
		$scope.station_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		RESTFactory.Charging_Stations_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var station = {};
				
				var ID_STR = data_use.chargingStationId;
				
				station.stationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupuied;	//slotsOccupied
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				
				stations_all[ID_STR] = station;
				$scope.stations = stations_all;
				$scope.$apply();
				
				var diff = station.slots - station.slotsOccupied;
				var title = "Ladestation";
				var content =  diff + " von " + station.slots + " Slots frei";
				
				if(diff === 0){
					AddMarker(title, content, "station_occupied", station.lat, station.lon);
				}else{
					AddMarker(title, content, "station_available", station.lat, station.lon);
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
				
			}
			
		}, function(response){
			
		});
		
	};
	
	var Load_Details = function(id){
		
		DisabledEditMode();
		
		RESTFactory.Charging_Stations_Get_Charging_StationID(id).then(function(response){
			
			$scope.station_selected = "true";
			
			console.log(response);
			
			var data_use = response.data;
			
			var station = {};
			
			station.chargingStationID = data_use.chargingStationId;
			station.slots = data_use.slots;
			station.slotsOccupied = data_use.slotsOccupied;
			station.lat = data_use.latitude;
			station.lon = data_use.longitude;
			
			$scope.currentStation = station;
			$scope.$apply();
			
			
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
		
	};
	
	
	
	var EnableEditMode = function(){
		$scope.editDisabled = false;
	};
	
	var DisabledEditMode = function(){
		$scope.editDisabled = true;
	};
	
	
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
	
	
	var Safe_New = function(){
		
		var station = {};
		
		station.slots = $scope.new_station.slots;
		station.slotsOccupied = $scope.new_station.slotsOccupied;
		station.latitude = $scope.new_station.lat;
		station.longitude = $scope.new_station.lon;
		
		console.log(station);
		
		RESTFactory.Charging_Stations_Post(station).then(function(response){
			alert("Ladestation erfolgreich hinzugefügt");
		}, function(response){
			alert("Ladestation konnte nicht hinzugefügt werden");
		});
		
	};
	
	var Dismiss_New = function(){
		
		Hide_AddStation();
		
	};
	
	
	
	var Show_AddStation = function(){
		
		$scope.view = "add";
		
		var new_station = {};
		
		new_station.slots = 0;
		new_station.slotsOccupied = 0;
		new_station.lat = 0;
		new_station.lon = 0;
		new_station.address_state = "false";

		$scope.new_station = new_station;
		
		var Init_Map = function(){
			
			var map2 = new google.maps.Map(document.getElementById('map_station_new'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
				mapTypeId: 'roadmap'
			});
			map2.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				$scope.new_station.lat = lat;
				$scope.new_station.lon = lon;
				
				Helper.Get_Address(lat, lon).then(function(address){
					$scope.new_station.address_state = "true";
					$scope.new_station.address = address;
				}, function(response){
					$scope.new_station.address_state = "false";
				});

			});
		};
		
		setTimeout(Init_Map, 2000);
		
	};
	
	var Hide_AddStation = function(){
		$scope.new_station = {};
		$scope.view = "info";
		$scope.station_selected = "false";
		$scope.$apply();
	};
	
	
	
	
	$scope.EnableEditMode = function(){
		EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		Load_Details(id);
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
		Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		Dismiss_New();
	};
	
	
	$scope.Show_AddStation = function(){
		Show_AddStation();
	};
	
	$scope.Hide_AddStation = function(){
		Hide_AddStation();
	};
	
	
	var Init = function(){
		
		Update();
		
	};

	Init();
	
});
