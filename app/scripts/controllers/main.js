'use strict';

/**
 * @ngdoc function
 * @name webApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webApp
 */

const IP = 'https://api.ecruise.me/v1';

const API_KEY = "AIzaSyBCbY_MjWJ1cDjugF_MBHwnYDWFNJYAa4o&callback=initMap";


application.service('GetCaller', function ($http) {

    this.Get = function (url, body) {
	var get = $http({
	    method: "get",
	    url: url,
	    data: body
	});
	return get;
    };
    this.Get = function(url){
	return $http.get(url);
    };

});

application.service('PostCaller', function ($http) {

    this.Post = function (url, body) {
	var post = $http({
	    method: "post",
	    url: url,
	    data: body
	});
	return post;
    };

});

application.service('PatchCaller', function ($http) {

    this.Patch = function (url, body) {
	var post = $http({
	    method: "patch",
	    url: url,
	    data: body
	});
	return post;
    };

});


application.factory('RESTFactory', function ($http, GetCaller, PostCaller, PatchCaller) {

	return {

	//OTHERS
		GetAddress: function(lat, lon){
			var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
			url += lat + "," + lon + "&key=" + API_KEY;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		
		
		
	//TRIPS
		Trips_Get: function(){
			var url = IP + "/trips";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Trips_Get_TripID: function(id){
			var url = IP + "/trips/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Trips_Get_CarID: function(id){
			var url = IP + "/trips/by-car/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Trips_Post: function(data){
			var url = IP + "/trips";
			var orig = Promise.resolve(PostCaller.Get(url, data));
			return orig;
		},
		
		Trips_Patch: function(id, data){
			var url = IP + "/trips?TripId=" + id;
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		
		
		
		
	//PUBLIC
		Login_Get: function(email, data){
			var url = IP + "/public/login/" + email;
			var orig = Promise.resolve(GetCaller.Get(url, data));
			return orig;
		},
		User_Login: function(email, password){
			var url = IP + "/public/login/" + email;
			var orig = Promise.resolve(PostCaller.Post(url, password));
			return orig;
		},
		User_Register: function(data){
			var url = IP + "/customers";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		
		
	
	//CUSTOMERS
		Customers_Get: function(){
			var url = IP + "/customers";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Customers_Get_CustomerID: function(id){
			var url = IP + "/customers/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Customers_Get_Name: function(name){
			var url = IP + "/customers/by-lastname/" + name;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Customers_Post: function(data){
			var url = IP + "/customers";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		Customers_Patch_Password: function(id, pwd){
			var url = IP + "/customers/" + id + "/password";
			var orig = Promise.resolve(PatchCaller.Patch(url, pwd));
			return orig;
		},
		Customers_Patch_Email: function(id, email){
			var url = IP + "/customers/" + id + "/email";
			var orig = Promise.resolve(PatchCaller.Patch(url, email));
			return orig;
		},
		Customers_Patch_PhoneNr: function(id, phoneNr){
			var url = IP + "/customers/" + id + "/phone-number";
			var orig = Promise.resolve(PatchCaller.Patch(url, phoneNr));
			return orig;
		},
		Customers_Patch_Address: function(id, address){
			var url = IP + "/customers/" + id + "/address";
			var orig = Promise.resolve(PatchCaller.Patch(url, address));
			return orig;
		},
		
		
		
		
	//CARS
		Cars_Get: function(){
			var url = IP + "/cars";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Cars_Get_CarID: function(id){
			var url = IP + "/cars/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Cars_Get_ClosestTo: function(lat, lon){
			var url = IP + "/cars/closest-to/" + lat + "/" + lon;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Cars_Post: function(data){
			var url = IP + "/cars";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		Cars_Patch_ChargingState: function(id, data){
			var url = IP + "/cars/" + id + "/chargingstate";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		Cars_Patch_BookingState: function(id, data){
			var url = IP + "/cars/" + id + "/bookingstate";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		Cars_Patch_Mileage: function(id, data){
			var url = IP + "/cars/" + id + "/mileage";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		Cars_Patch_ChargeLevel: function(id, data){
			var url = IP + "/cars/" + id + "/chargelevel";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		Cars_Patch_Position: function(id, lat, lon){
			var url = IP + "/cars/" + id + "/position/" + lat + "/" + lon;
			var orig = Promise.resolve(PatchCaller.Patch(url, null));
			return orig;
		},
		
		
		
		
	//CHARGING-STATION
		Charging_Stations_Get: function(){
			var url = IP + "/charging-stations";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Charging_Stations_Get_Charging_StationID: function(id){
			var url = IP + "/charging-stations/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Charging_Stations_Get_ClosestTo: function(lat, lon){
			var url = IP + "/charging-stations/closest-to/" + lat + "/" + lon;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Charging_Stations_Post: function(data){
			var url = IP + "/charging-stations";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		
		
	
	//CAR CHARGING STATION
		Car_Charging_Stations_Get: function(){
			var url = IP + "/car-charging-stations";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Charging_Stations_Get_CarID: function(id){
			var url = IP + "/car-charging-stations/by-car/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Charging_Stations_Get_ChargingStationID: function(id){
			var url = IP + "/car-charging-stations/by-charging-station/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Car_Charging_Stations_Post: function(data){
			var url = IP + "/car-charging-stations";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		Car_Charging_Stations_Patch_ChargeEnd: function(id, data){
			var url = IP + "/car-charging-stations/" + id + "/charge-end/";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},
		
	
	
	
	//INVOICES
		Invoices_Get: function(){
			var url = IP + "/invoices";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Invoices_Get_InvoiceID: function(id){
			var url = IP + "/invoices/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Invoices_Get_CustomerID: function(id){
			var url = IP + "/invoices/by-customer/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Invoices_Get_Items: function(id){
			var url = IP + "/invoices/" + id + "/items";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Invoices_Get_Items_ItemID: function(itemID){
			var url = IP + "/invoices/by-invoice-item/" + itemID;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Invoices_Get_InvoiceID_Items_ItemID: function(id, itemID){
			var url = IP + "/invoices/" + id + "/items/" + itemID;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		/*
		Invoices_Post: function(data){
			var url = IP + "/invoices";
			var orig = Promise.resolve(PostCaller.Get(url, data));
			return orig;
		},
		*/
		
		Invoices_Post_Items: function(id, data){
			var url = IP + "/invoices/" + id + "/items";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		Invoices_Patch_Paid: function(id, data){
			var url = IP + "/invoices/" + id + "/paid";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		},

		
		
		
	//BOOKINGS
		Bookings_Get: function(){
			var url = IP + "/bookings";
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Bookings_Get_BookingID: function(id){
			var url = IP + "/bookings/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Bookings_Get_CustomerID: function(id){
			var url = IP + "/bookings/by-customer/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Bookings_Get_TripID: function(id){
			var url = IP + "/bookings/by-trip/" + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Bookings_Get_Date: function(date){
			var url = IP + "/bookings/date/" + date;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Bookings_Post: function(data){
			var url = IP + "/bookings";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
	
	
	
	
	//MAINTENANCES
		Maintances_Get: function(){
			var url = IP + '/maintenances';
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Maintances_Get_MaintenanceID: function(id){
			var url = IP + '/maintenances/' + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Maintances_Post: function(data){
			var url = IP + "/maintenances";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		
		
		
	//CAR MAINTENANCES
		Car_Maintances_Get: function(){
			var url = IP + '/car-maintenances';
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Maintances_Get_CarMaintenanceID: function(id){
			var url = IP + '/car-maintenances/' + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Maintances_Get_MaintenanceID: function(id){
			var url = IP + '/car-maintenances/by-maintenance/' + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Maintances_Get_CarID: function(id){
			var url = IP + '/car-maintenances/by-car/' + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		Car_Maintances_Get_InvoiceItemID: function(id){
			var url = IP + '/car-maintenances/by-invoice-item/' + id;
			var orig = Promise.resolve(GetCaller.Get(url));
			return orig;
		},
		
		Car_Maintances_Post: function(data){
			var url = IP + "/car-maintenances";
			var orig = Promise.resolve(PostCaller.Post(url, data));
			return orig;
		},
		
		Car_Maintances_Patch_CompletedDate: function(id, data){
			var url = IP + "/car-maintenances/" + id + "/completed-date";
			var orig = Promise.resolve(PatchCaller.Patch(url, data));
			return orig;
		}
		
		
		
	};

});



application.factory('Helper', function (RESTFactory, $cookies) {

    return {
	Get_Time: function (input){
	    var d = new Date(input);
	    var time = d.getHours() + ":" + d.getMinutes();
	    return time;
	},
	Get_Date: function (input){
	    var d = new Date(input);
	    var day = d.getDate();
	    var month = d.getMonth() + 1;
	    var year = d.getFullYear();
	    if(month < 10){
		month = "0" + month;
	    }
	    var date = day + "." + month + "." + year;
	    return date;
	},
	Get_Address: function(lat, lon){
	    
	    return new Promise(function(resolve, reject){
		
		RESTFactory.GetAddress(lat, lon).then(function(response){
		    
		    var ret = response.data.results[0].address_components;
		    
		    var address = { };
		    
		    for(var i = 0;i < ret.length; i++){
			for(var j = 0; j < ret[i].types.length; j++){
			    switch(ret[i].types[j]){
			    case "street_number":
				address.number = ret[i].long_name;
				break;
			    case "route":
				address.street = ret[i].long_name;
				break;
			    case "locality":
				address.city = ret[i].long_name;
				break;
			    case "postal_code":
				address.zip = ret[i].long_name;
				break;
			    default:
				break;
			    }
			}
		    }
		    
		    resolve(address);
		    
		    reject("error");
		    
		});
	    });
	    
	},
	Cookie_Set: function (name, value){
	    var text = name + "=" + value;
	    document.cookie = text;
	    return "";
	},
	Cookie_Get: function (name){
	    return $cookies.get(name);
	},
	
	Get_Now: function(){
		
		var now = new Date();
		
		var date = {};
		
		date.date = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
		date.time = now.getHours() + ":" + now.getMinutes();
		date.value = now.getTime();
		date.string = now;
		
		date.date_ele = {};
		date.date_ele.day = now.getDate();
		date.date_ele.month = now.getMonth();
		date.date_ele.year = now.getFullYear();
		
		date.time_ele = {};
		date.time_ele.minutes = now.getMinutes();
		date.time_ele.hours = now.getHours();
		
		return date;
		
	},
	
	Get_Zeit: function(value){
		
		var now = new Date(value);
		
		var date = {};
		
		date.date = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
		date.time = now.getHours() + ":" + now.getMinutes();
		date.value = now.getTime();
		date.string = now;
		
		date.date_ele = {};
		date.date_ele.day = now.getDate();
		date.date_ele.month = now.getMonth();
		date.date_ele.year = now.getFullYear();
		
		date.time_ele = {};
		date.time_ele.minutes = now.getMinutes();
		date.time_ele.hours = now.getHours();
		
		return date;
		
	}
	
    };

});
