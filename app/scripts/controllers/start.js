'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:StartCtrl
 * @description
 * # StartCtrl
 * give some description here
 */
application.controller('Ctrl_Main', function ($rootScope, $scope, Helper, $location, RESTFactory) {
    
    var inited = false;
    
    function Init(){
	
		if(inited === true){
			return;
		}
		
		var loggedIN = Helper.Cookie_Get("loggedIN");
		var token = Helper.Cookie_Get("token");
		var customerID = Helper.Cookie_Get("customerID");
		
		if(loggedIN !== "true"){
			loggedIN = false;
		}
		
		$rootScope.loggedIN = loggedIN;
		$rootScope.token = token;
		$rootScope.customerID = customerID;
		
		inited = true;
		
		$scope.loggedIN = $rootScope.loggedIN;
		
		if(loggedIN === "true"){
			$location.path('/bookings'); 
//			$rootScope.$apply( function(){$location.path('/bookings'); } );
		}
		
    };
    
    Init();
    
    $scope.Logout = function(){
	
		//DELETE COOKIES
		
		$rootScope.token = undefined;
		$rootScope.customerID = undefined;
		
		$rootScope.loggedIN = false;
		$scope.loggedIN = false;
		
		Helper.Cookie_Set("loggedIN", false);
		Helper.Cookie_Set("token", "");
		Helper.Cookie_Set("customerID", "");
		
		$location.path('/start');
	
    };
	
	$scope.Login = function(){

		var email = $scope.login_email;
		var password = $scope.login_password;

		password = "\"" + password + "\"";
		
		RESTFactory.User_Login(email, password).then(function(response){
			
			var data = response.data;
			
			$rootScope.token = data.token;
			$rootScope.customerID = data.id;
			
			$rootScope.loggedIN = true;
			$scope.loggedIN = "true";
			$scope.$apply();
			
			//Save data in cookies
			Helper.Cookie_Set("loggedIN", true);
			Helper.Cookie_Set("token", data.token);
			Helper.Cookie_Set("customerID", data.id);
			
			alert("Als Admin eingeloggt");
			
			$rootScope.$apply( function(){$location.path('/bookings'); } );
			
		}, function(response){
			
			alert("Anmelden fehlgeschlagen")
		
		});
    
    }
});
