'use strict';

application.controller('Ctrl_Login_Register', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	var stations_all = {};
	
	
	var Update = function(){
		
		$scope.station_selected = "false";
		
		$scope.view = "info";
		
		RESTFactory.Charging_Stations_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var station = {};
				
				var ID_STR = data_use.chargingStationId;
				
				station.chargingStationID = data_use.chargingStationId;
				station.slots = data_use.slots;
				station.slotsOccupied = data_use.slotsOccupied;
				station.lat = data_use.latitude;
				station.lon = data_use.longitude;
				
				stations_all[ID_STR] = station;
				$scope.stations = stations_all;
				$scope.$apply();
				
				
				//GET CUSTOMER
				Helper.Get_Address(station.lat, station.lon).then(function(address){
					
					station.address = address;
				
					stations_all[ID_STR] = station;
					$scope.stations = stations_all;
					$scope.$apply();
				
				}, function(response){
					
				});
				
			}
			
			
		}, function(response){
			
		});
		
		
	};
	

	
	var Show_AddStation = function(){
		
		$scope.view = "add";

		var new_station = {};
		
		new_station.slots = 0;
		new_station.slotsOccupied = 0;
		new_station.lat = 0;
		new_station.lon = 0;
		
		new_booking.address_state = "false";
		
		$scope.new_station = new_station;
		
		var Init_Map = function(){
			
			var map = new google.maps.Map(document.getElementById('map_staions'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
				mapTypeId: 'roadmap'
			});
			map.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				$scope.new_booking.lat = lat;
				$scope.new_booking.lon = lon;
				
				Helper.Get_Address(lat, lon).then(function(address){
					$scope.new_booking.address_state = "true";
					$scope.new_booking.address = address;
				}, function(response){
					$scope.new_booking.address_state = "false";
				});

			});
		};
		
		setTimeout(Init_Map, 2000);

		
		
	}
	
	
	
});
