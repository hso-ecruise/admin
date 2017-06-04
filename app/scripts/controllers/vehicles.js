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
	var vehicle_old = {};

	var markers = [];
	
	var marker_Address = undefined;
	
	
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
	
	var LOADING_STATES = {
		0: {
			text: "Entladen",
			be: "DISCHARGING",
			id: 0
		},
		1: {
			text: "Laden",
			be: "CHARGING",
			id: 1
		},
		2: {
			text: "Geladen",
			be: "FULL",
			id: 2
		}
	}
	
	var BOOKING_STATES = {
		0: {
			text: "Verfügbar",
			be: "AVAILABLE",
			id: 0
		},
		1: {
			text: "Gebucht",
			be: "BOOKED",
			id: 1
		},
		2: {
			text: "Geblockt",
			be: "BLOCKED",
			id: 2
		}
	};
	
	
	
	function AddMarker(id, title, content, image_string, lat, lon){
	
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
	
	function Cars_AddMarker(car){
		
        if(car.bookingState !== 1000){

            var lat = car.lastLat;
            var lon = car.lastLon;
            var bat = car.chargeLevel;
            var carID = car.vehicleID;

            var title = "Fahrzeugdetails " + carID;

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
									new AddMarker(carID, title, content, "car_loading_00", lat, lon);
								}else if (bat < 50){
									new AddMarker(carID, title, content, "car_loading_25", lat, lon);
								}else if (bat < 75){
									new AddMarker(carID, title, content, "car_loading_50", lat, lon);
								}else if (bat < 100){
									new AddMarker(carID, title, content, "car_loading_75", lat, lon);
								}

							}
							
							break;
							
						}
					}
					
                }, function(response){
					
					var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + "%. Voraussichtliches Ende: kann nicht abgerufen werden";
					
					if(bat < 25){
						new AddMarker(carID, title, content, "car_loading_00", lat, lon);
					}else if (bat < 50){
						new AddMarker(carID, title, content, "car_loading_25", lat, lon);
					}else if (bat < 75){
						new AddMarker(carID, title, content, "car_loading_50", lat, lon);
					}else if (bat < 100){
						new AddMarker(carID, title, content, "car_loading_75", lat, lon);
					}
					
                });



            }else{

                var content = "Das Fahrzeug ist voll geladen und kann benutzt werden.";

                new AddMarker(carID, title, content, "car_available", lat, lon);

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
			
			data.forEach(function(data_use, index){
				
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
				vehicle.address_state = "false";
				
				new Cars_AddMarker(vehicle);
				
				vehicles_all[ID_STR] = vehicle;
				$scope.vehicles = vehicles_all;
				$scope.$apply();
				
				Helper.Get_Address(vehicle.lastLat, vehicle.lastLon).then(function(address){
				
					vehicle.address_state = "true";
					vehicle.address = address;
					
					vehicles_all[ID_STR] = vehicle;
					$scope.vehicles = vehicles_all;
					$scope.$apply();
					
				}, function(response){
				
				});
				
				
			});
			
		}, function(response){
			
			$scope.vehicles = vehicles_all;
			$scope.$apply();
			
		});
		
		
		
	}
	
	
	function Load_Details(id){
		
		new DisabledEditMode();
		
		RESTFactory.Cars_Get_CarID(id).then(function(response){
			
			$scope.vehicle_selected = "true";
			
			var data_use = response.data;
			
			var vehicle = {};
			
			vehicle.vehicleID = data_use.carId;
			vehicle.licensePlate = data_use.licensePlate;
			
			vehicle.bookingStateObj = BOOKING_STATES[data_use.bookingState];
			vehicle.loadingStateObj = LOADING_STATES[data_use.chargingState];
			
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
			vehicle.maintenance_state = "false";
			
			$scope.currentVehicle = vehicle;
			$scope.$apply();
			
			
			map.panTo(new google.maps.LatLng(vehicle.lastLat, vehicle.lastLon));
			
			Helper.Get_Address(vehicle.lastLat, vehicle.lastLon).then(function(address){
				
				vehicle.address_state = "true";
				
				vehicle.address = address;
				
				$scope.currentVehicle = vehicle;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			
			RESTFactory.Car_Maintances_Get_CarID(vehicle.vehicleID).then(function(response){
				
				vehicle.maintenance_state = "true";
				
				var data = response.data;
				
				var data_use = data;
				
				var maintenance = {};
				maintenance.carMaintenanceID = data_use.carMaintenanceId;
				maintenance.carID = data_use.carId;
				maintenance.maintenanceID = data_use.maintenanceId;
				maintenance.invoiceItemID = data_use.invoiceItemId;
				maintenance.plannedDate = Helper.Get_Zeit(data_use.plannedDate);
				maintenance.completedDate = Helper.Get_Zeit(data_use.completedDate);
				
				maintenance.text = "Letzte Wartung";
				
				var now = new Date();
				
				if(now.getTime() - maintenance.plannedDate.value > 0){
					maintenance.text = "Nächste Wartung";
				}
				
				vehicle.maintenance = maintenance;
				
				$scope.currentVehicle = vehicle;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			
			
		}, function(response){
			$scope.vehicle_selected = "false";
			$scope.$apply();			
			
		});
		
	}
	
	
	
	function EnableEditMode(){
		vehicle_old = angular.copy($scope.currentVehicle);
		$scope.editDisabled = false;
	}
	
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	
	function Safe_Changes(){
		
		var vehicle = $scope.currentVehicle;
		
		var vehicleID = vehicle.vehicleID;
		
		var bookingState = "\"" + vehicle.bookingStateObj.be + "\"";
		var chargingState = "\"" + vehicle.loadingStateObj.be + "\"";
		
		if(vehicle_old.loadingStateObj === undefined || chargingState !== "\"" + vehicle_old.loadingStateObj.be + "\""){
			RESTFactory.Cars_Patch_ChargingState(vehicleID, chargingState).then(function(response){
				alert("Fahrzeug Ladezustand erfolgreich geändert");
			}, function(response){
				alert("Fahrzeug Ladezustand konnte nicht geändert werden");
			});
		}
		
		if(vehicle_old.bookingStateObj === undefined || bookingState !== "\"" + vehicle_old.bookingStateObj.be + "\""){
			RESTFactory.Cars_Patch_BookingState(vehicleID, bookingState).then(function(response){
				alert("Fahrzeug Reservierungszustand erfolgreich geändert");
			}, function(response){
				alert("Fahrzeug Reservierungszustand konnte nicht geändert werden");
			});
		}
		
		if(vehicle.mileage !== vehicle_old.mileage){
			RESTFactory.Cars_Patch_Mileage(vehicleID, vehicle.mileage).then(function(response){
				alert("Fahrzeug Kilometerstand erfolgreich geändert");
			}, function(response){
				alert("Fahrzeug Kilometerstand konnte nicht geändert werden");
			});
		}
		
		if(vehicle.chargeLevel !== vehicle_old.chargeLevel){
			RESTFactory.Cars_Patch_ChargeLevel(vehicleID, vehicle.chargeLevel).then(function(response){
				alert("Fahrzeug Akkustand erfolgreich geändert");
			}, function(response){
				alert("Fahrzeug Akkustand konnte nicht geändert werden");
			});
		}
		
		
		setTimeout(new Update("ALL", undefined), 2000);
		
		
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
		
		vehicle.bookingState = $scope.new_vehicle.bookingStateObj.be;
		vehicle.chargingState = $scope.new_vehicle.loadingStateObj.be;
		
		vehicle.mileage = $scope.new_vehicle.mileage;
		vehicle.chargeLevel = $scope.new_vehicle.chargeLevel;
		vehicle.kilowatts = $scope.new_vehicle.kilowatts;
		vehicle.manufacturer = $scope.new_vehicle.manufacturer;
		vehicle.model = $scope.new_vehicle.model;
		vehicle.yearOfConstruction = $scope.new_vehicle.yearOfConstruction;
		vehicle.lastKnownPositionLatitude = $scope.new_vehicle.lat;
		vehicle.lastKnownPositionLongitude = $scope.new_vehicle.lon;
		vehicle.lastKnownPositionDate = new Date();
		
		console.log(vehicle);
		
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
		new_vehicle.bookingStateObj = BOOKING_STATES[0];
		new_vehicle.loadingStateObj = LOADING_STATES[0];
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
			
			var input = document.getElementById('search_input');
			var searchBox = new google.maps.places.SearchBox(input);
			
			var map2 = new google.maps.Map(document.getElementById('map_vehicle_new'), {
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
		
		$scope.new_vehicle.lat = lat;
		$scope.new_vehicle.lon = lon;
		$scope.new_vehicle.hasPosition = true;
		
		Helper.Get_Address(lat, lon).then(function(address){
			$scope.new_vehicle.address_state = "true";
			$scope.new_vehicle.address = address;
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
			$scope.new_vehicle.address_state = "false";
		});

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
		
		$scope.bookingStates = BOOKING_STATES;
		$scope.loadingStates = LOADING_STATES;
		
		new Update("ALL", undefined);
		
	}

	new Init();

});
