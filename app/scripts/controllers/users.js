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
	
	
	
	var Update = function(){
		
		$scope.customer_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		RESTFactory.Customers_Get().then(function(response){
			
			var data = response.data;
			
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
		
	};
	
	var Load_Details = function(id){
		
		DisabledEditMode();
		
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
			
			customer.address = address;
			
			$scope.currentCustomer = customer;
			$scope.$apply();			
			
			//Load some more data
			
			
		}, function(response){
			
			$scope.customer_selected = "false";
			$scope.$apply();			
			
		});
		
		
	};
	
	
	
	var EnableEditMode = function(){
		$scope.editDisabled = false;
	};
	
	var DisabledEditMode = function(){
		$scope.editDisabled = true;
	};
	
	
	
	var Safe_Changes = function(){
		
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
		
		RESTFactory.Customers_Patch_Address(customerID, address).then(function(response){
			alert("Adresse erfolgreich geändert");
		}, function(response){
			alert("Adresse konnte nicht geändert werden");
		});
		
		RESTFactory.Customers_Patch_Email(customerID, email).then(function(response){
			alert("E-Mail erfolgreich geändert");
		}, function(response){
			alert("E-Mail konnte nicht geändert werden");
		});
		
		RESTFactory.Customers_Patch_PhoneNr(customerID, phoneNr).then(function(response){
			alert("Telefon-Nummer erfolgreich geändert");
		}, function(response){
			alert("Telefon-Nummer konnte nicht geändert werden");
		});
		
		//REST CALL TO CHAGE VERIFIED STATUS
		
		setTimeout(Update(), 2000);
		
	};
	
	var Dismiss_Changes = function(){
		Load_Details($scope.currentCustomer.customerID);
	};
	
	
	
	var Safe_New = function(){
		
		var customer = $scope.new_customer;
		
		var user = {};
		user.firstName = customer.name;
		user.lastName = customer.familyName;
		user.email = customer.email;
		user.password = customer.password;
		
		console.log(user);
		
		RESTFactory.User_Register(user).then(function(response){
			
			var customerID = response.id;
			
			var address = {};
			address.street = customer.address.street;
			address.city = customer.address.city;
			address.houseNumber = customer.address.number;
			address.zipCode = customer.address.zip;
			address.country = customer.address.country;
			address.addressExtraLine = customer.address.extra;
			
			console.log(address);
			
			RESTFactory.Customers_Patch_Address(customerID, address).then(function(response){
				alert("Adresse erfolgreich geändert");
			}, function(response){
				alert("Adresse konnte nicht geändert werden");
			});
			
			var phoneNr = "\"" + customer.phoneNr + "\"";
			
			RESTFactory.Customers_Patch_PhoneNr(customerID, phoneNr).then(function(response){
				alert("Telefonnummer erfolgreich geändert");
			}, function(response){
				alert("Telefonnummer konnte nicht geändert werden");
			});
			
			alert("Neuer Nutzer wurde angelegt");
			
		}, function(response){
			
			alert("Neuer Nutzer konnte nicht angelegt werden");
			
		});
		
		
	};
	
	var Dismiss_New = function(){
		
		Hide_AddCustomer();
		
	};
	
	
	
	var Show_AddCustomer = function(){
		
		var customer = {};
		customer.address = {};
		
		$scope.view = "add";
		$scope.new_customer = customer;
		
	};
	
	var Hide_AddCustomer = function(){
		$scope.new_customer = {};
		$scope.view = "info";
		$scope.customer_selected = "false";
		$scope.$apply();		
	};
	
	
	
	
	$scope.EnableEditMode = function(){
		EnableEditMode();
	};
	
	$scope.Load_Details = function(id){
		Load_Details(id);
	};
	
	
	$scope.Safe_Changes = function(){
		Safe_Changes();
	};
	
	$scope.Dismiss_Changes = function(){
		Dismiss_Changes();
	};
	
	
	$scope.Safe_New = function(){
		Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		Dismiss_New();
	};
	
	
	$scope.Show_AddCustomer = function(){
		Show_AddCustomer();
	}
	
	$scope.Hide_AddCustomer = function(){
		Hide_AddCustomer();
	}
	
	
	var Init = function(){
		
		Update();
		
	};

	Init();
	
});
