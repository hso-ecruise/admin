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
	
	
	var LoadCustomerDetails = function(input){
		
		$scope.customer_selected = "true";

		//Load all related data
		var customer = input;
		
		
		$scope.currentCustomer = customer;
		
	};
	
	
	
	
	
	$scope.LoadCustomerDetails = function(customer){
		LoadCustomerDetails(customer);
	};
	
	var Init = function(){
		
		Update();
		
	};

	Init();
	
});
