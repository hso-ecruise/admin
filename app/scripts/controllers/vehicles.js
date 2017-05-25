'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:VechiclesCtrl
 * @description
 * # VehiclesCtrl
 * give some description here
 */
 
application.controller('Ctrl_Vehicles', function () {

	var cars_all = {};

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
        },
        station_available:{
            icon: "images/icons/station_available.png"
        },
        station_occupied:{
            icon: "images/icons/station_occupied.png"
        }
    };

	var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: new google.maps.LatLng(49.5, 8.434),
        mapTypeId: 'roadmap'
    });

    map.addListener("click", function(event){

        var lat = event.latLng.lat();
        var lon = event.latLng.lng();
		
        Helper.Get_Address(lat, lon).then(function(address){
            console.log(address);
			//Zum bekommen einer Adresse
		}, function(response){
			
		});

    });
	
	
	
	
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
	
	
	var Cars_AddMarker = function(car){

        if(car.bookingState === 0){

            var lat = car.lastLat;
            var lon = car.lastLon;
            var bat = car.chargeLevel;
            var carID = car.carId;

            var title = "Fahrzeugdetails:";

            if(bat < 100){
				
                var prom_charge = RESTFactory.Car_Charging_Stations_Get_CarID(carID);

                prom_charge.then(function(response){
					
					var info = response.data;
					
					for(var tz = 0; tz < info.length; tz++){
						
						var station = info[tz];
						
						if(station.CarId === carID){
						
							if(info.length > 0){

								var time = Helper.Get_Time(info[tz].chargeEnd);
								var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + "%. Voraussichtliches Ende: gegen " + time;

								if(bat < 25){
									AddMarker(title, content, "car_loading_00", lat, lon);
								}else if (bat < 50){
									AddMarker(title, content, "car_loading_25", lat, lon);
								}else if (bat < 75){
									AddMarker(title, content, "car_loading_50", lat, lon);
								}else if (bat < 100){
									AddMarker(title, content, "car_loading_75", lat, lon);
								}

							}
							
							break;
							
						}
					}
					
                }, function(response){
					
					var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + "%. Voraussichtliches Ende: kann nicht abgerufen werden";
					
					if(bat < 25){
						AddMarker(title, content, "car_loading_00", lat, lon);
					}else if (bat < 50){
						AddMarker(title, content, "car_loading_25", lat, lon);
					}else if (bat < 75){
						AddMarker(title, content, "car_loading_50", lat, lon);
					}else if (bat < 100){
						AddMarker(title, content, "car_loading_75", lat, lon);
					}
					
					
					
                });



            }else{

                var content = "Das Fahrzeug ist voll geladen und kann benutzt werden.";

                AddMarker(title, content, "car_available", lat, lon);

            }

        }

    }
	
	
	var Stations_AddMarker = function(station){
		
		var lat = station.lat;
        var lon = station.lon;

		//FEHLER OCCUPIED
        var occupied = station.slotsOccupuied;
        var total = station.slots;

        var diff = total - occupied;

        var title = "Ladestation";
        var content =  diff + " von " + total + " Slots frei";
		
        if(diff === 0){
            AddMarker(title, content, "station_occupied", lat, lon);
        }else{
            AddMarker(title, content, "station_available", lat, lon);
        }
		
	};
	
	
	var Cars_Update = function(){
		
		$scope.car_selected = "false";
		
		RESTFactory.Cars_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var car = {};
				
				var ID_STR = data_use.carId;
				
				car.carID = data_use.carId;
				car.licensePlate = data_use.licensePlate;
				car chargingState = data_use.chargingState;
				car.bookingState = data_use.bookingState;
				car.mileage = data_use.mileage;
				car.chargeLevel = data_use.chargeLevel;
				car.kilowatts = data_use.kilowatts;
				car.manufacturer = data_use.manufacturer;
				car.model = data_use.model;
				car.constructionYear = data_use.yearOfConstruction;
				car.lastLat = data_use.lastKnownPositionLatitude;
				car.lastLon = data_use.lastKnownPositionLongitude;
				car.lastDate = data_use.lastKnownPositionDate;
				
				cars_all[ID_STR] = car;
				$scope.cars = cars_all;
				$scope.$apply();
				
			}
			
		}, function(response){
			
			console.log("Cant get cars");
			
		});
		
		
		
	};
	
	
	var Stations_Update = function(){
		
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
	
	
	
	
	
	
	var Cars_LoadDetails = function(id){
		
		RESTFactory.Cars_Get_CarID(id).then(function(response){
			
			var data = response.data;
			
			var car = {};
			
			car.carID = data.carId;
			car.licensePlate = data.licensePlate;
			car chargingState = data.chargingState;
			car.bookingState = data.bookingState;
			car.mileage = data.mileage;
			car.chargeLevel = data.chargeLevel;
			car.kilowatts = data.kilowatts;
			car.manufacturer = data.manufacturer;
			car.model = data.model;
			car.constructionYear = data.yearOfConstruction;
			car.lastLat = data.lastKnownPositionLatitude;
			car.lastLon = data.lastKnownPositionLongitude;
			car.lastDate = data.lastKnownPositionDate;
			
			$scope.currentCar = car;
			$scope.$apply();
			
		}, function(response){
			
			
			
		});
		
		
		
	};
	
	var init = function(){
		
		var input = document.getElementById('search_input');
		var searchBox = new google.maps.places.SearchBox(input);
		
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
			
		map.addListener('bounds_changed', function() {
			searchBox.setBounds(map.getBounds());
		});
		
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
			
			var places = searchBox.getPlaces();

			if (places.length === 0) {
				return;
			}
			
			var place = places[0].geometry.location;
			
			var lat = place.lat();
			var lon = place.lng();
			
			var prom_addr = Helper.Get_Address(lat, lon);
			prom_addr.then(function(response){
				ShowInputPopUp(response, lat, lon);
			});
			
        });
		
		
		//GET NEXT BOOKINGS
		var prom_bookings = RESTFactory.Bookings_Get_CustomerID(customerID);
		
		prom_bookings.then(function(response){
			
			var bookings = response.data;
			
			var interested = [];
			
			var soon_bookings = [];
			
			for(var jk = 0; jk < bookings.length; jk++){
				
				var booking = bookings[jk];
				
				var d = new Date(booking.plannedDate);
				var now = new Date();
				var dif = (d.getTime() - now.getTime()) / 1000 / 60;
				
				if(dif < 30 && dif > 0){
					interested.push(booking);
				}
				
			}
			
			for(var kl = 0; kl < interested.length; kl++){
				
				var booking2 = interested[kl];
				
				var prom_trip = RESTFactory.Trips_Get_TripID(booking2.TripId);
				
				prom_trip.then(function(response){
					
					var trip = response.data;
					
					var carID = trip.CarId;
					var chargingID = trip.startChargingStationId;
					
					var prom_charge = RESTFactory.Charging_Stations_Get_Charging_StationID(chargingID);
					
					prom_charge.then(function(response){
						
						var station = response.data;
						
						var lat = station.latitude;
						var lon = station.longitude;
						
						Helper.Get_Address(lat, lon).then(function(address){
							
							var soon_booking = {};
						
							soon_booking.lat = lat;
							soon_booking.lon = lon;
							soon_booking.stationID = chargingID;
							soon_booking.carID = carID;
							soon_booking.address = address;
							soon_booking.date = Helper.Get_Date(booking2.plannedDate);
							soon_booking.time = Helper.Get_Time(booking2.plannedDate);
							
							soon_bookings.push(soon_booking);
							
							var content = "Ihr Fahrzeug mit der ID: " + soon_booking.carID + " steht ab " + soon_booking.time + " am " + soon_booking.date + " an der Station " + soon_booking.stationID + " bereit";
							
							AddMarker("Ihre Reservierung", content, "car_reserved", lat, lon);
							
						});
						
					});
					
				});
				
			}
			
		}, function(response){
			console.log("Cant get bookings for init maps");
		});
		
	};
	

	init();
	
	






   

    function AddStation(station){



    }

    function LoadPositions(){

        //GET Call to get all cars
        RESTFactory.Cars_Get().then(function(response){
			
			
            var cars = response.data;
			
            for(var ij = 0; ij < cars.length; ij++){
                var car = cars[ij];
                AddVehicle(car);
            }

        }, function(response){

            console.log("Failed to get cars position.");

        });


        //GET Call to get all stations
        RESTFactory.Charging_Stations_Get().then(function(response){

            var stations = response.data;

			console.log(stations);
			
            for(var i = 0; i < stations.length; i++){
                var station = stations[i];
                AddStation(station);
            }

        }, function(response){

            console.log("Failed to get stations position.");

        });

    }

    function ShowInputPopUp(address, lat, lon){

        map.panTo(new google.maps.LatLng(lat, lon));
		
        $scope.address = address;

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
            '<md-dialog class="booking-dialog">'+
            '	<md-dialog-content>' +

            '		<md-toolbar class="md-hue-2">' +
            '			<div class="md-toolbar-tools">' +
            '				<h2 class="md-flex">Bitte Fahrtdaten eingeben</h2>' +
            '			</div>' +
            '		</md-toolbar>' +

            '		<md-content flex layout-padding>' +
            '			<div>' +
            '				<label> Straße Nr.: {{ address.street }}  {{ address.number }}</label>' +
            '				<br/>' +
            '				<label> Stadt: {{ address.zip }}  {{ address.city }}</label>' +
            '			</div>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-input-container>' +
            '				<input type="date" placeholder="Datum" min="{{minDate}}" class="md-input" ng-model="date" ng-required="true" >' +   
            '			</md-input-container>' +
            '			<md-input-container>' +
            '				<input type="time" placeholder="Uhrzeit" min="{{minTime}}" class="md-input" ng-model="time" ng-required="true" >' +
            '			</md-input-container>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-button class="md-raised md-primary button-to-right" ng-click="Save()"> Speichern </md-button>' +
            '			<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '		</md-content>' +

            '	</md-dialog-content>' +
            '</md-dialog>',

            controller: function DialogController($scope, $mdDialog){

                $scope.address = address;

				var timeInput = new Date();
				timeInput.setMilliseconds(0);
				timeInput.setSeconds(0);
				
				var minTime = timeInput;
				minTime.setMinutes(timeInput.getMinutes() - 1);
				
				
				var dateInput = new Date();
				dateInput.setMilliseconds(0);
				dateInput.setSeconds(0);
				dateInput.setMinutes(0);
				dateInput.setHours(0);
				
				var minDate = dateInput;
				
				$scope.time = timeInput;
				$scope.minTime = minTime;
				
				$scope.date = dateInput;
				$scope.minDate = minDate;

                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                $scope.Save = function(){
					
					var date = $scope.date;
					var time = $scope.time;
					
					var plannedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0, 0);
					
					console.log(plannedDate);
					
					var now = new Date();
					
					if(plannedDate.getTime() - now.getTime() < 0){
						alert("Die Startzeit liegt in der Vergangenheit. Bitte überprüfen Sie Ihre Eingaben.");
						return;
					}
					
					now = "\"" + now + "\"";
					plannedDate = "\"" + plannedDate + "\"";
					
					var data = {
						customerId: customerID,
						bookedPositionLatitude: lat,
						bookedPositionLongitude: lon,
						bookingDate: now,
						plannedDate: plannedDate
					};
					
                    console.log("REST call for booking");
					console.log(data);
					
					var prom_booking = RESTFactory.Bookings_Post(data);
					
					prom_booking.then(function(response){
						alert("Buchung erfolgreich");
					}, function(response){
						alert("Buchung fehlgeschlagen");
					});
					
                    $scope.closeDialog();
                };

            }
        });

    }

    LoadPositions();
	
	
	

});
