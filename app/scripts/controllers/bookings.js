'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Bookings', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {

	alert("BookingsCtrl");
	
	var bookings_all = {};
	

	

	
	var Update = function(){
		
		$scope.view = "info";
		
		//TODO RESTFactory.Bookings_Get(1).then(function(response){
		RESTFactory.Bookings_Get_CustomerID(1).then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var in_booking = data[i];
				
				var booking = {};
				
				var ID_STR = in_booking.bookingId;
				
				booking.bookingID = in_booking.bookingId;
				booking.customerID = in_booking.customerId;
				booking.tripID = in_booking.tripId;
				booking.invoiceID = in_booking.invoiceId;
				
				
				var plannedDate = new Date(in_booking.plannedDate);
				var now = new Date();
				
				if(plannedDate.getTime() - now.getTime() < 0){
					booking.status = "PAST";
				}else{
					booking.status = "FUTURE";					
				}
				
				
				bookings_all[ID_STR] = booking;
				$scope.bookings = bookings_all;
				$scope.$apply();
				
				
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
			
			
		}, function(response){
			
		});
		
		
	};
	

	var LoadBookingDetails = function(booking){
		
		var currentBooking = {};
		
		if(booking === undefined){
			currentBooking.available = "false";
			$scope.currentBooking = currentBooking;
			return;
		}
		
		currentBooking = booking;
		
		currentBooking.available = "true";
		
		$scope.currentBooking = currentBooking;
		
		//
		
		
		//GET TRIP INFORMATIONS
		RESTFactory.Trips_Get_TripID(booking.tripID).then(function(response){
			
			var data = response.data;
			
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
			
			currentBooking.trip = trip;
			
			$scope.currentBooking = currentBooking;
			$scope.$apply();
			
			
			//GET START STATION AND ADDRESS
			RESTFactory.Charging_Stations_Get_Charging_StationID(trip.startChargingStationID).then(function(response){
				
				var data = response.data;
				
				var station = {};
				
				station.chargingStationID = data.chargingStationId;
				station.slots = data.slots;
				station.slotsOccupied = data.slotsOccupied;
				station.lat = data.latitude;
				station.lon = data.longitude;
				
				currentBooking.trip.start.station = station;
				
				$scope.currentBooking = currentBooking;
				$scope.$apply();
				
				
				Helper.Get_Address(station.lat, station.lon).then(function(address){
					
					currentBooking.trip.start.station.address = address;
					
					$scope.currentBooking = currentBooking;
					$scope.$apply();
					
				}, function(response){
					
				})
				
			}, function(response){
				
			});
			
			
			//GET END STATION AND ADDRESS
			RESTFactory.Charging_Stations_Get_Charging_StationID(trip.endChargingStationID).then(function(response){
				
				var data = response.data;
				
				var station = {};
				
				station.chargingStationID = data.chargingStationId;
				station.slots = data.slots;
				station.slotsOccupied = data.slotsOccupied;
				station.lat = data.latitude;
				station.lon = data.longitude;
				
				currentBooking.trip.end.station = station;
				
				$scope.currentBooking = currentBooking;
				$scope.$apply();
			
			
				Helper.Get_Address(station.lat, station.lon).then(function(response){
					
					var address = response;
					address.status = true;
					
					currentBooking.trip.end.station.address = address;
					
					$scope.currentBooking = currentBooking;
					$scope.$apply();
					
				}, function(response){
					
				});
				
			}, function(response){
				
			});
			
		}, function(response){
			
		});
		
		
		//GET INVOICE INFORMATIONS
		RESTFactory.Invoices_Get_InvoiceID(booking.invoiceID).then(function(response){
			
			var data = response.data;
			
			var invoice = {};
			
			invoice.invoiceID = data.invoiceId;
			invoice.totalAmount = data.totalAmount;
			invoice.paid = data.paid;
			currentBooking.invoice = invoice;
			
			$scope.currentBooking = currentBooking;
			$scope.$apply();
			
		}, function(response){
			
		});
		
		
	}
	
	var Show_AddBooking = function(){
		
		$scope.view = "add";

		var new_booking = {};
		
		new_booking.date = new Date();
		new_booking.date.setSeconds(0);
		new_booking.date.setMilliseconds(0);
		
		new_booking.address_state = "false";
		
		$scope.new_booking = new_booking;
		
		var Init_Map = function(){
			
			var map = new google.maps.Map(document.getElementById('map_booking'), {
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
	
	var Hide_AddBooking = function(){
		$scope.view = "info";
	}
	
	var Booking_Safe = function(){
		
		var booking = {};
		
		var now = new Date();
		now.setHours(now.getHours() + 2);
		
		var plannedDate = new Date();
		plannedDate = $scope.new_booking.date;
		plannedDate.setHours(plannedDate.getHours() + 2);
		
		booking.customerId = $scope.new_booking.customerID;
		booking.bookedPositionLatitude = $scope.new_booking.lat;
		booking.bookedPositionLongitude = $scope.new_booking.lon;
		booking.bookingDate = now;
		booking.plannedDate = plannedDate;
		
		console.log(booking);
		
		RESTFactory.Bookings_Post(booking).then(function(response){
			alert("Buchung wurde erfolgreich ausgeführt");
			Hide_AddBooking();
		}, function(response){
			alert("Buchung fehlgeschlagen");
			Hide_AddBooking();
		});
		
	}
	
	
	
	
	
	$scope.Booking_Safe = function(){
		Booking_Safe();
	}
	
	$scope.Booking_Cancel = function(){
		Hide_AddBooking();
	}
	
	$scope.LoadBookingDetails2 = function(booking){
		LoadBookingDetails(booking);
	}
	
	$scope.Show_AddBooking = function(){
		Show_AddBooking();
	}
	
	$scope.Hide_AddBooking = function(){
		Hide_AddBooking();
	}
	
	//+++++++++INIT+++++++++++++++++++++++++++++++++++++++++++++++
	
	var Init = function(){
		
		Update();
		
		LoadBookingDetails(undefined);
		
	};
	
	Init();
	
});
