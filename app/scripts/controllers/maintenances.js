'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Maintenances', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var maintenances_all = {};
	
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		maintenances_all = {};
		
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
				maintenance.spontan = data_use.spontaneously;
				maintenance.atMileage = data_use.atMileage;
				maintenance.atDate = data_use.atDate;
				maintenance.date = Helper.Get_Zeit(data_use.atDate);
				
				maintenances_all[ID_STR] = maintenance;
				
			}
			
			$scope.maintenances = maintenances_all;
			$scope.$apply();
			
			
		}, function(response){
			
			$scope.maintenances = maintenances_all;
			$scope.$apply();
			
		});
		
		
	}
	
	function Load_Details(id){
		
		$scope.maintenance_selected = "true";
		
		RESTFactory.Maintances_Get_MaintenanceID(id).then(function(response){
			
			var data_use = response.data;
			
			var maintenance = {};
			
			maintenance.maintenanceID = data_use.maintenanceId;
			maintenance.spontan = data_use.spontaneously;
			maintenance.atMileage = data_use.atMileage;
			maintenance.atDate = data_use.atDate;
			maintenance.date = Helper.Get_Zeit(data_use.atDate);
			
			maintenance.car_maintenance_state = "false";
			
			$scope.currentMaintenance = maintenance;
			$scope.$apply();
			
			//GET CAR MAINTENCE
			RESTFactory.Car_Maintances_Get_MaintenanceID(maintenance.maintenanceID).then(function(response){
				
				maintenance.car_maintenance_state = "true";
				
				var data_use = response.data;
				
				var car_maintenance = {};
				car_maintenance.carMaintenanceID = data_use.carMaintenanceId;
				car_maintenance.carID = data_use.carId;
				car_maintenance.maintenanceID = data_use.maintenanceId;
				car_maintenance.invoiceItemID = data_use.invoiceItemId;
				car_maintenance.plannedDate = Helper.Get_Zeit(data_use.plannedDate);
				car_maintenance.completedDate = Helper.Get_Zeit(data_use.completedDate);
				
				car_maintenance.text = "Letzte Wartung";
				
				var now = new Date();
				
				if(now.GetTime() - car_maintenance.plannedDate.value > 0){
					car_maintenance.text = "Nächste Wartung";
				}
				
				car_maintenance.invoice_state = "false";
				
				maintenance.car_maintenance = car_maintenance;
				
				$scope.currentMaintenance = maintenance;
				$scope.$apply();
				
				
				
				//GET INVOICE INFOS
				RESTFactory.Invoices_Get_Items_ItemID(booking.invoiceItemID).then(function(response){
				
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
					
					maintenance.car_maintenance = car_maintenance;
					
					$scope.currentMaintenance = maintenance;
					$scope.$apply();
					
				}, function(response){
					
				
				});
				
				
			}, function(response){
				
			});
			
		
		}, function(response){
			
		});
		
	}
	
	
	
	function Safe_New(){
		
		var maintenance = {};
		
		maintenance.spontaneously = $scope.new_maintenance.spontan;
		maintenance.atMileage = $scope.new_maintenance.atMileage;
		maintenance.atDate = $scope.new_maintenance.date;
		
		RESTFactory.Maintances_Post(maintenance).then(function(response){
			alert("Instandhaltung wurde erfolgreich hinzugefügt");
			new Hide_AddBooking();
			setTimeout(Update, 2000);
		}, function(response){
			alert("Rechnung fehlgeschlagen");
			new Hide_AddInvoice();
			setTimeout(Update, 2000);
		});
		
	}
	
	function Dismiss_New(){
		
		new Hide_AddInvoice();
		
	}
	
	
	function Show_AddMaintenance(){
		
		$scope.view = "add";

		var new_maintenance = {};
		
		new_maintenance.spontan = false;
		new_maintenance.atMileage = 0;
		new_maintenance.date = new Date();
		new_maintenance.minDate = new Date();
		
		$scope.new_maintenance = new_maintenance;

	}
	
	function Hide_AddMaintenance(){
		$scope.new_maintenance = {};
		$scope.view = "info";
		$scope.maintenance_selected = "false";
		$scope.$apply();
	}
	
	
	function Show_AddItem_PopUp(maintenanceID){

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
            '				<input type="date" placeholder="Geplantes Datum" min="{{item.minDate}}" class="md-input" ng-model="item.date" ng-required="true" >' +   
            '			</md-input-container>' +
			
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-button class="md-raised md-primary button-to-right" ng-disabled="form_CarMain.$invalid" ng-click="Save()"> Speichern </md-button>' +
            '			<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '		</md-content>' +
			'		</form>' +
			
            '	</md-dialog-content>' +
            '</md-dialog>',

            controller: function DialogController($scope, $mdDialog){

				var item = {};
				
				item.maintenanceID = maintenanceID;
				item.carID = 0;
				item.plannedDate = new Date();
				item.minDate = new Date();
				
                $scope.item = item;
				

                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                $scope.Save = function(){
					
					var item = $scope.item;
					
					var data = {
						maintenanceId: item.maintenanceID,
						carId: parseInt(item.carID),
						reason: item.plannedDate
					};
					
					console.log(data);
					
					
					RESTFactory.Car_Maintances_Post(maintenanceID, data).then(function(response){
						alert("Element erfolgreich hinzugefügt");
					}, function(response){
						alert("Element hinzufügen fehlgeschlagen");
					});
					
                    $scope.closeDialog();
                };

            }
        });
		
	}
	
	
	$scope.Load_Details = function(input){
		new Load_Details(input);
	};
	
	
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	$scope.Dismiss_New = function(){
		new Hide_AddMaintenance();
	};

	
	$scope.Show_AddMaintenance = function(){
		new Show_AddMaintenance();
	};
	
	$scope.Hide_AddMaintenance = function(){
		new Hide_AddMaintenance();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		if(search === undefined || search.length === 0){
			new Update("ALL", undefined);
		}else{
			new Update_ID(search);			
		}

	};
	
	
	$scope.ShowItemAddPopUp = function(id){
		new Show_AddItem_PopUp(id);
	};
	
	
	
	function Init(){
		
		new Update();
		
	}
	
	new Init();
	
});
