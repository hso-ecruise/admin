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


application.service('GetCaller', function ($http, $rootScope) {

    /**
     * GET Funktion Implementation
     * @method Get
     * @param {} url
     * @param {} body
     * @param {} token
     * @return get
     */
    this.Get = function (url, body, token) {
		
		var myToken = $rootScope.token;
		
		var get = {};
		
		if(token === true){
			
			get = $http({
				method: "get",
				url: url,
				data: body,
				headers: {
					'access_token': myToken
				}
			});
		}else{
			get = $http({
				method: "get",
				url: url,
				data: body
			});
		}
		
		return get;
    };
	/**
	 * GETShort Funktion Implementation
	 * @method GetShort
	 * @param {} url
	 * @param {} token
	 * @return get
	 */
	this.GetShort = function (url, token) {
		
		var myToken = $rootScope.token;
		
		var get = {};
		
		if(token === true){
			
			get = $http({
				method: "get",
				url: url,
				headers: {
					'access_token': myToken
				}
			});
		}else{
			get = $http({
				method: "get",
				url: url
			});
		}
		
		return get;
    };
});

application.service('PostCaller', function ($http, $rootScope) {

    /**
     * POST Funktion Implementation
     * @method Post
     * @param {} url
     * @param {} body
     * @param {} token
     * @return post
     */
    this.Post = function (url, body, token) {
		
		var post = {};
		
		if(token === true){
			post = $http({
				method: "post",
				url: url,
				data: body,
				headers: {
					'access_token': $rootScope.token
				}
			});
		}else{
			post = $http({
				method: "post",
				url: url,
				data: body
			});			
		}
		
		return post;
		
    };

});

application.service('PatchCaller', function ($http, $rootScope) {

    /**
     * PATCH Funktion Implementation
     * @method Patch
     * @param {} url
     * @param {} body
     * @param {} token
     * @return patch
     */
    this.Patch = function (url, body, token) {
		
		var patch = {};
		
		if(token === true){
			patch = $http({
				method: "patch",
				url: url,
				data: body,
				headers: {
					'access_token': $rootScope.token
				}
			});
		}else{
			patch = $http({
				method: "patch",
				url: url,
				data: body
			});
		}
		
		return patch;
		
    };

});


application.factory('RESTFactory', function ($http, GetCaller, PostCaller, PatchCaller) {

	return {

	//OTHERS
		/**
		 * GET Funktion für Adresse durch übergabe von lat lon
		 * @method GetAddress
		 * @param {} lat
		 * @param {} lon
		 * @return orig
		 */
		GetAddress: function(lat, lon){
			var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
			url += lat + "," + lon + "&key=" + API_KEY;
			var orig = Promise.resolve(GetCaller.Get(url, null, false));
			return orig;
		},
		
		
		
		
	//TRIPS
		/**
		 * GET Funktion für Trips
		 * @method Trips_Get
		 * @return orig
		 */
		Trips_Get: function(){
			var url = IP + "/trips";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für TripsID
		 * @method Trips_Get_TripID
		 * @param {} id
		 * @return orig
		 */
		Trips_Get_TripID: function(id){
			var url = IP + "/trips/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Trips by Auto ID
		 * @method Trips_Get_CarID
		 * @param {} id
		 * @return orig
		 */
		Trips_Get_CarID: function(id){
			var url = IP + "/trips/by-car/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Trips
		 * @method Trips_Post
		 * @param {} data
		 * @return orig
		 */
		Trips_Post: function(data){
			var url = IP + "/trips";
			var orig = Promise.resolve(PostCaller.Get(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für TripsID
		 * @method Trips_Patch
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Trips_Patch: function(id, data){
			var url = IP + "/trips?TripId=" + id;
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		
		
		
		
	//PUBLIC
		/**
		 * GET Funktion für Login Email
		 * @method Login_Get
		 * @param {} email
		 * @param {} data
		 * @return orig
		 */
		Login_Get: function(email, data){
			var url = IP + "/public/login/" + email;
			var orig = Promise.resolve(GetCaller.Get(url, data, false));
			return orig;
		},
		/**
		 * GET Funktion für Login Passwort
		 * @method User_Login
		 * @param {} email
		 * @param {} password
		 * @return orig
		 */
		User_Login: function(email, password){
			var url = IP + "/public/login/" + email;
			var orig = Promise.resolve(PostCaller.Post(url, password, false));
			return orig;
		},
		/**
		 * POST Funktion für Registrieren
		 * @method User_Register
		 * @param {} data
		 * @return orig
		 */
		User_Register: function(data){
			var url = IP + "/public/register";
			var orig = Promise.resolve(PostCaller.Post(url, data, false));
			return orig;
		},
		
		
		
	
	//CUSTOMERS
		/**
		 * GET Funktion für Customers
		 * @method Customers_Get
		 * @return orig
		 */
		Customers_Get: function(){
			var url = IP + "/customers";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für CustomersID
		 * @method Customers_Get_CustomerID
		 * @param {} id
		 * @return orig
		 */
		Customers_Get_CustomerID: function(id){
			var url = IP + "/customers/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Customer by Lastname
		 * @method Customers_Get_Name
		 * @param {} name
		 * @return orig
		 */
		Customers_Get_Name: function(name){
			var url = IP + "/customers/by-lastname/" + name;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Registrieren
		 * @method Customers_Post
		 * @param {} data
		 * @return orig
		 */
		Customers_Post: function(data){
			var url = IP + "/public/register";		// "/customers";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für CustomerID Password
		 * @method Customers_Patch_Password
		 * @param {} id
		 * @param {} pwd
		 * @return orig
		 */
		Customers_Patch_Password: function(id, pwd){
			var url = IP + "/customers/" + id + "/password";
			var orig = Promise.resolve(PatchCaller.Patch(url, pwd, true));
			return orig;
		},
		/**
		 * PATCH Funktion für CustomerID Email
		 * @method Customers_Patch_Email
		 * @param {} id
		 * @param {} email
		 * @return orig
		 */
		Customers_Patch_Email: function(id, email){
			var url = IP + "/customers/" + id + "/email";
			var orig = Promise.resolve(PatchCaller.Patch(url, email, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Telefonnummer
		 * @method Customers_Patch_PhoneNr
		 * @param {} id
		 * @param {} phoneNr
		 * @return orig
		 */
		Customers_Patch_PhoneNr: function(id, phoneNr){
			var url = IP + "/customers/" + id + "/phone-number";
			var orig = Promise.resolve(PatchCaller.Patch(url, phoneNr, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Adresse
		 * @method Customers_Patch_Address
		 * @param {} id
		 * @param {} address
		 * @return orig
		 */
		Customers_Patch_Address: function(id, address){
			var url = IP + "/customers/" + id + "/address";
			var orig = Promise.resolve(PatchCaller.Patch(url, address, true));
			return orig;
		},
		/**
		 * PATCH Funktion für ChipCard
		 * @method Customers_Patch_ChipCard
		 * @param {} id
		 * @param {} chipID
		 * @return orig
		 */
		Customers_Patch_ChipCard: function(id, chipID){
			var url = IP + "/customers/" + id + "/chipcarduid";
			var orig = Promise.resolve(PatchCaller.Patch(url, chipID, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Verified
		 * @method Customers_Patch_Verified
		 * @param {} id
		 * @param {} verified
		 * @return orig
		 */
		Customers_Patch_Verified: function(id, verified){
			var url = IP + "/customers/" + id + "/verified";
			var orig = Promise.resolve(PatchCaller.Patch(url, verified, true));
			return orig;
		},
		
		
		
	//CARS
		/**
		 * GET Funktion für Autos
		 * @method Cars_Get
		 * @return orig
		 */
		Cars_Get: function(){
			var url = IP + "/cars";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für CarID
		 * @method Cars_Get_CarID
		 * @param {} id
		 * @return orig
		 */
		Cars_Get_CarID: function(id){
			var url = IP + "/cars/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Autos in der Nähe von lat lon
		 * @method Cars_Get_ClosestTo
		 * @param {} lat
		 * @param {} lon
		 * @return orig
		 */
		Cars_Get_ClosestTo: function(lat, lon){
			var url = IP + "/cars/closest-to/" + lat + "/" + lon;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Autoladestatus
		 * @method Cars_Get_ChargeLevelPerMinute
		 * @return orig
		 */
		Cars_Get_ChargeLevelPerMinute: function(){
			var url = IP + "/cars/charge-level-per-minute";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Autos
		 * @method Cars_Post
		 * @param {} data
		 * @return orig
		 */
		Cars_Post: function(data){
			var url = IP + "/cars";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für Autoladestatus
		 * @method Cars_Patch_ChargingState
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Cars_Patch_ChargingState: function(id, data){
			var url = IP + "/cars/" + id + "/chargingstate";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Autobuchungsstatus
		 * @method Cars_Patch_BookingState
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Cars_Patch_BookingState: function(id, data){
			var url = IP + "/cars/" + id + "/bookingstate";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Autokilometerstand
		 * @method Cars_Patch_Mileage
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Cars_Patch_Mileage: function(id, data){
			var url = IP + "/cars/" + id + "/mileage";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Autoladeladungstatus
		 * @method Cars_Patch_ChargeLevel
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Cars_Patch_ChargeLevel: function(id, data){
			var url = IP + "/cars/" + id + "/chargelevel";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		/**
		 * PATCH Funktion für Autoposition
		 * @method Cars_Patch_Position
		 * @param {} id
		 * @param {} lat
		 * @param {} lon
		 * @return orig
		 */
		Cars_Patch_Position: function(id, lat, lon){
			var url = IP + "/cars/" + id + "/position/" + lat + "/" + lon;
			var orig = Promise.resolve(PatchCaller.Patch(url, null));
			return orig;
		},
		
		
		
		
	//CHARGING-STATION
		/**
		 * GET Funktion für Ladesäulen
		 * @method Charging_Stations_Get
		 * @return orig
		 */
		Charging_Stations_Get: function(){
			var url = IP + "/charging-stations";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Ladesäulen ID
		 * @method Charging_Stations_Get_Charging_StationID
		 * @param {} id
		 * @return orig
		 */
		Charging_Stations_Get_Charging_StationID: function(id){
			var url = IP + "/charging-stations/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Ladesäulen in der Nähe von lat lon
		 * @method Charging_Stations_Get_ClosestTo
		 * @param {} lat
		 * @param {} lon
		 * @return orig
		 */
		Charging_Stations_Get_ClosestTo: function(lat, lon){
			var url = IP + "/charging-stations/closest-to/" + lat + "/" + lon;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Ladesäulen
		 * @method Charging_Stations_Post
		 * @param {} data
		 * @return orig
		 */
		Charging_Stations_Post: function(data){
			var url = IP + "/charging-stations";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		
		
	
	//CAR CHARGING STATION
		/**
		 * GET Funktion für Autoladestationen
		 * @method Car_Charging_Stations_Get
		 * @return orig
		 */
		Car_Charging_Stations_Get: function(){
			var url = IP + "/car-charging-stations";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Autoladestationen by CarID
		 * @method Car_Charging_Stations_Get_CarID
		 * @param {} id
		 * @return orig
		 */
		Car_Charging_Stations_Get_CarID: function(id){
			var url = IP + "/car-charging-stations/by-car/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Autoladestationen sortiert nach Ladesäulenstation
		 * @method Car_Charging_Stations_Get_ChargingStationID
		 * @param {} id
		 * @return orig
		 */
		Car_Charging_Stations_Get_ChargingStationID: function(id){
			var url = IP + "/car-charging-stations/by-charging-station/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Autoladestationen
		 * @method Car_Charging_Stations_Post
		 * @param {} data
		 * @return orig
		 */
		Car_Charging_Stations_Post: function(data){
			var url = IP + "/car-charging-stations";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für Autoladestationen 
		 * @method Car_Charging_Stations_Patch_ChargeEnd
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Car_Charging_Stations_Patch_ChargeEnd: function(id, data){
			var url = IP + "/car-charging-stations/" + id + "/charge-end/";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		
	
	
	
	//INVOICES
		/**
		 * GET Funktion für Invoices
		 * @method Invoices_Get
		 * @return orig
		 */
		Invoices_Get: function(){
			var url = IP + "/invoices";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für InvoiceID
		 * @method Invoices_Get_InvoiceID
		 * @param {} id
		 * @return orig
		 */
		Invoices_Get_InvoiceID: function(id){
			var url = IP + "/invoices/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Invoices CustomerID
		 * @method Invoices_Get_CustomerID
		 * @param {} id
		 * @return orig
		 */
		Invoices_Get_CustomerID: function(id){
			var url = IP + "/invoices/by-customer/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für InvoiceID Items
		 * @method Invoices_Get_Items
		 * @param {} id
		 * @return orig
		 */
		Invoices_Get_Items: function(id){
			var url = IP + "/invoices/" + id + "/items";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Invoices ItemID
		 * @method Invoices_Get_Items_ItemID
		 * @param {} itemID
		 * @return orig
		 */
		Invoices_Get_Items_ItemID: function(itemID){
			var url = IP + "/invoices/by-invoice-item/" + itemID;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für InvoicesID ItemID
		 * @method Invoices_Get_InvoiceID_Items_ItemID
		 * @param {} id
		 * @param {} itemID
		 * @return orig
		 */
		Invoices_Get_InvoiceID_Items_ItemID: function(id, itemID){
			var url = IP + "/invoices/" + id + "/items/" + itemID;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für InvoiceID Items
		 * @method Invoices_Post_Items
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Invoices_Post_Items: function(id, data){
			var url = IP + "/invoices/" + id + "/items";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für InvoiceID bezahlt
		 * @method Invoices_Patch_Paid
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Invoices_Patch_Paid: function(id, data){
			var url = IP + "/invoices/" + id + "/paid";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},

		
		
		
	//BOOKINGS
		/**
		 * GET Funktion für Bookings
		 * @method Bookings_Get
		 * @return orig
		 */
		Bookings_Get: function(){
			var url = IP + "/bookings";
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für BookingID
		 * @method Bookings_Get_BookingID
		 * @param {} id
		 * @return orig
		 */
		Bookings_Get_BookingID: function(id){
			var url = IP + "/bookings/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Booking CustomerID
		 * @method Bookings_Get_CustomerID
		 * @param {} id
		 * @return orig
		 */
		Bookings_Get_CustomerID: function(id){
			var url = IP + "/bookings/by-customer/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Booking TripID
		 * @method Bookings_Get_TripID
		 * @param {} id
		 * @return orig
		 */
		Bookings_Get_TripID: function(id){
			var url = IP + "/bookings/by-trip/" + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Booking Date
		 * @method Bookings_Get_Date
		 * @param {} date
		 * @return orig
		 */
		Bookings_Get_Date: function(date){
			var url = IP + "/bookings/date/" + date;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Booking
		 * @method Bookings_Post
		 * @param {} data
		 * @return orig
		 */
		Bookings_Post: function(data){
			var url = IP + "/bookings";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
	
	
	
	
	//MAINTENANCES
		/**
		 * GET Funktion für Maintenances
		 * @method Maintances_Get
		 * @return orig
		 */
		Maintances_Get: function(){
			var url = IP + '/maintenances';
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für MaintenancesID
		 * @method Maintances_Get_MaintenanceID
		 * @param {} id
		 * @return orig
		 */
		Maintances_Get_MaintenanceID: function(id){
			var url = IP + '/maintenances/' + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Maintenances
		 * @method Maintances_Post
		 * @param {} data
		 * @return orig
		 */
		Maintances_Post: function(data){
			var url = IP + "/maintenances";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		
		
		
	//CAR MAINTENANCES
		/**
		 * GET Funktion für Car-Maintenances
		 * @method Car_Maintances_Get
		 * @return orig
		 */
		Car_Maintances_Get: function(){
			var url = IP + '/car-maintenances';
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Car-MaintenancesID
		 * @method Car_Maintances_Get_CarMaintenanceID
		 * @param {} id
		 * @return orig
		 */
		Car_Maintances_Get_CarMaintenanceID: function(id){
			var url = IP + '/car-maintenances/' + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Car-Maintenances MaintenancesID
		 * @method Car_Maintances_Get_MaintenanceID
		 * @param {} id
		 * @return orig
		 */
		Car_Maintances_Get_MaintenanceID: function(id){
			var url = IP + '/car-maintenances/by-maintenance/' + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Car-Maintenances CarID
		 * @method Car_Maintances_Get_CarID
		 * @param {} id
		 * @return orig
		 */
		Car_Maintances_Get_CarID: function(id){
			var url = IP + '/car-maintenances/by-car/' + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Car-Maintenances InvoiceItemID
		 * @method Car_Maintances_Get_InvoiceItemID
		 * @param {} id
		 * @return orig
		 */
		Car_Maintances_Get_InvoiceItemID: function(id){
			var url = IP + '/car-maintenances/by-invoice-item/' + id;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		
		/**
		 * POST Funktion für Car-Maintenances
		 * @method Car_Maintances_Post
		 * @param {} data
		 * @return orig
		 */
		Car_Maintances_Post: function(data){
			var url = IP + "/car-maintenances";
			var orig = Promise.resolve(PostCaller.Post(url, data, true));
			return orig;
		},
		
		/**
		 * PATCH Funktion für Car-MaintenancesID Completed-Date
		 * @method Car_Maintances_Patch_CompletedDate
		 * @param {} id
		 * @param {} data
		 * @return orig
		 */
		Car_Maintances_Patch_CompletedDate: function(id, data){
			var url = IP + "/car-maintenances/" + id + "/completed-date";
			var orig = Promise.resolve(PatchCaller.Patch(url, data, true));
			return orig;
		},
		
	//STATISTICS
		/**
		 * GET Funktion für Statistik
		 * @method Statistics_Get
		 * @return orig
		 */
		Statistics_Get: function(){
			var url = IP + '/statistics';
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		},
		/**
		 * GET Funktion für Statistik Datum
		 * @method Statistics_Get_ByDate
		 * @param {} date
		 * @return orig
		 */
		Statistics_Get_ByDate: function(date){
			var url = IP + '/statistics/' + date;
			var orig = Promise.resolve(GetCaller.GetShort(url, true));
			return orig;
		}
		
		
		
	};

});



application.factory('Helper', function (RESTFactory, $cookies) {

    return {
	/**
	 * Funktion um Uhrzeit als String zu kriegen
	 * @method Get_Time
	 * @param {} input
	 * @return time
	 */
	Get_Time: function (input){
	    var d = new Date(input);
	    var time = d.getHours() + ":" + d.getMinutes();
		if(d.getMinutes() < 10){
			time = d.getHours() + ":0" + d.getMinutes();
		}
	    return time;
	},
	/**
	 * Funktion um Datum als String zu kriegen
	 * @method Get_Date
	 * @param {} input
	 * @return date
	 */
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
	/**
	 * Funktion um Adresse als String zu kriegen
	 * @method Get_Address
	 * @param {} lat
	 * @param {} lon
	 * @return NewExpression
	 */
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
	/**
	 * Funktion um Cookie zu setzen
	 * @method Cookie_Set
	 * @param {} name
	 * @param {} value
	 * @return Literal
	 */
	Cookie_Set: function (name, value){
	    var text = name + "=" + value;
	    document.cookie = text;
	    return "";
	},
	/**
	 * Funktion um Cookie zu kriegen
	 * @method Cookie_Get
	 * @param {} name
	 * @return CallExpression
	 */
	Cookie_Get: function (name){
	    return $cookies.get(name);
	},
	
	/**
	 * Funktion um das aktuelle Datum und Uhrzeit zu kriegen
	 * @method Get_Now
	 * @return date
	 */
	Get_Now: function(){
		
		var now = new Date();
		
		var date = {};
		
		date.date = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
		date.time = now.getHours() + ":" + now.getMinutes();
		if(now.getMinutes() < 10){
			date.time = now.getHours() + ":0" + now.getMinutes();
		}
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
	
	/**
	 * Funktion um das aktuelle Datum und Uhrzeit zu kriegen
	 * @method Get_Zeit
	 * @param {} value
	 * @return date
	 */
	Get_Zeit: function(value){
		
		var now = new Date(value);
		
		var date = {};
		
		date.date = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
		date.time = now.getHours() + ":" + now.getMinutes();
		if(now.getMinutes() < 10){
			date.time = now.getHours() + ":0" + now.getMinutes();
		}
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

	/**
	 * Funktion um das aktuelle Datum und Uhrzeit von Server zu kriegen
	 * @method Get_Zeit_Server
	 * @param {} value
	 * @return date
	 */
	Get_Zeit_Server: function(value){
		
		var date = {};
		if(value === null){
			date.state = "false";
			return date;
		}
		
		value += "Z";

		var now = new Date(value);

		date.state = true;
		date.date = now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear();
		date.time = now.getHours() + ":" + now.getMinutes();
		if(now.getMinutes() < 10){
			date.time = now.getHours() + ":0" + now.getMinutes();
		}
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
