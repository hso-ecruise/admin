'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:VechiclesCtrl
 * @description
 * # VehiclesCtrl
 * give some description here
 */
 
application.controller('Ctrl_Vehicles', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	var vehicles_all = {};

	var markers = [];
	
	
	var map = new google.maps.Map(document.getElementById('map_vehicles'), {
        zoom: 16,
        center: new google.maps.LatLng(49.5, 8.434),
        mapTypeId: 'roadmap'
    });
	
	var icons = {
        car_available: {
            icon: "images/icons/car_available.png"
        },
        car_loading_00:{
            icon: "images/icons/car_loading_00.png"
        },
        car_loading_25:{
            icon: "images/icons/car_loading_25.png"
        },
        car_loading_50:{
            icon: "images/icons/car_loading_50.png"
        },
        car_loading_75:{
            icon: "images/icons/car_loading_75.png"
        },
        car_occupied:{
            icon: "images/icons/car_occupied.png"
        },
        car_reserved:{
            icon: "images/icons/car_reserved.png"
        },
        car_standing_admin:{
            icon: "images/icons/car_standing_admin.png"
        },
        car_standing_user:{
            icon: "images/icons/car_standing_user.png"
        }
    };
	
	function AddMarker(title, content, image_string, lat, lon){
	
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
		
		markers.push(marker);

    }
	
	function Delete_Markers(){
		
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
		
		markers = [];
		
	}
	
	function Cars_AddMarker(car){

        if(car.bookingState === 0){

            var lat = car.lastLat;
            var lon = car.lastLon;
            var bat = car.chargeLevel;
            var carID = car.vehicleID;

            var title = "Fahrzeugdetails: ID " + carID;

            if(bat < 100){
				
                var prom_charge = RESTFactory.Car_Charging_Stations_Get_CarID(carID);

                prom_charge.then(function(response){
					
					var info = response.data;
					
					//MULTIPLE STATIONS OR ONLY ONE
					for(var tz = 0; tz < info.length; tz++){
						
						var station = info[tz];
						
						if(station.carId === carID){
						
							if(info.length > 0){

								var time = Helper.Get_Time(info[tz].chargeEnd);
								var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + "%. Voraussichtliches Ende: gegen " + time;

								if(bat < 25){
									new AddMarker(title, content, "car_loading_00", lat, lon);
								}else if (bat < 50){
									new AddMarker(title, content, "car_loading_25", lat, lon);
								}else if (bat < 75){
									new AddMarker(title, content, "car_loading_50", lat, lon);
								}else if (bat < 100){
									new AddMarker(title, content, "car_loading_75", lat, lon);
								}

							}
							
							break;
							
						}
					}
					
                }, function(response){
					
					var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + "%. Voraussichtliches Ende: kann nicht abgerufen werden";
					
					if(bat < 25){
						new AddMarker(title, content, "car_loading_00", lat, lon);
					}else if (bat < 50){
						new AddMarker(title, content, "car_loading_25", lat, lon);
					}else if (bat < 75){
						new AddMarker(title, content, "car_loading_50", lat, lon);
					}else if (bat < 100){
						new AddMarker(title, content, "car_loading_75", lat, lon);
					}
					
                });



            }else{

                var content = "Das Fahrzeug ist voll geladen und kann benutzt werden.";

                new AddMarker(title, content, "car_available", lat, lon);

            }

        }

    }
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		vehicles_all = {};
		
		$scope.vehicle_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		new Delete_Markers();
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Cars_Get_CarID(value);
		}else{
			prom = RESTFactory.Cars_Get();
		}
		
		prom.then(function(response){
			
			var data = [];
			
			if(type === "ID"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var vehicle = {};
				
				var ID_STR = data_use.carId;
				
				vehicle.vehicleID = data_use.carId;
				vehicle.licensePlate = data_use.licensePlate;
				vehicle.chargingState = data_use.chargingState;
				vehicle.bookingState = data_use.bookingState;
				vehicle.mileage = data_use.mileage;
				vehicle.chargeLevel = data_use.chargeLevel;
				vehicle.kilowatts = data_use.kilowatts;
				vehicle.manufacturer = data_use.manufacturer;
				vehicle.model = data_use.model;
				vehicle.constructionYear = data_use.yearOfConstruction;
				vehicle.lastLat = data_use.lastKnownPositionLatitude;
				vehicle.lastLon = data_use.lastKnownPositionLongitude;
				vehicle.lastDate = data_use.lastKnownPositionDate;
				
				new Cars_AddMarker(vehicle);
				
				vehicles_all[ID_STR] = vehicle;
				$scope.vehicles = vehicles_all;
				$scope.$apply();
				
			}
			
		}, function(response){
			
			$scope.vehicles = vehicles_all;
			$scope.$apply();
			
		});
		
		
		
	}
	
	
	function Load_Details(id){
		
		console.log(id);
		
		new DisabledEditMode();
		
		RESTFactory.Cars_Get_CarID(id).then(function(response){
			
			$scope.vehicle_selected = "true";
			
			var data_use = response.data;
			
			var vehicle = {};
			
			vehicle.vehicleID = data_use.carId;
			vehicle.licensePlate = data_use.licensePlate;
			vehicle.chargingState = data_use.chargingState;
			vehicle.bookingState = data_use.bookingState;
			vehicle.mileage = data_use.mileage;
			vehicle.chargeLevel = data_use.chargeLevel;
			vehicle.kilowatts = data_use.kilowatts;
			vehicle.manufacturer = data_use.manufacturer;
			vehicle.model = data_use.model;
			vehicle.constructionYear = data_use.yearOfConstruction;
			vehicle.lastLat = data_use.lastKnownPositionLatitude;
			vehicle.lastLon = data_use.lastKnownPositionLongitude;
			vehicle.lastDate = data_use.lastKnownPositionDate;
			vehicle.address_state = "false";
			
			$scope.currentVehicle = vehicle;
			$scope.$apply();
			
			
			//GET CUSTOMER
			Helper.Get_Address(vehicle.lastLat, vehicle.lastLon).then(function(address){
				
				vehicle.address_state = "true";
				
				vehicle.address = address;
				
				$scope.currentVehicle = vehicle;
				$scope.$apply();
				
			}, function(response){
				vehicle.address_state = "false";
				$scope.currentVehicle = vehicle;
				$scope.$apply();
				
			});
			
		}, function(response){
			$scope.vehicle_selected = "false";
			$scope.$apply();			
			
		});
		
	}
	
	
	
	function EnableEditMode(){
		$scope.editDisabled = false;
	}
	
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	
	function Safe_Changes(){
		
		var vehicle = $scope.currentVehicle;
		
		var vehicleID = vehicle.vehicleID;
		
		//REST CALL TO MAKE CHANGES
		
		
		
	}
	
	function Dismiss_Changes(){
		new Load_Details($scope.currentVehicle.vehicleID);
	}
	
	
	
	function Safe_New(){
		
		if($scope.new_vehicle.hasPosition === false){
			alert("Bitte Position auf der Karte markieren");
			return;
		}
		
		var vehicle = {};
		
		vehicle.licensePlate = $scope.new_vehicle.licensePlate;
		vehicle.chargingState = $scope.new_vehicle.chargingState;
		vehicle.bookingState = $scope.new_vehicle.bookingState;
		vehicle.mileage = $scope.new_vehicle.mileage;
		vehicle.chargeLevel = $scope.new_vehicle.chargeLevel;
		vehicle.kilowatts = $scope.new_vehicle.kilowatts;
		vehicle.manufacturer = $scope.new_vehicle.manufacturer;
		vehicle.model = $scope.new_vehicle.model;
		vehicle.yearOfConstruction = $scope.new_vehicle.yearOfConstruction;
		vehicle.lastKnownPositionLatitude = $scope.new_vehicle.lat;
		vehicle.lastKnownPositionLongitude = $scope.new_vehicle.lon;
		vehicle.lastKnownPositionDate = new Date();
		
		RESTFactory.Cars_Post(vehicle).then(function(response){
			alert("Fahrzeug erfolgreich hinzugefügt");
			new Hide_AddVehicle();
			setTimeout(Update, 1000);
		}, function(response){
			alert("Fahrzeug konnte nicht hinzugefügt werden");
			new Hide_AddVehicle();
			setTimeout(Update, 1000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddVehicle();
		
	}
	
	
	
	function Show_AddVehicle(){
		
		$scope.view = "add";
		
		var new_vehicle = {};
		
		//TODO
		new_vehicle.licensePlate = "";
		new_vehicle.chargingState = "";
		new_vehicle.bookingState = "";
		new_vehicle.mileage = 0;
		new_vehicle.chargeLevel = 0;
		new_vehicle.kilowatts = 0;
		new_vehicle.manufacturer = "";
		new_vehicle.model = "";
		new_vehicle.yearOfConstruction = 0;
		new_vehicle.address_state = "false";
		new_vehicle.hasPosition = false;
		

		$scope.new_vehicle = new_vehicle;
		
		function Init_Map(){
			
			var map2 = new google.maps.Map(document.getElementById('map_vehicle_new'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
				mapTypeId: 'roadmap'
			});
			
			map2.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				$scope.new_vehicle.lat = lat;
				$scope.new_vehicle.lon = lon;
				$scope.new_vehicle.hasPosition = true;
				
				Helper.Get_Address(lat, lon).then(function(address){
					$scope.new_vehicle.address_state = "true";
					$scope.new_vehicle.address = address;
				}, function(response){
					console.log(response);
					$scope.new_vehicle.address_state = "false";
				});

			});
		}
		
		setTimeout(Init_Map, 2000);
		
	}
	
	function Hide_AddVehicle(){
		$scope.new_vehicle = {};
		$scope.view = "info";
		$scope.vehicle_selected = "false";
		$scope.$apply();
	}
	
	
	
	
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	
	$scope.Safe_Changes = function(){
		new Safe_Changes();
	};
	
	$scope.Dismiss_Changes = function(){
		new Dismiss_Changes();
	};
	
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	
	$scope.Show_AddVehicle = function(){
		new Show_AddVehicle();
	};
	
	$scope.Hide_AddVehicle = function(){
		new Hide_AddVehicle();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		console.log(search);
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();

});
