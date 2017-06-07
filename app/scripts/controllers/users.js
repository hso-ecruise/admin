'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * give some description here
 */
application.controller('Ctrl_Users', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var customers_all = {};
	var customer_old = {};
	
	/**
	 * Description
	 * @method Update_Name
	 * @param {} name
	 * @return 
	 */
	function Update_Name(name){
		new Update("NAME", name);
	}
	
	/**
	 * Description
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id){
		new Update("ID", id);
	}
	
	/**
	 * Description
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
				$scope.$apply();
				
			}
			
		}, function(response){
			
		});
		
	}
	
	/**
	 * Description
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
			$scope.$apply();			
			
			//LOAD BOOKING INFOS
			RESTFactory.Bookings_Get_CustomerID(id).then(function(response){
				
				var data = response.data;
				
				var bookingsOpen = {};
				var bookingsDone = {};
				
				for(var i = 0; i < data.length; i++){
					
					var data_use = data[i];
					
					var booking = {};
					
					booking.bookingID = data_use.bookingId;
					booking.tripID = data_use.tripId;
					booking.customerID = data_use.customerId;
					booking.invoiceItemID = data_use.invoiceItemId;
					booking.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
					
					var now = new Date();
					
					if(booking.plannedDate.value - now.getTime() < 0){
						bookingsDone[booking.bookingID] = booking;
					}else{
						bookingsOpen[booking.bookingID] = booking;
					}
					
				}
				
				customer.bookingsOpen = bookingsOpen;
				customer.bookingsDone = bookingsDone;
				$scope.currentCustomer = customer;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			//LOAD INVOICE INFOS
			RESTFactory.Invoices_Get_CustomerID(id).then(function(response){
				
				var data = response.data;
				
				var invoices = {};
				
				for(var i = 0; i < data.length; i++){
					
					var data_use = data[i];
					
					var invoice = {};
					
					invoice.invoiceID = data_use.invoiceId;
					invoice.totalAmount = data_use.totalAmount;
					invoice.paid = data_use.paid;
					invoice.paidText = "Nicht bezahlt";
					if(invoice.paid === true){ invoice.paidText = "Bezahlt"; }
					
					
					invoices[invoice.invoiceID] = invoice;
					
				}
				
				customer.invoices = invoices;
				$scope.currentCustomer = customer;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			
		}, function(response){
			
			$scope.customer_selected = "false";
			$scope.$apply();			
			
		});
		
	}
	
	
	
	/**
	 * Description
	 * @method EnableEditMode
	 * @return 
	 */
	function EnableEditMode(){
		customer_old = angular.copy($scope.currentCustomer);
		$scope.editDisabled = false;
	}
	
	/**
	 * Description
	 * @method DisabledEditMode
	 * @return 
	 */
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	
	/**
	 * Description
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
		
		console.log(customer_old.verified + "  " +  verified);

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
	 * Description
	 * @method Dismiss_Changes
	 * @return 
	 */
	function Dismiss_Changes(){
		new Load_Details($scope.currentCustomer.customerID);
	}
	
	
	
	/**
	 * Description
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
			Hide_AddCustomer();
			new Update("ALL", undefined);

			
			/*
			var address = {};
			address.street = customer.address.street;
			address.city = customer.address.city;
			address.houseNumber = customer.address.number;
			address.zipCode = customer.address.zip;
			address.country = customer.address.country;
			address.addressExtraLine = customer.address.extra;
			
			
			RESTFactory.Customers_Patch_Address(customerID, address).then(function(response){
				alert("Adresse erfolgreich geändert");
			}, function(response){
				alert("Adresse konnte nicht geändert werden");
			});
			
			
			var phoneNr = customer.phoneNr;
			
			RESTFactory.Customers_Patch_PhoneNr(customerID, phoneNr).then(function(response){
				alert("Telefonnummer erfolgreich geändert");
			}, function(response){
				alert("Telefonnummer konnte nicht geändert werden");
			});
			
			
			var verified = customer.verified;
			
			RESTFactory.Customers_Patch_Verified(customerID, verified).then(function(response){
				alert("Verifizierungsstatus erfolgreich geändert");
			}, function(response){
				alert("Verifizierungsstatus konnte nicht geändert werden");
			});
			
			
			var chipID = customer.chipID;
			
			RESTFactory.Customers_Patch_ChipCard(customerID, chipID).then(function(response){
				alert("ChipkartenID erfolgreich geändert");
			}, function(response){
				alert("ChipkartenID konnte nicht geändert werden");
			});
			*/
			
		}, function(response){
			
			alert("Neuer Nutzer konnte nicht angelegt werden");
			Hide_AddCustomer();
			new Update("ALL", undefined);

			
		});
		
		
	}
	
	/**
	 * Description
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New(){
		
		new Hide_AddCustomer();
		
	}
	
	
	
	/**
	 * Description
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
	 * Description
	 * @method Hide_AddCustomer
	 * @return 
	 */
	function Hide_AddCustomer(){
		$scope.new_customer = {};
		$scope.view = "info";
		$scope.customer_selected = "false";
		$scope.$apply();		
	}
	
	
	
	
	/**
	 * Description
	 * @method EnableEditMode
	 * @return 
	 */
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	/**
	 * Description
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	
	/**
	 * Description
	 * @method Safe_Changes
	 * @return 
	 */
	$scope.Safe_Changes = function(){
		new Safe_Changes();
	};
	
	/**
	 * Description
	 * @method Dismiss_Changes
	 * @return 
	 */
	$scope.Dismiss_Changes = function(){
		new Dismiss_Changes();
	};
	
	
	/**
	 * Description
	 * @method Safe_New
	 * @return 
	 */
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	/**
	 * Description
	 * @method Dismiss_New
	 * @return 
	 */
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	
	/**
	 * Description
	 * @method Show_AddCustomer
	 * @return 
	 */
	$scope.Show_AddCustomer = function(){
		new Show_AddCustomer();
	};
	
	/**
	 * Description
	 * @method Hide_AddCustomer
	 * @return 
	 */
	$scope.Hide_AddCustomer = function(){
		new Hide_AddCustomer();
	};
	
	/**
	 * Description
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
	 * Description
	 * @method Init
	 * @return 
	 */
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});
