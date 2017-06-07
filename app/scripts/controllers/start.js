'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:StartCtrl
 * @description
 * # StartCtrl
 * give some description here
 */
application.controller('Ctrl_Main', function ($rootScope, $scope, Helper, $location, RESTFactory, $mdDialog) {
    
    var inited = false;
    
    /**
     * Init-funktion der Seite Start
     * die Überprüft ob user eingeloggt ist
     * @method Init
     * @return 
     */
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
		
    }
    
    Init();
    
    /**
     * Funktion die den Cookie bei Logout löscht
     * @method Logout
     * @return 
     */
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
	
	/**
	 * Funktion um Login-Dialog anzuzeigen
	 * @method showLogin
	 * @return 
	 */
	$scope.showLogin = function(){
		
		$mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
            '<md-dialog class="login-dialog">'+
            '	<md-dialog-content>' +
			'		<form name="login_Form" ng-submit="Login()">' +
            '			<md-toolbar class="md-hue-2">' +
            '				<div class="md-toolbar-tools">' +
            '					<h2 class="md-flex">Anmelden</h2>' +
            '				</div>' +
            '			</md-toolbar>' +

            '			<md-content flex layout-padding>' +
			
			'				<md-input-container>' +
			'					<input placeholder="E-Mail" type="email" ng-model="login_email" ng-required="true" />' +
			'				</md-input-container>' +
			
			'				<md-input-container>' +
			'					<input placeholder="Passwort" type="password" pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}" title="Passwort muss mindestens eine Zahl und einen kleinen oder großen Buchstaben enthalten und mindestens 8 Zeichen lang sein" ng-model="login_password" ng-required="true" /> ' +
			'				</md-input-container>' +
			
            '			</md-content>' +

            '			<md-content flex layout-padding>' +
			'				<input type="submit" style="position: absolute; left: -9999px; width: 1px; height: 1px;" ng-disabled="login_Form.$invalid" value=""/>' +
            '				<md-button class="md-raised md-primary button-to-right" ng-disabled="login_Form.$invalid" ng-click="Login()"> Login </md-button>' +
            '			</md-content>' +
			'		</form>' +
            '	</md-dialog-content>' +
            '</md-dialog>',

            /**
             * Funktion die eingegebenen in Login-Dialog Daten an die Rest-Schnittstelle schickt, sie überprüft
             * und falls login erfolgreich ist diese in Cookie speichert
             * @method controller DialogController
             * @param {} $scope
             * @param {} $rootScope
             * @param {} $location
             * @param {} $mdDialog
             * @param {} RESTFactory
             * @param {} Helper
             * @return 
             */
            controller: function DialogController($scope, $rootScope, $location, $mdDialog, RESTFactory, Helper){
				

                /**
                 * Description
                 * @method closeDialog
                 * @return 
                 */
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                /**
                 * Description
                 * @method Login
                 * @return 
                 */
                $scope.Login = function(){

					var email = $scope.login_email;
					var password = String($scope.login_password);
					
					var use_pwd = "\"" + password + "\"";
					
					RESTFactory.User_Login(email, use_pwd).then(function(response){
						
						var data = response.data;
						
						$rootScope.token = data.token;
						$rootScope.customerID = data.id;
						
						$rootScope.loggedIN = true;
						$scope.loggedIN = true;
						
						//Save data in cookies
						Helper.Cookie_Set("loggedIN", true);
						Helper.Cookie_Set("token", data.token);
						Helper.Cookie_Set("customerID", data.id);
						Helper.Cookie_Set("password", password);
						
						$rootScope.$apply( function(){$location.path('/vehicles'); } );
						
					}, function(response){
						
						alert("Anmelden fehlgeschlagen");
						
					});
					
					$scope.closeDialog();
					
                };

            }
        });
		
	};
	/*
	$scope.Login = function(){

	
	
		var email = $scope.login_email;
		var password = $scope.login_password;

		password = "\"" + password + "\"";
		
			$scope.loggedIN = true;
		
		RESTFactory.User_Login(email, password).then(function(response){
			
			var data = response.data;
			
			$rootScope.token = data.token;
			$rootScope.customerID = data.id;
			
			$rootScope.loggedIN = true;
			$scope.$apply();
			
			//Save data in cookies
			Helper.Cookie_Set("loggedIN", true);
			Helper.Cookie_Set("token", data.token);
			Helper.Cookie_Set("customerID", data.id);
			
			console.log($scope.loggedIN);
			
			//$rootScope.$apply( function(){$location.path('/vehicles'); } );
			
		}, function(response){
			
			alert("Anmelden fehlgeschlagen");
		
		});
	
    }
	*/
});
