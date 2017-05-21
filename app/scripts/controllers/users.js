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
	
	var LoadCustomerDetails = function(id){
		
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
	
	
	var SafeChanges = function(){
		
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
		
		Update();
		
	};
	
	var CancelChanges = function(){
		LoadCustomerDetails($scope.currentCustomer.customerID);
	};
	
	
	
	var SafeNew = function(customer){
		
		var user = {};
		user.firstName = customer.name;
		user.lastName = customer.familyName;
		user.email = customer.email;
		user.password = customer.password;
		
		RESTFactory.User_Register(user).then(function(response){
			
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
			
			alert("Neuer Nutzer wurde angelegt");
			
		}, function(response){
			
			alert("Neuer Nutzer konnte nicht angelegt werden");
			
		});
		
		
	};
	
	
	
	var CancelNew = function(){
		Hide_AddCustomer();
	};
	
	var Show_AddCustomer = function(){
		$scope.view = "add";
		
		var customer = {};
		customer.address = {};
		
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
	
	$scope.LoadCustomerDetails = function(customer){
		LoadCustomerDetails(customer);
	};
	
	$scope.SafeChanges = function(){
		SafeChanges();
	};
	
	$scope.CancelChanges = function(){
		CancelChanges();
	};
	
	$scope.SafeNew = function(){
		var customer = $scope.new_customer;
		SafeNew(customer);
	};
	
	$scope.CancelNew = function(){
		CancelNew();
	};
	
	
	var Init = function(){
		
		Update();
		
	};

	Init();
	
});
