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
	
	var Update_UserName = function(name){
		
		//Search for customerName
		var name = name.toLowerCase();
		
		RESTFactory.Customers_Get().then(function(response){
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				if(data[i].lastName.toLowerCase().includes(name)){
					Update("NAME", data[i].customerId);
				}
				
			}
			
		}, function(response){
			alert("Nutzername kann nicht gefunden werden");
		});
		
		Update("NAME", name);
	};
	
	var Update_ID = function(id){
		//Search for bookingID
		Update("ID", id);
	};
	
	var Update = function(type, value){
		
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
			
			var data = response.data;
			
			for(var i = 0; i < data.length; i++){
				
				var in_booking = data[i];
				
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
				
				
				//GET CUSTOMER
				RESTFactory.Customers_Get_CustomerID(booking.customerID).then(function(response){
					
					var custom_data = response.data;
					
					var customer = {};
					
					customer.customerID = custom_data.customerId;
					customer.name = custom_data.firstName;
					customer.familyName = custom_data.lastName;
					
					booking.customer = customer;
					
					console.log(booking);
					
					bookings_all[ID_STR] = booking;
					$scope.bookings = bookings_all;
					$scope.$apply();
					
				}, function(response){
					
				});
				
			}
			
			
		}, function(response){
			
			$scope.bookings = bookings_all;
			$scope.$apply();
			
		});
		
		
	};
	
	var Load_Details = function(id){
		
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
			
			$scope.currentBooking = booking;
			$scope.$apply();
			
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
				
				booking.invoiceState = "false";
				$scope.currentBooking = booking;
				$scope.$apply();
			
			});
			
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
				
				booking.customerState = "false";
				$scope.currentBooking = booking;
				$scope.$apply();
				
			});
			
			//GET TRIP INFOS
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
				
				booking.trip = trip;
				
				booking.tripState = "true";
				$scope.currentBooking = booking;
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
					
					booking.trip.startState = "true";
					$scope.currentBooking = booking;
					$scope.$apply();
					
					
					Helper.Get_Address(station.lat, station.lon).then(function(address){
						
						currentBooking.trip.start.station.address = address;
						
						$scope.currentBooking = currentBooking;
						$scope.$apply();
						
					}, function(response){
						
					})
					
				}, function(response){
					
					booking.trip.startState = "false";
					$scope.currentBooking = booking;
					$scope.$apply();
					
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
					
					booking.trip.end.station = station;
					
					booking.trip.endState = "true";
					$scope.currentBooking = booking;
					$scope.$apply();
				
				
					Helper.Get_Address(station.lat, station.lon).then(function(response){
						
						var address = response;
						address.status = true;
						
						currentBooking.trip.end.station.address = address;
						
						$scope.currentBooking = booking;
						$scope.$apply();
						
					}, function(response){
						
					});
					
				}, function(response){
					
					booking.trip.endState = "false";
					$scope.currentBooking = booking;
					$scope.$apply();
					
				});
				
			}, function(response){
				
				booking.tripState = "false";
				$scope.currentBooking = booking;
				$scope.$apply();
				
			});
			
			
		})
		
	};
	
	
	
	var Safe_New = function(){
		
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
			setTimeout(Update(), 2000);
		}, function(response){
			alert("Buchung fehlgeschlagen");
			Hide_AddBooking();
			setTimeout(Update(), 2000);
		});
		
	}
	
	var Dismiss_New = function(){
		
		Hide_AddBooking();
		
	};
	
	
	
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
					$scope.$apply();
				}, function(response){
					$scope.new_booking.address_state = "false";
				});

			});
		};
		
		setTimeout(Init_Map, 2000);

		
		
	}
	
	var Hide_AddBooking = function(){
		$scope.new_booking = {};
		$scope.view = "info";
		$scope.booking_selected = "false";
		$scope.$apply();
	}
	
	
	
	
	$scope.Load_Details = function(input){
		Load_Details(input);
	}	
	
	
	$scope.Safe_New = function(){
		Safe_New();
	}
	
	$scope.Dismiss_New = function(){
		Hide_AddBooking();
	}

	
	$scope.Show_AddBooking = function(){
		Show_AddBooking();
	}
	
	$scope.Hide_AddBooking = function(){
		Hide_AddBooking();
	}
	
	$scope.Enter_Search = function(){
		
		var search = $scope.bookingID;
		
		Update_ID(search);
		/*
		if(typeof search === 'number'){
			Update_ID(search);
		}else if(typeof search === 'string'){
			Update_UserName(search.toLowerCase());
		}else{
			Update("ALL", undefined);
		}
		*/
	}
	
	
	var Init = function(){
		
		Update();
		
	};
	
	Init();
	
});
