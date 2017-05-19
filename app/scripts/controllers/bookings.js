'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Bookings', function ($rootScope, $scope, RESTFactory, Helper) {

	alert("BookingsCtrl");
	
	var bookings_all = {};
	
	
	

	
	var Update = function(){
		
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
	
	$scope.LoadBookingDetails2 = function(booking){
		LoadBookingDetails(booking);
	}
	
	
	//+++++++++INIT+++++++++++++++++++++++++++++++++++++++++++++++
	
	var Init = function(){
		
		Update();
		
		LoadBookingDetails(undefined);
		
	};
	
	Init();
	
});
