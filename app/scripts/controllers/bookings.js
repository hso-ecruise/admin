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
		
		RESTFactory.Bookings_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var in_booking = data[i];
				
				var booking = {};
				
				var ID_STR = in_booking.bookingId;
				
				booking.bookingID = in_booking.bookingId;
				booking.customerID = in_booking.customerId;
				booking.tripID = in_booking.tripId;
				
				
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
		
		currentBooking.available = "true";
		
		if(booking === undefined){
			currentBooking.available = "false";
			$scope.currentBooking = currentBooking;
			return;
		}
		
		
	}
	
	
	
	
	//+++++++++INIT+++++++++++++++++++++++++++++++++++++++++++++++
	
	var Init = function(){
		
		Update();
		
		LoadBookingDetails(undefined);
		
	};
	
	Init();
	
});
