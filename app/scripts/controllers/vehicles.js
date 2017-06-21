'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:VechiclesCtrl
 * @description
 * # VehiclesCtrl
 * Controller der Seite Fahrzeuge
 */

application.controller('Ctrl_Vehicles', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	$scope.testing = false;

    var vehicles_all = {};
    var vehicle_old = {};

    var markers = [];

    var marker_Address;


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
		},
		station_available: {
			icon: "images/icons/station_available.png"
		}
    };

    var LOADING_STATES = {
        1: {
            text: "Entladen",
            be: "DISCHARGING",
            id: 1
        },
        2: {
            text: "Laden",
            be: "CHARGING",
            id: 2
        },
        3: {
            text: "Geladen",
            be: "FULL",
            id: 3
        }
    };

    var BOOKING_STATES = {
        1: {
            text: "Verfügbar",
            be: "AVAILABLE",
            id: 1
        },
        2: {
            text: "Gebucht",
            be: "BOOKED",
            id: 2
        },
        3: {
            text: "Geblockt",
            be: "BLOCKED",
            id: 3
        }
    };



    /**
	 * Funktion um neuen Marker auf der Karte hinzuzufügen
	 * @method AddMarker
	 * @param {} id
	 * @param {} title
	 * @param {} content
	 * @param {} image_string
	 * @param {} lat
	 * @param {} lon
	 * @param {} map
	 * @return 
	 */
    function AddMarker(id, title, content, image_string, lat, lon, map){

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

            new Load_Details(this.id);

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

    /**
	 * Funktion um einen Marker zu löschen
	 * @method Delete_Markers
	 * @return 
	 */
    function Delete_Markers(){

        for(var i = 0; i < markers.length; i++){
            markers[i].setMap(null);
        }

        markers = [];

    }

    /**
	 * Funktion um einen Automarker hinzufügen zu können
	 * @method Cars_AddMarker
	 * @param {} car
	 * @return 
	 */
    function Cars_AddMarker(car){

        var lat = car.lastLat;
        var lon = car.lastLon;
        var bat = car.chargeLevel;
        var carID = car.vehicleID;

        var title = "Fahrzeugdetails " + carID;

        switch(car.bookingStateObj.be){

            case "AVAILABLE":

                if(car.chargeLevel < 100){

                    RESTFactory.Cars_Get_ChargeLevelPerMinute().then(function(response){

                        var loadingPerSecond = response.data;

                        var endTime = new Date();
                        endTime.setTime(endTime.getTime() + (100 - bat) * 1000 * 60 * loadingPerSecond);

                        var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + " (" + car.loadingStateObj.text + "). Voraussichtliches Ende gegen " + Helper.Get_Zeit(endTime).time + ", bei einer Aufladung von " + loadingPerSecond + "% pro Minute.";
                        if(bat < 25){
                            new AddMarker(carID, title, content, "car_loading_00", lat, lon, map);
                        }else if (bat < 50){
                            new AddMarker(carID, title, content, "car_loading_25", lat, lon, map);
                        }else if (bat < 75){
							new AddMarker(carID, title, content, "car_loading_50", lat, lon, map);
                        }else if (bat < 100){
							new AddMarker(carID, title, content, "car_loading_75", lat, lon, map);
                        }

                    }, function(response){

                        var endTime = new Date();
                        endTime.setTime(endTime.getTime() + (100 - bat) * 1000 * 60);

                        var content = "Das Fahrzeug lädt. Ladezustand " + parseInt(bat) + " (" + car.loadingStateObj.text + "). Voraussichtliches Ende gegen " + Helper.Get_Zeit(endTime).time + ", bei einer Aufladung von 1% pro Minute.";
                        if(bat < 25){
							new AddMarker(carID, title, content, "car_loading_00", lat, lon, map);
                        }else if (bat < 50){
							new AddMarker(carID, title, content, "car_loading_25", lat, lon, map);
                        }else if (bat < 75){
							new AddMarker(carID, title, content, "car_loading_50", lat, lon, map);
                        }else if (bat < 100){
							new AddMarker(carID, title, content, "car_loading_75", lat, lon, map);
                        }

                    });

                }else{
                    var content = "Das Fahrzeug ist voll geladen und kann benutzt werden.";
					new AddMarker(carID, title, content, "car_available", lat, lon, map);
                }

                break;

            case "BOOKED":

				switch (car.loadingStateObj.be) {
					case "FULL":
						var content = "Das Fahrzeug ist gebucht und voll geladen";
						new AddMarker(carID, title, content, "car_reserved", lat, lon, map);
						break;

					case "CHARGING":
						RESTFactory.Cars_Get_ChargeLevelPerMinute().then(function (response) {

							var loadingPerSecond = response.data;

							var endTime = new Date();
							endTime.setTime(endTime.getTime() + (100 - bat) * 1000 * 60 * loadingPerSecond);

							var content = "Das Fahrzeug lädt und im Anschluss gebucht. Ladezustand " + parseInt(bat) + " (" + car.loadingStateObj.text + "). Voraussichtliches Ende gegen " + Helper.Get_Zeit(endTime).time + ", bei einer Aufladung von " + loadingPerSecond + "% pro Minute.";
							new AddMarker(carID, title, content, "car_reserved", lat, lon, map);

						}, function (response) {

							var endTime = new Date();
							endTime.setTime(endTime.getTime() + (100 - bat) * 1000 * 60);

							var content = "Das Fahrzeug lädt und im Anschluss gebucht. Ladezustand " + parseInt(bat) + " (" + car.loadingStateObj.text + "). Voraussichtliches Ende gegen " + Helper.Get_Zeit(endTime).time + ", bei einer Aufladung von 1% pro Minute.";
							new AddMarker(carID, title, content, "car_reserved", lat, lon, map);
							
						});
						break;
					
					case "DISCHARGING":
						var now = Helper.Get_Zeit(new Date());
						if(now.value - car.lastDate.value > 1000 * 60 * 60 * 24){
							var content = "Das Fahrzeug ist gebucht, wurde aber seit mehr als 24 Stunden nicht mehr bewegt";
							new AddMarker(carID, title, content, "car_standing_admin", lat, lon, map);
						}else{
							var content = "Das Fahrzeug ist gebucht, dies ist der letzte bekannte Standort vom " + car.lastDate.date + " um " + car.lastDate.time;
							new AddMarker(carID, title, content, "car_occupied", lat, lon, map);
						}

						break;
				}


                break;

            case "BLOCKED":

                var content = "Das Fahrzeug wurde blockiert";
				new AddMarker(carID, title, content, "car_occupied", lat, lon, map);

                break;

        }

    }

    /**
	 * Hilfsfunktion für die Update mit ID
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
    function Update_ID(id){
        new Update("ID", id, null);
    }

    /**
	 * Updatefunktion um Daten aus der Rest-Schnittstelle zu laden und sie anzuzeigen
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @param {} filter
	 * @return 
	 */
    function Update(type, value, filter){

        vehicles_all = {};
        $scope.vehicles = vehicles_all;

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

			if (data.length > 0) {

				data.forEach(function (data_use, index) {

					var vehicle = {};

					var ID_STR = data_use.carId;

					vehicle.vehicleID = data_use.carId;
					vehicle.licensePlate = data_use.licensePlate;
					vehicle.chargingState = data_use.chargingState;
					vehicle.bookingState = data_use.bookingState;
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
					vehicle.lastDate = Helper.Get_Zeit_Server(data_use.lastKnownPositionDate);
					vehicle.address_state = "false";

					if (filter === null || filter === undefined ||
						filter.toLowerCase() === vehicle.bookingStateObj.be.toLowerCase() || filter.toLowerCase() === vehicle.loadingStateObj.be.toLowerCase() ||
						filter.toLowerCase() === vehicle.bookingStateObj.text.toLowerCase() || filter.toLowerCase() === vehicle.loadingStateObj.text.toLowerCase()) {


						new Cars_AddMarker(vehicle);

						vehicles_all[ID_STR] = vehicle;
						$scope.vehicles = vehicles_all;
						if ($scope.testing === false) {
							$scope.$apply();
						}

						function Get_Address() {
							
							RESTFactory.Get_Address(vehicle.lastLat, vehicle.lastLon).then(function (address) {

								vehicle.address_state = "true";
								vehicle.address = address;

								vehicles_all[ID_STR] = vehicle;
								$scope.vehicles = vehicles_all;
								if ($scope.testing === false) {
									$scope.$apply();
								}

							});

						}

						setTimeout(Get_Address, 100);

					}

				});

			}	

        });



    }


    /**
	 * Funktion um Details aus der Rest-Schnittstelle zu laden und sie anzuzeigen
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
    function Load_Details(id){

        new DisabledEditMode();
            
				

		RESTFactory.Cars_Get_CarID(id).then(function (response) {

			$scope.vehicle_selected = "true";

			var data_use = response.data;

			var vehicle = {};

			vehicle.vehicleID = data_use.carId;
			vehicle.licensePlate = data_use.licensePlate;

			vehicle.bookingStateObj = BOOKING_STATES[data_use.bookingState];
			vehicle.loadingStateObj = LOADING_STATES[data_use.chargingState];

			vehicle.mileage = data_use.mileage;
			vehicle.chargeLevel = data_use.chargeLevel;

			var endTime = new Date();
			endTime.setTime(endTime.getTime() + ((100 - vehicle.chargeLevel) * 60 * 1000));
			vehicle.chargeDone = Helper.Get_Zeit(endTime).time;

			vehicle.kilowatts = data_use.kilowatts;
			vehicle.manufacturer = data_use.manufacturer;
			vehicle.model = data_use.model;
			vehicle.constructionYear = data_use.yearOfConstruction;
			vehicle.lastLat = data_use.lastKnownPositionLatitude;
			vehicle.lastLon = data_use.lastKnownPositionLongitude;
			vehicle.lastDate = Helper.Get_Zeit_Server(data_use.lastKnownPositionDate);
			vehicle.address_state = "false";
			vehicle.maintenanceState = "false";
			vehicle.trip_state = "false";

			$scope.currentVehicle = vehicle;
			if ($scope.testing === false) {
				$scope.$apply();
			}


			map.panTo(new google.maps.LatLng(vehicle.lastLat, vehicle.lastLon));

			function Load_Address() {

				//Get last address
				RESTFactory.Get_Address(vehicle.lastLat, vehicle.lastLon).then(function (address) {

					vehicle.address_state = "true";

					vehicle.address = address;

					$scope.currentVehicle.address = address;

				}, function (response) {

				});

			}

			function Load_Car_Maintenance() {

				//Get all 
				RESTFactory.Car_Maintances_Get_CarID(vehicle.vehicleID).then(function (response) {

					var data = response.data;

					var maintenancesOpen = {};
					var maintenancesDone = {};

					if (data.length !== null && data.length > 0) {

						data.forEach(function (data_use, index) {

							var maintenance = {};
							var ID_STR = data_use.carMaintenanceId;
							maintenance.carMaintenanceID = data_use.carMaintenanceId;
							maintenance.carID = data_use.carId;
							maintenance.maintenanceID = data_use.maintenanceId;
							maintenance.invoiceItemID = data_use.invoiceItemId;
							maintenance.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
							maintenance.invoiceState = "false";
							maintenance.completedState = "false";
							if (data_use.completedDate === null) {
								maintenancesOpen[ID_STR] = maintenance;
							} else {
								maintenance.completedState = "true";
								maintenance.completedDate = Helper.Get_Zeit_Server(data_use.completedDate);
								maintenancesDone[ID_STR] = maintenance;
							}

							vehicle.maintenanceState = "true";
							vehicle.maintenancesDone = maintenancesDone;
							vehicle.maintenancesOpen = maintenancesOpen;

							$scope.currentVehicle.maintenanceState = "true";
							$scope.currentVehicle.maintenancesDone = maintenancesDone;
							$scope.currentVehicle.maintenancesOpen = maintenancesOpen;

							if (data_use.invoiceItemId !== null) {
								console.log("CALLED");
							
								RESTFactory.Invoices_Get_Items_ItemID(maintenance.invoiceItemID).then(function (response) {

									var data = response.data;

									var data_use = data;

									var invoice = {};

									invoice.invoiceID = data_use.invoiceId;
									invoice.totalAmount = data_use.totalAmount;
									invoice.customerID = data_use.customerId;
									invoice.paid = data_use.paid;
									invoice.paidText = "Nicht bezahlt";
									if (invoice.paid === true) { invoice.paidText = "Bezahlt"; }

									maintenance.invoice = invoice;
									maintenance.invoiceState = "true";

									$scope.currentVehicle.maintenancesDone[ID_STR].invoice = invoice;

								}, function (response) {
									
								});


							}

						});

					}

				}, function (response) {

				});

			}

			function Load_Trip() {


				RESTFactory.Trips_Get_CarID(vehicle.vehicleID).then(function (response) {

					var data = response.data;

					var trips = {};

					if (data !== null && data !== undefined && data.length > 0) {

						data.forEach(function (data_use, index) {

							var trip = {};

							trip.tripID = data_use.tripId;
							trip.carID = data_use.carId;
							trip.customerID = data_use.customerId;
							trip.startDate = Helper.Get_Zeit_Server(data_use.startDate);
							trip.endDate = Helper.Get_Zeit_Server(data_use.endDate);
							trip.startChargingStationID = data_use.startChargingStationId;

							trip.endState = "false";
							trip.distanceTravelled = 0;
							if (trip.endDate.state === true) {
								trip.endState = "true";
								trip.distanceTravelled = data_use.distanceTravelled;
								trip.endChargingStationID = data_use.endChargingStationId;
							}

							trips[trip.tripID] = trip;

						});

						vehicle.trip_state = "true";
						vehicle.trips = trips;
						$scope.currentVehicle = vehicle;
						if ($scope.testing === false) {
							$scope.$apply();
						}

					}

				});

			}

			setTimeout(Load_Address, 50);
			setTimeout(Load_Car_Maintenance, 150);
			setTimeout(Load_Trip, 250);

		}, function (response) {
			$scope.vehicle_selected = "false";
			$scope.$apply();
		});

    }



    /**
	 * Funktion um in Modus zu wechseln in dem Daten geändert werden könen
	 * @method EnableEditMode
	 * @return 
	 */
    function EnableEditMode(){
        vehicle_old = angular.copy($scope.currentVehicle);
        $scope.editDisabled = false;
    }

    /**
	 * Funktion um aus dem Modus zu wechseln in dem Daten geändert werden können
	 * @method DisabledEditMode
	 * @return 
	 */
    function DisabledEditMode(){
        $scope.editDisabled = true;
    }


    /**
	 * Funktion um geänderte Daten zu speichern und an die Rest-Schnittstelle zu speichers
	 * @method Safe_Changes
	 * @return 
	 */
    function Safe_Changes(){

        var vehicle = $scope.currentVehicle;

        var vehicleID = vehicle.vehicleID;

        var bookingState = "\"" + vehicle.bookingStateObj.be + "\"";
        var chargingState = "\"" + vehicle.loadingStateObj.be + "\"";

        if(vehicle_old.loadingStateObj === undefined || chargingState !== "\"" + vehicle_old.loadingStateObj.be + "\""){
            RESTFactory.Cars_Patch_ChargingState(vehicleID, chargingState).then(function(response){
                alert("Fahrzeug Ladezustand erfolgreich geändert");
            }, function(){
                alert("Fahrzeug Ladezustand konnte nicht geändert werden");
            });
        }

        if(vehicle_old.bookingStateObj === undefined || bookingState !== "\"" + vehicle_old.bookingStateObj.be + "\""){
            RESTFactory.Cars_Patch_BookingState(vehicleID, bookingState).then(function(response){
                alert("Fahrzeug Reservierungszustand erfolgreich geändert");
            }, function(){
                alert("Fahrzeug Reservierungszustand konnte nicht geändert werden");
            });
        }

        if(vehicle.mileage !== vehicle_old.mileage){
            RESTFactory.Cars_Patch_Mileage(vehicleID, vehicle.mileage).then(function(response){
                alert("Fahrzeug Kilometerstand erfolgreich geändert");
            }, function(){
                alert("Fahrzeug Kilometerstand konnte nicht geändert werden");
            });
        }

        if(vehicle.chargeLevel !== vehicle_old.chargeLevel){
            RESTFactory.Cars_Patch_ChargeLevel(vehicleID, vehicle.chargeLevel).then(function(response){
                alert("Fahrzeug Akkustand erfolgreich geändert");
            }, function(){
                alert("Fahrzeug Akkustand konnte nicht geändert werden");
            });
        }

        setTimeout(Update, 2000);
    }

    /**
	 * Funktion um Änderungen der Detail zu löschen
	 * @method Dismiss_Changes
	 * @return 
	 */
    function Dismiss_Changes(){
        new Load_Details($scope.currentVehicle.vehicleID);
    }



    /**
	 * Funktion um Änderungen zu speichern und diese an die Rest-Schnittstelle zu schicken
	 * @method Safe_New
	 * @return 
	 */
    function Safe_New(){

        if($scope.new_vehicle.hasPosition === false){
            alert("Bitte Position auf der Karte markieren");
            return;
        }

		var new_vehicle = $scope.new_vehicle;

        var vehicle = {};

        vehicle.licensePlate = new_vehicle.licensePlate;

        vehicle.bookingState = new_vehicle.bookingStateObj.be;
        vehicle.chargingState = new_vehicle.loadingStateObj.be;

        vehicle.mileage = new_vehicle.mileage;
        vehicle.chargeLevel = new_vehicle.chargeLevel;
        vehicle.kilowatts = new_vehicle.kilowatts;
        vehicle.manufacturer = new_vehicle.manufacturer;
        vehicle.model = new_vehicle.model;
        vehicle.yearOfConstruction = new_vehicle.yearOfConstruction;
        vehicle.lastKnownPositionLatitude = new_vehicle.lat;
        vehicle.lastKnownPositionLongitude = new_vehicle.lon;
        vehicle.lastKnownPositionDate = (new Date()).toUTCString();

        RESTFactory.Cars_Post(vehicle).then(function(response){

			var station = new_vehicle.station;

			var car_charging_station = {};
			car_charging_station.carId = response.data.id;
			car_charging_station.chargingStationId = station.stationID;
			car_charging_station.chargeStart = (new Date()).toUTCString();

			RESTFactory.Car_Charging_Stations_Post(car_charging_station).then(function (response) {

				station.slotsOccupied++;

				RESTFactory.Charging_Stations_Patch_OccupiedSlots(station.stationID, station.slotsOccupied).then(function (response) {
					alert("Ladestation erfolgreich aktualisiert");
				}, function (response) {
					alert("Ladestation konnte nicht aktualisiert werden");
				});

				alert("Verknüpfung zur Ladestation erfolgreich");
				new Update("ALL", undefined, null);
			}, function (response) {
				alert("Verknüpfung zur Ladestation fehlgeschlagen");
            	new Update("ALL", undefined, null);
			});
			
            alert("Fahrzeug erfolgreich hinzugefügt");
            new Hide_AddVehicle();

        }, function(){
            alert("Fahrzeug konnte nicht hinzugefügt werden");
            new Hide_AddVehicle();
            new Update("ALL", undefined, null);
        });

    }

    /**
	 * Funktion um Änderungen bei Hinzufügen neues Autos zu löschen
	 * @method Dismiss_New
	 * @return 
	 */
    function Dismiss_New(){

        new Hide_AddVehicle();

    }



    /**
	 * Funktion um neues Auto hinzufügen anzuzeigen
	 * @method Show_AddVehicle
	 * @return 
	 */
    function Show_AddVehicle(){

		var map2;

        $scope.view = "add";

        var new_vehicle = {};

        //TODO
        new_vehicle.licensePlate = "";
        new_vehicle.chargingState = "";
        new_vehicle.bookingStateObj = BOOKING_STATES[1];
        new_vehicle.loadingStateObj = LOADING_STATES[1];
        new_vehicle.bookingState = "";
        new_vehicle.mileage = 0;
        new_vehicle.chargeLevel = 0;
        new_vehicle.kilowatts = 0;
        new_vehicle.manufacturer = "";
        new_vehicle.model = "";
        new_vehicle.yearOfConstruction = 0;
        new_vehicle.address_state = "false";
        new_vehicle.hasPosition = false;
        new_vehicle.lat = -190;

        $scope.new_vehicle = new_vehicle;

        /**
		 * Initfunktion um die Karte mit ihren Elementen auf die Seite zu laden
		 * @method Init_Map
		 * @return 
		 */
        function Init_Map(){

            //var input = document.getElementById('search_input');
            //var searchBox = new google.maps.places.SearchBox(input);

            var map2 = new google.maps.Map(document.getElementById('map_vehicle_new'), {
                zoom: 16,
                center: new google.maps.LatLng(49.5, 8.434),
                mapTypeId: 'roadmap'
			});
			
/* UNCOMMENT IF SEARCHBOX IS USEFUL
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
*/			

			RESTFactory.Charging_Stations_Get().then(function (response) {

				var data = response.data;

				data.forEach(function (data_use) {

					var station = {};
					station.stationID = data_use.chargingStationId;
					station.slots = data_use.slots;
					station.slotsOccupied = data_use.slotsOccupied;
					station.lat = data_use.latitude;
					station.lon = data_use.longitude;

					var diff = station.slots - station.slotsOccupied;

					if (diff > 0) {
						var img = {
							url: 'images/icons/station_available.png',
							scaledSize: new google.maps.Size(60, 87),
							origin: new google.maps.Point(0, 0),
							anchor: new google.maps.Point(30, 87)
						};

						img.url = icons["station_available"].icon;

						var marker = new google.maps.Marker({
							position: new google.maps.LatLng(station.lat, station.lon),
							map: map2,
							icon: img,
							optimized: false,
							station: station
						});

						marker.addListener('click', function (event) {

							var _station = this.station;

							new PositionSelected(map2, _station.lat, _station.lon, _station);

						});

					}

				});


			}, function () {

			});


        }

        setTimeout(Init_Map, 1000);

    }

    /**
	 * Funktion um eine Position auf der Karte auswählen zu können
	 * @method PositionSelected
	 * @param {} map2
	 * @param {} lat
	 * @param {} lon
	 * @return 
	 */
    function PositionSelected(map2, lat, lon, station){

        map2.panTo(new google.maps.LatLng(lat, lon));

        $scope.new_vehicle.lat = lat;
        $scope.new_vehicle.lon = lon;
        $scope.new_vehicle.hasPosition = true;
		$scope.new_vehicle.address_state = "false";
		$scope.new_vehicle.station = station;

        RESTFactory.Get_Address(lat, lon).then(function(address){
            $scope.new_vehicle.address_state = "true";
			$scope.new_vehicle.address = address;
			
			if ($scope.testing === false) {
				$scope.$apply();
			}

            if(marker_Address !== undefined){
                marker_Address.setMap(null);
            }

            marker_Address = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lon),
                map: map2,
                title: "Aktuelle Position"
            });

        });

    }

    /**
	 * Funktion um neues Auto hinzufügen verstecken zu können
	 * @method Hide_AddVehicle
	 * @return 
	 */
    function Hide_AddVehicle(){
        $scope.new_vehicle = {};
        $scope.view = "info";
        $scope.vehicle_selected = "false";
		if ($scope.testing === false) {
			$scope.$apply();
		}
    }


    /**
	 * Funktion um in Modus in dem Daten geändert werden könen zu wechseln
	 * @method EnableEditMode
	 * @return 
	 */
    $scope.EnableEditMode = function(){
        new EnableEditMode();
    };

    /**
	 * Funktion um Details anzeigen zu können
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
    $scope.Load_Details = function(id){
        new Load_Details(id);
    };


    /**
	 * Funktion um Details speichern zu können
	 * @method Safe_Changes
	 * @return 
	 */
    $scope.Safe_Changes = function(){
        new Safe_Changes();
    };

    /**
	 * Funktion um geänderte Details speichern abbrechen zu können
	 * @method Dismiss_Changes
	 * @return 
	 */
    $scope.Dismiss_Changes = function(){
        new Dismiss_Changes();
    };


    /**
	 * Funktion um speichern neuer Daten zu können
	 * @method Safe_New
	 * @return 
	 */
    $scope.Safe_New = function(){
        new Safe_New();
    };

    /**
	 * Funktion um speichern neuer Daten abbrechen zu können
	 * @method Dismiss_New
	 * @return 
	 */
    $scope.Dismiss_New = function(){
        new Dismiss_New();
    };


    /**
	 * Funktion um neues Auto hinzufügen anzeigen zu können
	 * @method Show_AddVehicle
	 * @return 
	 */
    $scope.Show_AddVehicle = function(){
        new Show_AddVehicle();
    };

    /**
	 * Funktion um neues Auto hinzufügen verbergen zu können
	 * @method Hide_AddVehicle
	 * @return 
	 */
    $scope.Hide_AddVehicle = function(){
        new Hide_AddVehicle();
    };

    /**
	 * Funktion um nach eingegebenen Wörter im Suchfeld suchen zu können
	 * @method Enter_Search
	 * @return 
	 */
    $scope.Enter_Search = function(){

        var search = $scope.searchQuery;

        if(search === undefined || search.length === 0){
            new Update("ALL", undefined, null);
        }else{
            if(isNaN(search)){

                new Update("ALL", undefined, search);

            }else{
                new Update_ID(search);	
            }
        }

    };



    /**
	 * Initfunktion der Seite Vehicles
	 * @method Init
	 * @return 
	 */
    function Init(){

        $scope.bookingStates = BOOKING_STATES;
        $scope.loadingStates = LOADING_STATES;

        new Update("ALL", undefined, null);

    }

    new Init();

});
