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
				maintenance.spontan = data_use.spontanesously;
				maintenance.atMileage = data_use.atMileage;
				maintenance.atDate = data_use.atDate;
				
				var date = {};
				date.date = Helper.Get_Date(data_use.atDate);
				date.time = Helper.Get_Time(data_use.atDate);
				
				maintenance.date = date;
				
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
			maintenance.spontan = data_use.spontanesously;
			maintenance.atMileage = data_use.atMileage;
			maintenance.atDate = data_use.atDate;
			
			var date = {};
			date.date = Helper.Get_Date(data_use.atDate);
			date.time = Helper.Get_Time(data_use.atDate);
			
			maintenance.date = date;
			
			$scope.currentMaintenance = maintenance;
			$scope.$apply();
			
			
			//GET CUSTOMER
			RESTFactory.Customers_Get_CustomerID(invoice.customerID).then(function(response){
				
				
				var custom_data = response.data;
				
				var customer = {};
				
				customer.customerID = custom_data.customerId;
				customer.name = custom_data.firstName;
				customer.familyName = custom_data.lastName;
				
				invoice.customer = customer;
				invoice.customerState = "true";
				
				console.log(invoice);
				
				$scope.currentInvoice = invoice;
				$scope.$apply();
				
			}, function(response){
				
			});
			
			//GET INVOICE ITEMS
			RESTFactory.Invoices_Get_Items(invoice.invoiceID).then(function(response){
				
				var data = response.data;
				
				for(var i = 0; i < data.length; i++){
					
					var data_use = data[i];
					
					var item = {};
					
					item.itemID = data_use.invoiceItemId;
					item.invoiceID = data_use.invoiceId;
					item.reason = data_use.reason;
					item.type = data_use.type;
					item.amount = data_use.amount;
					
					invoice.items[item.itemID] = item;
					
				}
				
				if(data.length > 0){
					invoice.itemState = "true";
				}
				
				
				$scope.currentInvoice = invoice;
				$scope.$apply();
				
			}, function(response){
				
			});
		
		}, function(response){
			
		});
		
	}
	
	
	
	function Safe_New(){
		
		var invoice = {};
		
		invoice.paid = $scope.new_invoice.paid;
		invoice.totalAmount = $scope.new_invoice.totalAmount;
		invoice.customerId = $scope.new_invoice.customerID;
		
		RESTFactory.Invoices_Post(invoice).then(function(response){
			alert("Rechnung wurde erfolgreich ausgeführt");
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
	
	
	function Show_AddInvoice(){
		
		$scope.view = "add";

		var new_invoice = {};
		
		new_invoice.paid = false;
		new_invoice.totalAmount = 0;
		new_invoice.customerID = 0;
		
		$scope.new_invoice = new_invoice;

	}
	
	function Hide_AddInvoice(){
		$scope.new_invoice = {};
		$scope.view = "info";
		$scope.invoice_selected = "false";
		$scope.$apply();
	}
	
	
	function Show_AddItem_PopUp(invoiceID){

        $mdDialog.show({
            clickOutsideToClose: true,
            scope: $scope,
            preserveScope: true,
            template:
            '<md-dialog class="booking-dialog">'+
            '	<md-dialog-content>' +

            '		<md-toolbar class="md-hue-2">' +
            '			<div class="md-toolbar-tools">' +
            '				<h2 class="md-flex">Elementinformationen eingeben</h2>' +
            '			</div>' +
            '		</md-toolbar>' +

            '		<md-content flex layout-padding>' +
            '			<div>' +
            '				<label> RechnungsID: {{ item.invoiceID }} </label>' +
            '			</div>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-input-container>' +
            '				<input type="text" placeholder="Grund" class="md-input" ng-model="item.reason" ng-required="true" >' +   
            '			</md-input-container>' +
			
            '			<md-input-container>' +
            '				<input type="text" placeholder="Preis" class="md-input" ng-model="item.amount" pattern="\\d+(,\\d{2})?" ng-required="true" >' +
            '			</md-input-container>' +
			
            '			<md-input-container>' +
            '				<input type="text" placeholder="Typ" class="md-input" ng-model="item.type" ng-required="true" >' +
            '			</md-input-container>' +
            '		</md-content>' +

            '		<md-content flex layout-padding>' +
            '			<md-button class="md-raised md-primary button-to-right" ng-click="Save()"> Speichern </md-button>' +
            '			<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '		</md-content>' +

            '	</md-dialog-content>' +
            '</md-dialog>',

            controller: function DialogController($scope, $mdDialog){

				var item = {};
				
				item.invoiceID = invoiceID;
				item.reason = "";
				item.amount = "0,00";
				item.type = "Rechnung";	//Gutschrift
				
                $scope.item = item;
				

                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                $scope.Save = function(){
					
					var item = $scope.item;
					
					var data = {
						invoiceId: item.invoiceID,
						amount: parseFloat(item.amount),
						reason: item.reason,
						type: item.type
					};
					
					console.log(data);
					
					
					RESTFactory.Invoices_Post_Items(invoiceID, data).then(function(response){
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
		new Hide_AddBooking();
	};

	
	$scope.Show_AddInvoice = function(){
		new Show_AddInvoice();
	};
	
	$scope.Hide_AddInvoice = function(){
		new Hide_AddInvoice();
	};
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		console.log(search);
		
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
		
		console.log(Helper.Get_Now());
		
		console.log(Helper.Get_Zeit("2017-05-28T14:29:53.344Z"));
		
		new Update();
		
	}
	
	new Init();
	
});
