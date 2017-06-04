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
	
	function Update_Name(name){
		new Update("NAME", name);
	}
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		customers_all = {};
		
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
			
			$scope.customers = customers_all;
			$scope.$apply();
			
		});
		
	}
	
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
			
			console.log(customer);
			
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
					booking.plannedDate = data_use.plannedDate;
					
					var date = {};
					date.date = Helper.Get_Date(booking.plannedDate);
					date.time = Helper.Get_Time(booking.plannedDate);
					
					booking.date = date;
					
					var then = new Date(booking.plannedDate);
					
					var now = new Date();
					now.setHours(now.getHours() + 2);
					
					if(then.getTime() - now.getTime() < 0){
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
	
	
	
	function EnableEditMode(){
		customer_old = angular.copy($scope.currentCustomer);
		
		console.log(customer_old);
		$scope.editDisabled = false;
	}
	
	function DisabledEditMode(){
		$scope.editDisabled = true;
	}
	
	
	
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
	
	function Dismiss_Changes(){
		new Load_Details($scope.currentCustomer.customerID);
	}
	
	
	
	function Safe_New(){
		
		var customer = $scope.new_customer;
		
		var user = {};
		user.firstName = customer.name;
		user.lastName = customer.familyName;
		user.email = customer.email;
		user.password = customer.password;
		
		
		RESTFactory.User_Register(user).then(function(response){
			
			var customerID = response.data.id;
			
			var address = {};
			address.street = customer.address.street;
			address.city = customer.address.city;
			address.houseNumber = customer.address.number;
			address.zipCode = customer.address.zip;
			address.country = customer.address.country;
			address.addressExtraLine = customer.address.extra;
			
			alert("Neuer Nutzer wurde angelegt");
			
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
			
			
		}, function(response){
			
			alert("Neuer Nutzer konnte nicht angelegt werden");
			
		});
		
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddCustomer();
		
	}
	
	
	
	function Show_AddCustomer(){
		
		var customer = {};
		customer.address = {};
		
		$scope.view = "add";
		$scope.new_customer = customer;
		
	}
	
	function Hide_AddCustomer(){
		$scope.new_customer = {};
		$scope.view = "info";
		$scope.customer_selected = "false";
		$scope.$apply();		
	}
	
	
	
	
	$scope.EnableEditMode = function(){
		new EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	
	$scope.Safe_Changes = function(){
		new Safe_Changes();
	};
	
	$scope.Dismiss_Changes = function(){
		new Dismiss_Changes();
	};
	
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};
	
	
	$scope.Show_AddCustomer = function(){
		new Show_AddCustomer();
	};
	
	$scope.Hide_AddCustomer = function(){
		new Hide_AddCustomer();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			if(isNaN(search)){
				new Update_Name(search.toLowerCase());				
			}else{
				new Update_ID(search);				
			}
		}
		
	};
	
	
	
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});
