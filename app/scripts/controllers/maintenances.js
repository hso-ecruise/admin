'use strict';


/**
 * @ngdoc function
 * @name adminApp.controller:Ctrl_Add_CarMaintenance
 * @description
 * # Ctrl_Add_CarMaintenance
 * Controller of the adminApp
 */
application.controller('Ctrl_Add_CarMaintenance', function ($rootScope, $scope, $mdDialog, RESTFactory, Helper, $location) {

	$scope.testing = false;

	$scope.maintenanceID = $rootScope.add_car_maintenance_maintenanceID;

	
	function Init() {
		var item = {};
		item.maintenanceID = $scope.maintenanceID;
		item.carID = 0;
		item.plannedDate = new Date();
		item.minDate = new Date();
		$scope.item = item;
	}

	new Init();

	/**
    * Description
    * @method closeDialog
    * @return 
    */
	$scope.closeDialog = function () {
		$mdDialog.hide();
	};



	/**
	 * Funktion Dialog zu schliessen
	 * @method closeDialog
	 * @return 
	 */
	$scope.closeDialog = function () {
		$mdDialog.hide();
	};

	/**
	 * Funktion um in Dialog eingegebenen Daten zu speichern
	 * @method Save
	 * @return 
	 */
	$scope.Save = function () {

		var item = $scope.item;

		var data = {};
		data.carId = item.carID;
		data.maintenanceId = item.maintenanceID;
		data.plannedDate = item.plannedDate.toUTCString();


		//WORKAROUNG ZUM UPDATEN NOCH ERSTELLEN

		RESTFactory.Car_Maintances_Post(data).then(function (response) {
			alert("Element erfolgreich hinzugefügt");
			//new Update("ALL", undefined);
		}, function (response) {
			alert("Element hinzufügen fehlgeschlagen");
			//new Update("ALL", undefined);
		});

		$scope.closeDialog();

	};


});


/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Maintenances', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	$scope.testing = false;

	var maintenances_all = {};
	
	
	var MAINTENANCE_TYPES = {
		0: {
			text: "Spontan",
			be: "spontaneously",
			id: 0
		},
		1: {
			text: "Kilometerstand",
			be: "atMileage",
			id: 1
		},
		2: {
			text: "Datum",
			be: "atDate",
			id: 2
		}
	};
	
	
	/**
	 * Hilfsfunktion um mit ID zu aktualisieren
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id){
		new Update("ID", id);
	}
	
	/**
	 * Funktion um Daten aus der Rest-Schnittstelle zu holen
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(type, value){
		
		maintenances_all = {};
		$scope.maintenances = maintenances_all;
		
		$scope.maintenance_selected = "false";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Maintances_Get_MaintenanceID(value);
		}else{
			prom = RESTFactory.Maintances_Get();
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
				var maintenance = {};
				var ID_STR = data_use.maintenanceId;
				maintenance.maintenanceID = data_use.maintenanceId;
				maintenance.state = -1;
				
				if(data_use.spontaneously === true){
					maintenance.spontan = data_use.spontaneously;
					maintenance.state = 0;
				}else if(data_use.atDate !== null){
					maintenance.atDate = data_use.atDate;
					maintenance.date = Helper.Get_Zeit_Server(data_use.atDate);
					maintenance.state = 2;
				}else if(data_use.atMileage !== null){
					maintenance.atMileage = data_use.atMileage;
					maintenance.state = 1;
				}
				
				maintenance.stateObj = MAINTENANCE_TYPES[maintenance.state];
				
				maintenances_all[ID_STR] = maintenance;
				
			}
			$scope.maintenances = maintenances_all;
			if ($scope.testing === false) {
				$scope.$apply();
			}

		});
		
		
	}
	
	/**
	 * Funktion um Details aus der Rest-Schnittstelle zu holen
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
	function Load_Details(id){
		
		$scope.maintenance_selected = "true";
		
		RESTFactory.Maintances_Get_MaintenanceID(id).then(function(response){
			
			var data_use = response.data;
			
			var maintenance = {};
			
			maintenance.maintenanceID = data_use.maintenanceId;
			
			maintenance.state = -1;
			if(data_use.spontaneously === true){
				maintenance.spontan = data_use.spontaneously;
				maintenance.state = 0;
			}else if(data_use.atDate !== null){
				maintenance.atDate = data_use.atDate;
				maintenance.date = Helper.Get_Zeit_Server(data_use.atDate);
				maintenance.state = 2;
			}else if(data_use.atMileage !== null){
				maintenance.atMileage = data_use.atMileage;
				maintenance.state = 1;
			}
			
			maintenance.stateObj = MAINTENANCE_TYPES[maintenance.state];
			
			
			maintenance.car_maintenance_state = "false";
			
			$scope.currentMaintenance = maintenance;
			if ($scope.testing === false) {
				$scope.$apply();
			}
			
			//GET CAR MAINTENCE
			RESTFactory.Car_Maintances_Get_MaintenanceID(maintenance.maintenanceID).then(function(response){
				
				maintenance.car_maintenance_state = "true";
				maintenance.car_maintenance = {};
				
				var data = response.data;
				
				if(data.length > 0){
				
					data.forEach(function(data_use, index){
						
						var car_maintenance = {};
						
						var ID_STR = data_use.carMaintenanceId;
						
						car_maintenance.carMaintenanceID = data_use.carMaintenanceId;
						car_maintenance.carID = data_use.carId;
						car_maintenance.maintenanceID = data_use.maintenanceId;
						car_maintenance.invoiceItemID = data_use.invoiceItemId;
						car_maintenance.plannedDate = Helper.Get_Zeit_Server(data_use.plannedDate);
						car_maintenance.endState = false;
						car_maintenance.endDate = new Date();
						car_maintenance.minEndDate = Helper.Get_Zeit_Server(data_use.plannedDate).date;
						car_maintenance.maxEndDate = Helper.Get_Zeit(new Date()).date;
						
						if(data_use.completedDate !== null){
							car_maintenance.endState = true;
							car_maintenance.completedDate = Helper.Get_Zeit_Server(data_use.completedDate);
						}
						
						car_maintenance.text = "Letzte Wartung";
						
						var now = new Date();
						
						if(now.getTime() - car_maintenance.plannedDate.value > 0){
							car_maintenance.text = "Nächste Wartung";
						}
						
						car_maintenance.invoice_state = "false";
						
						maintenance.car_maintenance[ID_STR] = car_maintenance;
						
						$scope.currentMaintenance = maintenance;
						if ($scope.testing === false) {
							$scope.$apply();
						}
						
						if(car_maintenance.invoiceItemID !== null && car_maintenance.invoiceItemID !== undefined){
						
							//GET INVOICE INFOS
							RESTFactory.Invoices_Get_Items_ItemID(car_maintenance.invoiceItemID).then(function(response){
							
								car_maintenance.invoice_state = "true";
							
								var data = response.data;
								
								var invoice = {};
								
								invoice.invoiceID = data.invoiceId;
								invoice.customerId = data.customerID;
								invoice.totalAmount = data.totalAmount;
								invoice.paid = data.paid;
								invoice.paidText = "Rechnung offen";
								if(invoice.paid === "true"){
									invoice.paidText = "Rechnung bezahlt";
								}
								
								car_maintenance.invoice = invoice;
								
								maintenance.car_maintenance[ID_STR] = car_maintenance;
								
								$scope.currentMaintenance = maintenance;
								if ($scope.testing === false) {
									$scope.$apply();
								}
								
							});
						
						}
						
					});
				
				}
				
				
			});
			
		
		});
		
	}
	
	
	
	/**
	 * Funktion um geänderte Daten zu speichern und diese an die Rest-Schnittstelle zu übergeben
	 * @method Safe_New
	 * @return 
	 */
	function Safe_New(){
		
		var maintenance = {};
		
		if($scope.new_maintenance.stateObj.id === 0){
			maintenance.spontaneously = true;
			maintenance.atMileage = null;
			maintenance.atDate = null;
		}else if($scope.new_maintenance.stateObj.id === 1){
			maintenance.spontaneously = false;
			maintenance.atMileage = $scope.new_maintenance.atMileage;
			maintenance.atDate = null;
		}else if($scope.new_maintenance.stateObj.id === 0){
			maintenance.spontaneously = false;
			maintenance.atMileage = null;
			maintenance.atDate = $scope.new_maintenance.date;
		}

		
		RESTFactory.Maintances_Post(maintenance).then(function(response){
			alert("Instandhaltung wurde erfolgreich hinzugefügt");
			new Hide_AddMaintenance();
			new Update("ALL", undefined);
		}, function(response){
			alert("Instandhaltung hinzufügen fehlgeschlagen");
			new Hide_AddMaintenance();
			new Update("ALL", undefined);
		});
		
	}
	
	/**
	 * Funktion um abbrechen zu können
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New(){
		
		new Hide_AddMaintenance();
		
	}
	
	
	/**
	 * Funktion um Neue Instandsetzung hinzufügen anzuzeigen
	 * @method Show_AddMaintenance
	 * @return 
	 */
	function Show_AddMaintenance(){
		
		$scope.view = "add";

		var new_maintenance = {};
		
		new_maintenance.stateObj = MAINTENANCE_TYPES[0];
		
		new_maintenance.spontan = true;
		new_maintenance.atMileage = 0;
		new_maintenance.date = new Date();
		new_maintenance.minDate = new Date();
		
		$scope.new_maintenance = new_maintenance;

	}
	
	/**
	 * Funktion um Neue Instandsetzung hinzufügen zu verstecken
	 * @method Hide_AddMaintenance
	 * @return 
	 */
	function Hide_AddMaintenance(){
		$scope.new_maintenance = {};
		$scope.view = "info";
		$scope.maintenance_selected = "false";
		if ($scope.testing === false) {
			$scope.$apply();
		}
	}
	
	
	/**
	 * Funktion um Neues Element einer Instandsetzung hinzuzufügen
	 * @method Show_CarMaintenance_Add_PopUp
	 * @param {} maintenanceID
	 * @return 
	 */
	function Show_CarMaintenance_Add_PopUp(maintenanceID){

		$rootScope.add_car_maintenance_maintenanceID = maintenanceID;

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
            '<md-dialog class="booking-dialog">'+
            '	<md-dialog-content>' +
			
            '		<md-toolbar class="md-hue-2">' +
            '			<div class="md-toolbar-tools">' +
            '				<h2 class="md-flex">Fahrzeuginstandhaltung</h2>' +
            '			</div>' +
            '		</md-toolbar>' +

			'	<form name="form_CarMain">' +
            '		<md-content flex layout-padding>' +
            '			<div>' +
            '				<label> InstandhaltungsID: {{ item.maintenanceID }} </label>' +
            '			</div>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
			'			<md-input-container>' +
            '				<input type="text" placeholder="FahrzeugID" pattern="[0-9]{1,}" class="md-input" ng-model="item.carID" ng-required="true" >' +   
            '			</md-input-container>' +
			
            '			<md-input-container>' +
            '				<input type="date" placeholder="Geplantes Datum" min="{{item.minDate}}" class="md-input" ng-model="item.plannedDate" ng-required="true" >' +   
            '			</md-input-container>' +
			
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-button class="md-raised md-primary button-to-right" ng-disabled="form_CarMain.$invalid" ng-click="Save()"> Speichern </md-button>' +
            '			<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '		</md-content>' +
			'		</form>' +
			
            '	</md-dialog-content>' +
            '</md-dialog>',

            /**
             * Controller für Neues Element einer Instandsetzung hinzufügen
             * @method DialogController
             * @param {} $scope
             * @param {} $mdDialog
             * @return 
             */
			controller: 'Ctrl_Add_CarMaintenance'
			/* function DialogController($scope, $mdDialog){

				var item = {};
				item.maintenanceID = maintenanceID;
				item.carID = 0;
				item.plannedDate = new Date();
				item.minDate = new Date();
                $scope.item = item;
				*/

                /**
                 * Funktion Dialog zu schliessen
                 * @method closeDialog
                 * @return 
                 */
			/*
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };
*/
                /**
                 * Funktion um in Dialog eingegebenen Daten zu speichern
                 * @method Save
                 * @return 
                 */
			/*
                $scope.Save = function(){
					
					var item = $scope.item;
					
					var data = {};
					data.carId = item.carID;
					data.maintenanceId = item.maintenanceID;
					data.plannedDate = item.plannedDate.toUTCString();
					
					RESTFactory.Car_Maintances_Post(data).then(function(response){
						alert("Element erfolgreich hinzugefügt");
						new Update("ALL", undefined);
					}, function(response){
						alert("Element hinzufügen fehlgeschlagen");
						new Update("ALL", undefined);
					});
					
                    $scope.closeDialog();
                };

            }
			*/
        });
		
	}
	
	/**
	 * Funktion die Überprüfung des Datum dient
	 * @method SafeEndDate
	 * @param {} mainID
	 * @param {} carMainID
	 * @param {} endDate
	 * @return 
	 */
	function SafeEndDate(mainID, carMainID, endDate, invoiceItemID){
		
		var data = {};
		data.completedDate =endDate;
		data.invoiceItemId = invoiceItemID;

		RESTFactory.Car_Maintances_Patch(carMainID, data).then(function(response){
			alert("End Datum und RechnungsElementID erfolgreich gesetzt");
			new Update("ALL", undefined);
		}, function(response){
			alert("End Datum und RechnungsElementID konnten nicht gesetzt werden");
			new Update("ALL", undefined);
		});
		
	}
	
	
	/**
	 * Description
	 * @method Load_Details
	 * @param {} input
	 * @return 
	 */
	$scope.Load_Details = function(input){
		new Load_Details(input);
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
		new Hide_AddMaintenance();
	};

	
	/**
	 * Description
	 * @method Show_AddMaintenance
	 * @return 
	 */
	$scope.Show_AddMaintenance = function(){
		new Show_AddMaintenance();
	};
	
	/**
	 * Description
	 * @method Hide_AddMaintenance
	 * @return 
	 */
	$scope.Hide_AddMaintenance = function(){
		new Hide_AddMaintenance();
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
			new Update_ID(search);			
		}

	};
	
/**
	 * $scope.ShowCarMaintenanceAddPopUp = function(id){
	 * new Show_CarMaintenance_Add_PopUp(id);
	 * };
	 * @method ShowCarMaintenanceAddPopUp
	 * @param {} id
	 * @return 
	 */
	$scope.ShowCarMaintenanceAddPopUp = function(id){
		new Show_CarMaintenance_Add_PopUp(id);
	};

	
	/**
	 * Description
	 * @method SafeEndDate
	 * @param {} mainID
	 * @param {} carMainID
	 * @param {} endDate
	 * @return 
	 */
	$scope.SafeEndDate = function(mainID, carMainID, endDate){
		new SafeEndDate(mainID, carMainID, endDate);
	};
	
	
	
	
	/**
	 * Description
	 * @method Init
	 * @return 
	 */
	function Init(){
		
		$scope.maintenanceStates = MAINTENANCE_TYPES;
		
		new Update();
		
	}
	
	new Init();
	
});
