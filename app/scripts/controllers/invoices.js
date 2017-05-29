'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Invoices', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var invoices_all = {};
	
	var INVOICE_TYPES = {
		0: {
			text: "Abbuchung",
			be: "DEBIT",
			id: 0
		},
		1: {
			text: "Gutschrift",
			be: "CREDIT",
			id: 1
		}
	};
	
	
	
	function Update_ID(id){
		new Update("ID", id);
	}
	
	function Update(type, value){
		
		invoices_all = {};
		
		$scope.invoice_selected = "false";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "ID"){
			prom = RESTFactory.Invoices_Get_InvoiceID(value);
		}else{
			prom = RESTFactory.Invoices_Get();
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
				
				var invoice = {};
				
				var ID_STR = data_use.invoiceId;
				
				
				invoice.invoiceID = data_use.invoiceId;
				invoice.totalAmount = data_use.totalAmount;
				invoice.customerID = data_use.customerId;
				invoice.paid = data_use.paid;
				invoice.paidText = "Nicht bezahlt";
				if(invoice.paid === true){ invoice.paidText = "Bezahlt"; }
				
				invoice.customerState = "false";
				
				invoices_all[ID_STR] = invoice;
				
				$scope.invoices = invoices_all;
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
					
					invoices_all[ID_STR] = invoice;
					$scope.invoices = invoices_all;
					$scope.$apply();
					
				}, function(response){
					
				});
				
			}
			
			
		}, function(response){
			
			$scope.invoices = invoices_all;
			$scope.$apply();
			
		});
		
		
	}
	
	function Load_Details(id){
		
		$scope.invoice_selected = "true";
		
		RESTFactory.Invoices_Get_InvoiceID(id).then(function(response){
			
			var data_use = response.data;
			
			var invoice = {};
			
			invoice.invoiceID = data_use.invoiceId;
			invoice.totalAmount = data_use.totalAmount;
			invoice.customerID = data_use.customerId;
			invoice.paid = data_use.paid;
			invoice.paidText = "Nicht bezahlt";
			if(invoice.paid === true){ invoice.paidText = "Bezahlt"; }
			
			invoice.customer = {};
			invoice.customerState = "false";
			
			invoice.items = {};
			invoice.itemState = "false";
			
			$scope.currentInvoice = invoice;
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
					item.typeObj = INVOICE_TYPES[data_use.type];
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
			new Hide_AddInvoice();
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
            '				<label> RechnungsID: {{ new_item.invoiceID }} </label>' +
            '			</div>' +
            '		</md-content>' +
			
			'		<form name="item_Form">' +
            '			<md-content flex layout-padding>' +
            '				<md-input-container>' +
            '					<input type="text" placeholder="Grund" class="md-input" minlength="1" ng-model="new_item.reason" ng-required="true" >' +   
            '				</md-input-container>' +
			
            '				<md-input-container>' +
            '					<input type="text" placeholder="Preis" class="md-input" ng-model="new_item.amount" pattern="\\d+(.\\d{2})?" ng-required="true" >' +
            '				</md-input-container>' +
			
			'				<md-input-container flex-gt-sm>' +
            '           		<md-menu>' +
			'						<md-button ng-mouseenter="$mdMenu.open()">{{new_item.typeObj.text}}</md-button>' +
			'						<md-menu-content width="4" ng-mouseleave="$mdMenu.close()">' +
			'							<md-menu-item ng-repeat="item in invoiceTypes">' +
			'								<md-button ng-click="new_item.typeObj = item">' +
			'									{{item.text}}' +
			'								</md-button>' +
			'							</md-menu-item>' +
			'						</md-menu-content>' +
			'					</md-menu>' +
            '       		</md-input-container>' +
			
            '			</md-content>' +

            '			<md-content flex layout-padding>' +
            '				<md-button class="md-raised md-primary button-to-right" ng-click="Save()" ng-disabled="item_Form.$invalid"> Speichern </md-button>' +
            '				<md-button class="md-primary md-hue-1 button-to-right" ng-click="closeDialog()"> Verwerfen </md-button>' +
            '			</md-content>' +
			'		</form>' +

            '	</md-dialog-content>' +
            '</md-dialog>',

            controller: function DialogController($scope, $mdDialog){

				var new_item = {};
				
				new_item.invoiceID = invoiceID;
				new_item.reason = "";
				new_item.amount = "0,00";
				new_item.typeObj = INVOICE_TYPES[0];
				
                $scope.new_item = new_item;
				

                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                $scope.Save = function(){
					
					var item = $scope.new_item;
					
					var data = {
						invoiceId: item.invoiceID,
						amount: parseFloat(item.amount),
						reason: item.reason,
						type: item.typeObj.be
					};
					
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
		new Dismiss_New();
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
		
		$scope.invoiceTypes = INVOICE_TYPES;
		
		new Update();
		
	}
	
	new Init();
	
});
