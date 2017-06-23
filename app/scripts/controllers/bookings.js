'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Bookings', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	$scope.testing = false;

	var bookings_all = {};
	
	var marker_Address;
	
	
	/**
	 * Funktion die den User Name ändert
	 * @method Update_UserName
	 * @param {} name
	 * @return 
	 */
	function Update_UserName(name){
		
		//Search for customerName
		name = name.toLowerCase();
		
		RESTFactory.Customers_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				if(data[i].lastName.toLowerCase().includes(name)){
					new Update("NAME", data[i].customerId);
				}
				
			}
			
		});
		
	}
	
	/**
	 * Funktion die den User ID ändert
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id){
		new Update("ID", id);
	}
	
	/**
	 * Funktion die Userdaten ändert
     * BookingID, CustomerID,  TripID, InvoiceItemID
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(type, value){
		
		bookings_all = {};
		$scope.bookings = bookings_all;
		$scope.booking_selected = "false";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "ALL"){
			prom = RESTFactory.Bookings_Get();
		}else if(type === "ID"){
			prom = RESTFactory.Bookings_Get_BookingID(value);
		}else if(type === "NAME"){
			prom = RESTFactory.Bookings_Get_CustomerID(value);
		}else{
			prom = RESTFactory.Bookings_Get();
		}
		
		prom.then(function(response){
			
			var data = [];
			
			if(type === "ID"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			
			data.forEach(function(in_booking, index){
				//var in_booking = data[i];
				
				var booking = {};
				
				var ID_STR = in_booking.bookingId;
				
				booking.bookingID = in_booking.bookingId;
				booking.customerID = in_booking.customerId;
				booking.tripID = in_booking.tripId;
				booking.invoiceItemID = in_booking.invoiceItemId;
				
				
				var plannedDate = Helper.Get_Zeit_Server(in_booking.plannedDate);
				booking.plannedDate = plannedDate;

				if(plannedDate.state === "false"){
					booking.status = "FAILED";
					booking.statusText = "Datum ungültig";
					if (in_booking.plannedDate === null) {
						booking.status = "SPONTAN";
						booking.statusText = "Spontane Fahrt";
					}
				}else{
					var now = new Date();
					if(plannedDate.value - now.getTime() < 0){
						booking.status = "PAST";
						booking.statusText = "In der Vergangeheit";
					}else{
						booking.status = "FUTURE";
						booking.statusText = "In der Zukunft";
					}
				}
				
				bookings_all[ID_STR] = booking;
				$scope.bookings = bookings_all;
				if ($scope.testing === false) {
					$scope.$apply();
				}
				
				
				/**
				 * Funktion die Userdata von der Rest-Schnittstelle holt
				 * @method CallCustomer
				 * @return 
				 */
				function CallCustomer(){
				
					//GET CUSTOMER
					RESTFactory.Customers_Get_CustomerID(booking.customerID).then(function(response){
						
						var custom_data = response.data;
						
						var customer = {};
						
						customer.customerID = custom_data.customerId;
						customer.name = custom_data.firstName;
						customer.familyName = custom_data.lastName;
						
						booking.customer = customer;
						
						bookings_all[ID_STR] = booking;
						$scope.bookings = bookings_all;
						if ($scope.testing === false) {
							$scope.$apply();
						}
						
					});
				
				}
				
				setTimeout(CallCustomer, 500);

			});

		});
	}
	
	/**
	 * Funktion die Userdata Details von der Rest-Schnittstelle holt
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	function Load_Details(id){
		
		$scope.booking_selected = "true";
		
		RESTFactory.Bookings_Get_BookingID(id).then(function(response){
			
			var data = response.data;
			
			var booking = {};
			
			booking.bookingID = data.bookingId;
			booking.customerID = data.customerId;
			booking.tripID = data.tripId;
			booking.invoiceItemID = data.invoiceItemId;

			var plannedDate = Helper.Get_Zeit_Server(data.plannedDate);
			booking.plannedDate = plannedDate;

			if(plannedDate.state === "false"){
				booking.status = "FAILED";
				booking.statusText = "Datum ungültig";
				//Check if spontan
				if (data.plannedDate === null) {
					booking.status = "SPONTAN";
					booking.statusText = "Spontane Fahrt";
				}
			}else{
				var now = new Date();
				if(plannedDate.value - now.getTime() < 0){
					booking.status = "PAST";
					booking.statusText = "In der Vergangeheit";
				}else{
					booking.status = "FUTURE";
					booking.statusText = "In der Zukunft";
				}
			}
			
			console.log(booking);

			booking.tripState = "false";
			booking.invoiceState = "false";
			booking.customerState = "false";
			
			$scope.currentBooking = booking;
			if ($scope.testing === false) {
				$scope.$apply();
			}
			
			if(booking.invoiceItemID !== null && booking.invoiceItemID !== 0){

				//GET INVOICE INFOS
				RESTFactory.Invoices_Get_Items_ItemID(booking.invoiceItemID).then(function(response){
				
					var data = response.data;
					
					var invoice = {};
					
					invoice.invoiceID = data.invoiceId;
					invoice.customerId = data.customerID;
					invoice.totalAmount = data.totalAmount;
					invoice.paid = data.paid;
					invoice.paidText = "Rechnung offen";
					if(invoice.paid === "true"){
						invoice.paidText = "Rechnung bezahlt";
					}
					booking.invoice = invoice;
					
					booking.invoiceState = "true";	
					$scope.currentBooking = booking;
					if ($scope.testing === false) {
						$scope.$apply();
					}
					
				});

			}
			
			if(booking.customerID !== null && booking.customerID !== 0){

				//GET CUSTOMER INFOS
				RESTFactory.Customers_Get_CustomerID(booking.customerID).then(function(response){
					
					
					var data = response.data;
					
					var customer = {};
					
					customer.customerID = data.customerId;
					customer.name = data.firstName;
					customer.familyName = data.lastName;
					
					booking.customer = customer;
					
					booking.customerState = "true";
					$scope.currentBooking = booking;
					if ($scope.testing === false) {
						$scope.$apply();
					}
					
				});

			}
			
			if(booking.tripID !== null && booking.tripID !== 0){

				//GET TRIP INFOS
				RESTFactory.Trips_Get_TripID(booking.tripID).then(function(response){

					var data = response.data;

					if(booking.status === "PAST" && data.startDate === null){

					}else{
					
						var trip = {};
						
						trip.tripID = data.tripId;
						trip.carID = data.carId;
						trip.customerID = data.customerId;
						trip.startChargingStationID = data.startChargingStationId;
						trip.endChargingStationID = data.endChargingStationId;
						trip.distance = data.distanceTravelled;
						
						var start = Helper.Get_Zeit_Server(data.startDate);
						var end = Helper.Get_Zeit_Server(data.endDate);

						trip.start = start;
						trip.end = end;

						trip.startState = "false";
						trip.endState = "false";


						if (booking.status === "SPONTAN") {
							booking.plannedDate = start;
						}						

						booking.trip = trip;
						
						booking.tripState = "true";
						$scope.currentBooking = booking;
						if ($scope.testing === false) {
							$scope.$apply();
						}
						
						if(trip.startChargingStationID !== null && trip.startChargingStationID !== 0){

							//GET START STATION AND ADDRESS
							RESTFactory.Charging_Stations_Get_Charging_StationID(trip.startChargingStationID).then(function(response){
								
								var data = response.data;
								
								var station = {};
								
								station.chargingStationID = data.chargingStationId;
								station.slots = data.slots;
								station.slotsOccupied = data.slotsOccupied;
								station.lat = data.latitude;
								station.lon = data.longitude;
								
								booking.trip.start.station = station;
								
								booking.trip.startState = "true";
								$scope.currentBooking = booking;
								if ($scope.testing === false) {
									$scope.$apply();
								}
								
								
								RESTFactory.Get_Address(station.lat, station.lon).then(function(address){
									
									booking.trip.start.station.address = address;
									
									$scope.currentBooking = booking;
									if ($scope.testing === false) {
										$scope.$apply();
									}
									
								});
								
							});
						
						}
						
						if(trip.endChargingStationID !== null && trip.endChargingStationID !== 0){
						
							//GET END STATION AND ADDRESS
							RESTFactory.Charging_Stations_Get_Charging_StationID(trip.endChargingStationID).then(function(response){
								
								var data = response.data;
								
								var station = {};
								
								station.chargingStationID = data.chargingStationId;
								station.slots = data.slots;
								station.slotsOccupied = data.slotsOccupied;
								station.lat = data.latitude;
								station.lon = data.longitude;
								
								booking.trip.end.station = station;
								
								booking.trip.endState = "true";
								$scope.currentBooking = booking;
								if ($scope.testing === false) {
									$scope.$apply();
								}
							
							
								RESTFactory.Get_Address(station.lat, station.lon).then(function(response){
									
									var address = response;
									address.status = true;
									
									booking.trip.end.station.address = address;
									
									$scope.currentBooking = booking;
									if ($scope.testing === false) {
										$scope.$apply();
									}
									
								});
								
							});
							
						}

					}

				});
			
			}
			
		});
		
	}
	
	
	
	/**
	 * Funktion die geänderte Buchungsdaten speichert und sie an die Rest-Schnittstelle übergibt
	 * @method Safe_New
	 * @return 
	 */
	function Safe_New(){
		
		var booking = {};
		
		var date = new Date($scope.new_booking.date);
		var time = new Date($scope.new_booking.time);
		
		var plannedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0, 0);
		var now = new Date();
		
		//TRITT EIGENTLICH NIE AUF
		if(plannedDate.getTime() - now.getTime() < 0){
			alert("Die Startzeit liegt in der Vergangenheit. Bitte überprüfen Sie Ihre Eingaben.");
			return;
		}

		
		booking.customerId = $scope.new_booking.customerID;
		booking.bookingPositionLatitude = $scope.new_booking.lat;
		booking.bookingPositionLongitude = $scope.new_booking.lon;
		booking.bookingDate = now;
		booking.plannedDate = plannedDate.toUTCString();
		
		RESTFactory.Bookings_Post(booking).then(function(response){
			alert("Buchung wurde erfolgreich ausgeführt");
			new Hide_AddBooking();
			new Update("ALL", undefined);
		}, function(response){
			alert("Buchung fehlgeschlagen");
			new Hide_AddBooking();
			new Update("ALL", undefined);
		});
		
	}
	
	/**
	 * Funktion um Neue Buchung hinzufügen abzubrechen
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New(){
		
		new Hide_AddBooking();
		
	}
	
	
	
	/**
	 * Funktion um Neue Buchung hinzufügen anzuzeigen
	 * @method Show_AddBooking
	 * @return 
	 */
	function Show_AddBooking(){
		
		$scope.view = "add";

		var new_booking = {};
		
		var timeInput = new Date();
		timeInput.setMilliseconds(0);
		timeInput.setSeconds(0);
		
		var minTime = timeInput;
		minTime.setMinutes(timeInput.getMinutes() - 1);
		
		
		var dateInput = new Date();
		dateInput.setMilliseconds(0);
		dateInput.setSeconds(0);
		
		var minDate = dateInput;
		
		new_booking.time = timeInput;
		new_booking.minTime = minTime;
		
		new_booking.date = dateInput;
		new_booking.minDate = minDate;
		new_booking.lat = -190;
		
		new_booking.address_state = "false";
		
		$scope.new_booking = new_booking;
		
		/**
		 * Init-Funktion die Karte Initialisiert und diese anzeigt
		 * @method Init_Map
		 * @return 
		 */
		function Init_Map(){
			
			var map = new google.maps.Map(document.getElementById('map_booking'), {
				zoom: 15,
				center: new google.maps.LatLng(49.488813, 8.465976),
				mapTypeId: 'roadmap'
			});
			
			var input = document.getElementById('search_input');
			var searchBox = new google.maps.places.SearchBox(input);
			
			map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
			
			map.addListener('bounds_changed', function() {
				searchBox.setBounds(map.getBounds());
			});
			
			searchBox.addListener('places_changed', function() {
				
				var places = searchBox.getPlaces();

				if (places.length === 0) {
					return;
				}
				
				var place = places[0].geometry.location;
				
				var lat = place.lat();
				var lon = place.lng();
				
				new PositionSelected(map, lat, lon);
				
			});
			
			map.addListener("click", function(event){

				var lat = event.latLng.lat();
				var lon = event.latLng.lng();
				
				new PositionSelected(map, lat, lon);

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
	function PositionSelected(map2, lat, lon){
		
		map2.panTo(new google.maps.LatLng(lat, lon));
		
		$scope.new_booking.lat = lat;
		$scope.new_booking.lon = lon;
		$scope.new_booking.hasPosition = true;
		$scope.new_booking.address_state = "false";
		
		RESTFactory.Get_Address(lat, lon).then(function(address){
			$scope.new_booking.address_state = "true";
			$scope.new_booking.address = address;
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
	 * Funktion um Neue Buchung hinzufügen zu verstecken
	 * @method Hide_AddBooking
	 * @return 
	 */
	function Hide_AddBooking(){
		$scope.new_booking = {};
		$scope.view = "info";
		$scope.booking_selected = "false";
		new Update("ALL", undefined);
	}
	
	
	
	
	/**
	 * Funktion um Details einer Buchung zu laden
	 * @method Load_Details
	 * @param {} input
	 * @return 
	 */
	$scope.Load_Details = function(input){
		new Load_Details(input);
	};
	
	
	/**
	 * Funktion um geänderte Daten zu speichern
	 * @method Safe_New
	 * @return 
	 */
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	/**
	 * Funktion um geänderte Daten nicht zu speicher und abzubrechen 
	 * @method Dismiss_New
	 * @return 
	 */
	$scope.Dismiss_New = function(){
		new Hide_AddBooking();
	};

	
	/**
	 * Funktion um Neue Buchung hinzufügen aufzurufen
	 * @method Show_AddBooking
	 * @return 
	 */
	$scope.Show_AddBooking = function(){
		new Show_AddBooking();
	};
	
	/**
	 * Funktion um Neue Buchung hinzufügen verstecken
	 * @method Hide_AddBooking
	 * @return 
	 */
	$scope.Hide_AddBooking = function(){
		new Hide_AddBooking();
	};
	
	/**
	 * Funktion um nach eingegebenen Wörter in Suchen-Feld zu suchen
	 * @method Enter_Search
	 * @return 
	 */
	$scope.Enter_Search = function(){
		
		var search = $scope.bookingID;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}
	};
	
	
	/**
	 * Init-Funktion für die Seite
	 * @method Init
	 * @return 
	 */
	function Init(){
		new Update();	
	}

	new Init();
	
});
