'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * give some description here
 */
application.controller('Ctrl_Users', function ($rootScope, $scope, RESTFactory, Helper) {
	
	$scope.testing = false;

	var customers_all = {};
	var customer_old = {};
	
	/**
	 * Hilfsfunktion für Update mit Name
	 * @method Update_Name
	 * @param {} name
	 * @return 
	 */
	function Update_Name(name){
		new Update("NAME", name);
	}
	
	/**
	 * Hilfsfunktion für Update mit ID
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id){
		new Update("ID", id);
	}
	
	/**
	 * Updatefunktion um Daten der Benutzer aus der Rest-Schnittstelle zu holen und sie anzuzeigen
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(type, value){
		
		customers_all = {};
		$scope.customers = customers_all;

		$scope.customer_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Customers_Get_CustomerID(value);
		}else if(type === "NAME"){
			prom = RESTFactory.Customers_Get_Name(value);
		}else{
			prom = RESTFactory.Customers_Get();
		}
		
		
		
		prom.then(function(response){
			
			var data = [];
			
			if(type === "ID"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			for(var i = 0; i < data.length; i++){
				
				var data_use = data[i];
				
				var customer = {};
				
				var ID_STR = data_use.customerId;
				
				customer.customerID = data_use.customerId;
				customer.name = data_use.firstName;
				customer.familyName = data_use.lastName;
				customer.activated = data_use.activated;
				customer.verified = data_use.verified;
				customer.chipID = data_use.chipCardUid;
				customer.email = data_use.email;
				customer.phoneNr = data_use.phoneNumber;
				
				var address = {};
				address.street = data_use.street;
				address.number = data_use.houseNumber;
				address.city = data_use.city;
				address.zip = data_use.zipCode;
				address.extra = data_use.addressExtraLine;
				address.country = data_use.country;
				
				customer.address = address;
				
				customers_all[ID_STR] = customer;
				$scope.customers = customers_all;
				if ($scope.testing === false) {
					$scope.$apply();
				}
				
			}
			
		});
		
	}
	
	/**
	 * Funktion um Details der Benutzer aus der Rest-Schnittstelle zu laden und sie anzuzeigen
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	function Load_Details(id){
		
		customer_old = {};
		
		new DisabledEditMode();
		
		RESTFactory.Customers_Get_CustomerID(id).then(function(response){
			
			$scope.customer_selected = "true";
			
			var data_use = response.data;
			
			var customer = {};
			
			customer.customerID = data_use.customerId;
			customer.name = data_use.firstName;
			customer.familyName = data_use.lastName;
			customer.activated = data_use.activated;
			customer.verified = data_use.verified;
			customer.chipID = data_use.chipCardUid;
			customer.email = data_use.email;
			customer.phoneNr = data_use.phoneNumber;
			
			var address = {};
			address.street = data_use.street;
			address.number = data_use.houseNumber;
			address.city = data_use.city;
			address.zip = data_use.zipCode;
			address.extra = data_use.addressExtraLine;
			address.country = data_use.country;
			
			if(address.extra === null){
				address.extra = "";
			}
			
			if(customer.chipID === null){
				customer.chipID = "";
			}
			
			customer.address = address;
			customer.invoices = {};
			customer.bookingsDone = {};
			customer.bookingsOpen = {};
			
			$scope.currentCustomer = customer;
			if ($scope.testing === false) {
				$scope.$apply();
			}		
			
			function Load_1() {
				
				//LOAD BOOKING INFOS
				RESTFactory.Bookings_Get_CustomerID(id).then(function (response) {
					
					var data = response.data;

					customer.bookingsOpen = {};
					customer.bookingsDone = {};
					$scope.currentCustomer = customer;
					if ($scope.testing === false) {
						$scope.$apply();
					}

					data.forEach(function (data_use, index) {
						
						var booking = {};
						
						booking.bookingID = data_use.bookingId;
						booking.tripID = data_use.tripId;
						booking.customerID = data_use.customerId;
						booking.invoiceItemID = data_use.invoiceItemId;


						if (booking.tripID === null) {
							booking.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
							$scope.currentCustomer.bookingsOpen[booking.bookingID] = booking;
						} else {

							if (data_use.plannedDate === null) {
								//Spontane Fahrt
								RESTFactory.Trips_Get_TripID(booking.tripID).then(function (response) {
									
									var data = response.data;
									
									if (data.endDate === null) {
										booking.plannedDate = Helper.Get_Zeit_Server(data.startDate);
										$scope.currentCustomer.bookingsOpen[booking.bookingID] = booking;
									} else {
										booking.plannedDate = Helper.Get_Zeit_Server(data.startDate);
										$scope.currentCustomer.bookingsDone[booking.bookingID] = booking;
									}

								}, function (response) {
									booking.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
									$scope.currentCustomer.bookingsDone[booking.bookingID] = booking;
								});

							} else {
								
								booking.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
								$scope.currentCustomer.bookingsDone[booking.bookingID] = booking;
								
							}
						}

					});
					
					
				});

			}
			
			function Load_2() {

				//LOAD INVOICE INFOS
				RESTFactory.Invoices_Get_CustomerID(id).then(function (response) {
				
					var data = response.data;
				
					var invoices = {};
				
					for (var i = 0; i < data.length; i++) {
					
						var data_use = data[i];
					
						var invoice = {};
					
						invoice.invoiceID = data_use.invoiceId;
						invoice.totalAmount = data_use.totalAmount;
						invoice.paid = data_use.paid;
						invoice.paidText = "Nicht bezahlt";
						if (invoice.paid === true) { invoice.paidText = "Bezahlt"; }
					
					
						invoices[invoice.invoiceID] = invoice;
					
					}
				
					customer.invoices = invoices;
					$scope.currentCustomer = customer;
					if ($scope.testing === false) {
						$scope.$apply();
					}
				
				});

			}
			
			setTimeout(Load_1, 100);
			setTimeout(Load_2, 200);
			
			
		}, function (response) {
			
			$scope.customer_selected = "false";
			if ($scope.testing === false) {
				$scope.$apply();
			}

		});
		
	}
	
	
	
	/**
	 * Funktion um Modus zu wächseln in dem Daten geändert werden können einzuschalten
	 * @method EnableEditMode
	 * @return 
	 */
	function EnableEditMode(){
		customer_old = angular.copy($scope.currentCustomer);
		$scope.editDisabled = false;
	}
	
	/**
	 * Funktion um Modus zu wächseln in dem Daten geändert werden können auszuschalten
	 * @method DisabledEditMode
	 * @return 
	 */
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	
	/**
	 * Funktion um geänderte Werte zu speichern und an die Rest-Schnittstelle zu übergeben
	 * @method Safe_Changes
	 * @return 
	 */
	function Safe_Changes(){
		
		var customer = $scope.currentCustomer;
		
		var customerID = customer.customerID;
		
		
		var address = {};
		address.street = customer.address.street;
		address.city = customer.address.city;
		address.houseNumber = customer.address.number;
		address.zipCode = customer.address.zip;
		address.country = customer.address.country;
		address.addressExtraLine = customer.address.extra;
		
		var email = "\"" + customer.email + "\"";
		var phoneNr = "\"" + customer.phoneNr + "\"";
		var verified = "\"" + customer.verified + "\"";
		var chipID = "\"" + customer.chipID + "\"";
		
		if(	customer_old.address.street !== address.street ||
			customer_old.address.city !== address.city ||
			customer_old.address.number !== address.houseNumber ||
			customer_old.address.zip !== address.zipCode ||
			customer_old.address.country !== address.country ||
			customer_old.address.extra !== address.addressExtraLine){
		
			RESTFactory.Customers_Patch_Address(customerID, address).then(function(response){
				alert("Adresse erfolgreich geändert");
			}, function(response){
				alert("Adresse konnte nicht geändert werden");
			});
		}
		
		
		if(email !== "\"" + customer_old.email + "\""){
			RESTFactory.Customers_Patch_Email(customerID, email).then(function(response){
				alert("E-Mail erfolgreich geändert");
			}, function(response){
				alert("E-Mail konnte nicht geändert werden");
			});
		}
		
		
		if("\"" + customer_old.phoneNr + "\"" !== phoneNr){
			RESTFactory.Customers_Patch_PhoneNr(customerID, phoneNr).then(function(response){
				alert("Telefon-Nummer erfolgreich geändert");
			}, function(response){
				alert("Telefon-Nummer konnte nicht geändert werden");
			});
		}
		
		if("\"" + customer_old.verified + "\"" !== verified){
			RESTFactory.Customers_Patch_Verified(customerID, verified).then(function(response){
				alert("Verifizierungsstatus erfolgreich geändert");
			}, function(response){
				alert("Verifizierungsstatus konnte nicht geändert werden");
			});
		}
		
		
		if("\"" + customer_old.chipID + "\"" !== chipID){
			RESTFactory.Customers_Patch_ChipCard(customerID, chipID).then(function(response){
				alert("ChipkartenID erfolgreich geändert");
			}, function(response){
				alert("ChipkartenID konnte nicht geändert werden");
			});
		}
		
		setTimeout(new Update("ALL", undefined), 2000);
		
	}
	
	/**
	 * Funktion um abbrechen zu können
	 * @method Dismiss_Changes
	 * @return 
	 */
	function Dismiss_Changes(){
		new Load_Details($scope.currentCustomer.customerID);
	}
	
	
	
	/**
	 * Funktion um neuen User zu speichern und seine Daten an die Rest-Schnittstelle zu übergeben
	 * @method Safe_New
	 * @return 
	 */
	function Safe_New(){
		
		var customer = $scope.new_customer;
		
		var user = {};
		user.firstName = customer.name;
		user.lastName = customer.familyName;
		user.email = customer.email;
		user.password = customer.password;
		user.street = customer.address.street;
		user.city = customer.address.city;
		user.houseNumber = customer.address.number;
		user.zipCode = customer.address.zip;
		user.country = customer.address.country;
		user.addressExtraLine = customer.address.extra;
		user.phoneNumber = customer.phoneNr;
		
		RESTFactory.User_Register(user).then(function(response){
			
			var customerID = response.data.id;
			
			alert("Neuer Nutzer wurde angelegt");
			new Hide_AddCustomer();
			new Update("ALL", undefined);

		}, function(response){
			
			alert("Neuer Nutzer konnte nicht angelegt werden");
			new Hide_AddCustomer();
			new Update("ALL", undefined);

			
		});
		
		
	}
	
	/**
	 * Funktion um abbrechen zu können
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New(){
		
		new Hide_AddCustomer();
		
	}
	
	
	
	/**
	 * Funktion um Neuen User anlegen anzuzeigen
	 * @method Show_AddCustomer
	 * @return 
	 */
	function Show_AddCustomer(){
		
		var customer = {};
		customer.address = {};
		
		$scope.view = "add";
		$scope.new_customer = customer;
		
	}
	
	/**
	 * Funktion um Neuen User anlegen zu verstecken
	 * @method Hide_AddCustomer
	 * @return 
	 */
	function Hide_AddCustomer(){
		$scope.new_customer = {};
		$scope.view = "info";
		$scope.customer_selected = "false";
		if ($scope.testing === false) {
			$scope.$apply();
		}	
	}
	
	
	
	
	/**
	 * Funktion um in Modus in dem Daten geändert werden können zu wechseln
	 * @method EnableEditMode
	 * @return 
	 */
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	/**
	 * Funktion um Details zu laden
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	
	/**
	 * Funktion um Änderungen zu speichern
	 * @method Safe_Changes
	 * @return 
	 */
	$scope.Safe_Changes = function(){
		new Safe_Changes();
	};
	
	/**
	 * Funktion um Änderungen nicht zu speichern
	 * @method Dismiss_Changes
	 * @return 
	 */
	$scope.Dismiss_Changes = function(){
		new Dismiss_Changes();
	};
	
	
	/**
	 * Funktion um neuen Benutzen zu speichern
	 * @method Safe_New
	 * @return 
	 */
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	/**
	 * Funktion um Neuen Benutzer anlegen abzubrechen
	 * @method Dismiss_New
	 * @return 
	 */
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	
	/**
	 * Funktion um Neuen Benutzer anlegen zu zeigen
	 * @method Show_AddCustomer
	 * @return 
	 */
	$scope.Show_AddCustomer = function(){
		new Show_AddCustomer();
	};
	
	/**
	 * Funktion um Neuen Benutzer anlegen zu verstecken
     * @method Hide_AddCustomer
	 * @return 
	 */
	$scope.Hide_AddCustomer = function(){
		new Hide_AddCustomer();
	};
	
	/**
	 * Funktion um nach den in Suchfeld eingegebenen Wörtern zu suchen
	 * @method Enter_Search
	 * @return 
	 */
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;

		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			if(isNaN(search)){
				new Update_Name(search);			
			}else{
				new Update_ID(search);				
			}
		}
		
	};
	
	
	
	/**
	 * Initfunktion der Seite Users
	 * @method Init
	 * @return 
	 */
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});
