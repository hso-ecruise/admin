'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:Ctrl_Configuration
 * @description
 * # Ctrl_Configuration
 * give some description here
 */
 
application.controller('Ctrl_Configuration', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	$scope.testing = false;

	var configuration = {};
	

	/**
	 * Function
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(){
		
		RESTFactory.Configuration_Get().then(function (response) {
			
			var data = response.data;

			var config = {};

			config.ID = data.configurationId;
			if (data.allowNewBookings === true) {
				config.statusText = "Buchungen zugelassen";
				config.state = true;
			} else {
				config.statusText = "Buchungen blockiert";
				config.state = false;
			}

			$scope.configuration = config;
			$scope.$apply();

		});
		
	}
	
	/**
	 * Funktion um Konfiguration zu ändern
	 * @method ChangeConfig
	 * @param {} data
	 * @return 
	 */
	function ChangeConfig(data) {
		RESTFactory.Configuration_Patch_AllowNewBookings(data).then(function (response) {
			new Update();
			alert("Konfiguration erfolgreich geändert");
		}, function (response) {
			new Update();
			alert("Konfiguration konnte nicht geändert werden");
		});
	}

	/**
	 * Funktion um Buchungen zu erlauben
	 * @method SetEnable
	 * @return 
	 */
	$scope.SetEnable = function () {
		var data = "true";
		new ChangeConfig(data);
	}

	/**
	 * Funktion um Buchungen zu blockieren
	 * @method SetDisable
	 * @return 
	 */
	$scope.SetDisable = function () {
		var data = "false";
		new ChangeConfig(data);
	}
	
	
	/**
	 * Init-Funktion für die Seite
	 * @method Init
	 * @return 
	 */
	function Init(){
		new Update();	
	}

	new Init();
	
});
