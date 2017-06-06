'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Bookings', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var bookings_all = {};
	
	var marker_Address;
	
	
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
			
		}, function(response){
			alert("Nutzername kann nicht gefunden werden");
		});
		
	}
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		bookings_all = {};
		
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
				
				
				var plannedDate = new Date(in_booking.plannedDate);
				var now = new Date();
				
				if(plannedDate.getTime() - now.getTime() < 0){
					booking.status = "PAST";
					booking.statusText = "In der Vergangeheit";
				}else{
					booking.status = "FUTURE";
					booking.statusText = "In der Zukunft";
				}
				
				bookings_all[ID_STR] = booking;
				$scope.bookings = bookings_all;
				$scope.$apply();
				
				
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
						$scope.$apply();
						
					}, function(response){
						
					});
				
				}
				
				setTimeout(CallCustomer, 500);
				
			});
			
		}, function(response){
			
			$scope.bookings = bookings_all;
			$scope.$apply();
			
		});
		
		
	}
	
	function Load_Details(id){
		
		$scope.booking_selected = "true";
		
		RESTFactory.Bookings_Get_BookingID(id).then(function(response){
			
			var data = response.data;
			
			var booking = {};
			
			booking.bookingID = data.bookingId;
			booking.customerID = data.customerId;
			booking.tripID = data.tripId;
			booking.invoiceItemID = data.invoiceItemId;
			
			var plannedDate = new Date(data.plannedDate);
			var now = new Date();
			
			if(plannedDate.getTime() - now.getTime() < 0){
				booking.status = "PAST";
				booking.statusText = "In der Vergangeheit";
			}else{
				booking.status = "FUTURE";
				booking.statusText = "In der Zukunft";
			}

			booking.tripState = "false";
			booking.invoiceState = "false";
			booking.customerState = "false";
			
			$scope.currentBooking = booking;
			$scope.$apply();
			
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
					$scope.$apply();
					
				}, function(response){
					
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
					$scope.$apply();
					
				}, function(response){
					
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
						
						var start = {};
						start.startDate = data.startDate;
						start.time = Helper.Get_Time(data.startDate);
						start.date = Helper.Get_Date(data.startDate);
						
						var end = {};
						end.endDate = data.endDate;
						end.time = Helper.Get_Time(data.endDate);
						end.date = Helper.Get_Date(data.endDate);
						
						trip.start = start;
						trip.end = end;

						trip.startState = "false";
						trip.endState = "false";


						booking.trip = trip;
						
						booking.tripState = "true";
						$scope.currentBooking = booking;
						$scope.$apply();
						
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
								
								console.log(station);
								
								booking.trip.start.station = station;
								
								booking.trip.startState = "true";
								$scope.currentBooking = booking;
								$scope.$apply();
								
								
								Helper.Get_Address(station.lat, station.lon).then(function(address){
									
									console.log(address);
									
									booking.trip.start.station.address = address;
									
									$scope.currentBooking = booking;
									$scope.$apply();
									
									console.log($scope.currentBooking.trip.start);
									
								}, function(response){
									
								});
								
							}, function(response){
								
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
								$scope.$apply();
							
							
								Helper.Get_Address(station.lat, station.lon).then(function(response){
									
									var address = response;
									address.status = true;
									
									booking.trip.end.station.address = address;
									
									$scope.currentBooking = booking;
									$scope.$apply();
									
								}, function(response){
									
								});
								
							}, function(response){
								
							});
							
						}

					}

				}, function(response){
					
				});
			
			}
			
		});
		
	}
	
	
	
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
		booking.plannedDate = plannedDate;
		
		RESTFactory.Bookings_Post(booking).then(function(response){
			alert("Buchung wurde erfolgreich ausgeführt");
			new Hide_AddBooking();
			setTimeout(Update, 1000);
		}, function(response){
			alert("Buchung fehlgeschlagen");
			new Hide_AddBooking();
			setTimeout(Update, 1000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddBooking();
		
	}
	
	
	
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
		
		new_booking.address_state = "false";
		
		$scope.new_booking = new_booking;
		
		function Init_Map(){
			
			var map = new google.maps.Map(document.getElementById('map_booking'), {
				zoom: 16,
				center: new google.maps.LatLng(49.5, 8.434),
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
		
		setTimeout(Init_Map, 2000);

	}
	
	function PositionSelected(map2, lat, lon){
		
		map2.panTo(new google.maps.LatLng(lat, lon));
		
		$scope.new_booking.lat = lat;
		$scope.new_booking.lon = lon;
		$scope.new_booking.hasPosition = true;
		
		Helper.Get_Address(lat, lon).then(function(address){
			$scope.new_booking.address_state = "true";
			$scope.new_booking.address = address;
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
			$scope.new_booking.address_state = "false";
		});

	}
	
	function Hide_AddBooking(){
		$scope.new_booking = {};
		$scope.view = "info";
		$scope.booking_selected = "false";
		new Update("ALL", undefined);
	}
	
	
	
	
	$scope.Load_Details = function(input){
		new Load_Details(input);
	};
	
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Hide_AddBooking();
	};

	
	$scope.Show_AddBooking = function(){
		new Show_AddBooking();
	};
	
	$scope.Hide_AddBooking = function(){
		new Hide_AddBooking();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.bookingID;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	
	function Init(){
		
		new Update();
		
	}
	
	new Init();
	
});
