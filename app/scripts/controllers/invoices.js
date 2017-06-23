'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:BookingsCtrl
 * @description
 * # BookingsCtrl
 * give some description here
 */
 
application.controller('Ctrl_Invoices', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	$scope.testing = false;

	var invoices_all = {};
	
	var INVOICE_TYPES = {
		1: {
			text: "Abbuchung",
			be: "DEBIT",
			id: 1
		},
		2: {
			text: "Gutschrift",
			be: "CREDIT",
			id: 2
		}
	};
	
	
	
	/**
	 * Hilfsfunktion die Update mit ID
	 * @method Update_ID
	 * @param {} id
	 * @return 
	 */
	function Update_ID(id){
		new Update("ID", id);
	}
	
	/**
	 * Funktion die Daten der Buchung aus der Rest-Schnittstelle holt und diese ausgibt
	 * @method Update
	 * @param {} type
	 * @param {} value
	 * @return 
	 */
	function Update(type, value){
		
		invoices_all = {};
		$scope.invoices = invoices_all;
		
		
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
			
			data.forEach(function(data_use, index){
				
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
				if ($scope.testing === false) {
					$scope.$apply();
				}
				
				
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
					if ($scope.testing === false) {
						$scope.$apply();
					}
					
				});
				
			});
			
			
		});
	}
	
	/**
	 * Funktion die Details der Buchung aus der Rest-Schnittstelle holt und diese ausgibt
	 * @method Load_Details
	 * @param {} id
	 * @return 
	 */
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
			if ($scope.testing === false) {
				$scope.$apply();
			}
			
			
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
				if ($scope.testing === false) {
					$scope.$apply();
				}
				
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
				if ($scope.testing === false) {
					$scope.$apply();
				}
				
			});
		
		});
		
	}
	
	
	
	/**
	 * Funktion um Buchung zu speichern
	 * @method Safe_New
	 * @return 
	 */
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
	
	/**
	 * Funktion um abzubrechen
	 * @method Dismiss_New
	 * @return 
	 */
	function Dismiss_New(){
		
		new Hide_AddInvoice();
		
	}
	
	
	/**
	 * Funktion um Neue Rechnung hinzufügen anzuzeigen
	 * @method Show_AddInvoice
	 * @return 
	 */
	function Show_AddInvoice(){
		
		$scope.view = "add";

		var new_invoice = {};
		
		new_invoice.paid = false;
		new_invoice.totalAmount = 0;
		new_invoice.customerID = 0;
		
		$scope.new_invoice = new_invoice;

	}
	
	/**
	 * Funktion um Neue Rechnung hinzuzufügen zu verstecken
	 * @method Hide_AddInvoice
	 * @return 
	 */
	function Hide_AddInvoice(){
		$scope.new_invoice = {};
		$scope.view = "info";
		$scope.invoice_selected = "false";
		if ($scope.testing === false) {
			$scope.$apply();
		}
	}

	/**
	 * Funktion um eine Rechnung als bezahlt zu setzen
	 * @method SetPaid
	 * @param {} id
	 * @return 
	 */
	function SetPaid(id){
		if($scope.currentInvoice.paid === true){
			RESTFactory.Invoices_Patch_Paid(id, false);
		}else{
			RESTFactory.Invoices_Patch_Paid(id, true);
		}
		setTimeout(Update, 500);
	}
	
	
	/**
	 * Funktion um Neuen Rechnungselement hinzufügen anzuzeigen
	 * @method Show_AddItem_PopUp
	 * @param {} invoiceID
	 * @return 
	 */
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

            /**
             * Controller um Daten aus Dialog Neue Rechnungselemnt hinzufügen zu verwalten
             * @method DialogController
             * @param {} $scope
             * @param {} $mdDialog
             * @return 
             */
            controller: function DialogController($scope, $mdDialog){

				var new_item = {};
				
				new_item.invoiceID = invoiceID;
				new_item.reason = "";
				new_item.amount = "0.00";
				new_item.typeObj = INVOICE_TYPES[1];
				
                $scope.new_item = new_item;
				

                /**
                 * Funktion um Dialog Neuer Rechnungselement hinzufügen zu verstecken
                 * @method closeDialog
                 * @return 
                 */
                $scope.closeDialog = function(){
                    $mdDialog.hide();
                };

                /**
                 * Funktion um Dialog Neuer Rechnungselement hinzufügen zu speichern und an die Rest-Schnittstelle zu übergeben
                 * @method Save
                 * @return 
                 */
                $scope.Save = function(){
					
					var item = $scope.new_item;
					
					for(var i = 0; i < item.amount.length; i++){
						if(item.amount[i] === ','){
							item[i].amount = '.';
						}
					}

					var data = {
						invoiceId: item.invoiceID,
						amount: parseFloat(item.amount),
						reason: item.reason,
						type: item.typeObj.be
					};
					
					RESTFactory.Invoices_Post_Items(invoiceID, data).then(function (response) {
						new Load_Details(invoiceID);
						alert("Element erfolgreich hinzugefügt");
					}, function(response){
						new Load_Details(invoiceID);
						alert("Element hinzufügen fehlgeschlagen");
					});

                    $scope.closeDialog();
                };

            }
        });
		
	}
	
	
	/**
	 * Funktion um Details zu laden
	 * @method Load_Details
	 * @param {} input
	 * @return 
	 */
	$scope.Load_Details = function(input){
		new Load_Details(input);
	};
	
	
	/**
	 * Funktion um Details zu speichern
	 * @method Safe_New
	 * @return 
	 */
	$scope.Safe_New = function(){
		new Safe_New();
	};
	
	/**
	 * Funktion um abzubrechen
	 * @method Dismiss_New
	 * @return 
	 */
	$scope.Dismiss_New = function(){
		new Dismiss_New();
	};


	/**
	 * Funktion um eine Rechnung als bezahlt zu setzen
	 * @method SetPaid
	 * @param {} id
	 * @return 
	 */
	$scope.SetPaid = function(id){
		new SetPaid(id);
	};

	
	/**
	 * Funktion um Rechnungselement anzuzeigen
	 * @method Show_AddInvoice
	 * @return 
	 */
	$scope.Show_AddInvoice = function(){
		new Show_AddInvoice();
	};
	
	/**
	 * Funktion um Rechnungselement zu verstecken
	 * @method Hide_AddInvoice
	 * @return 
	 */
	$scope.Hide_AddInvoice = function(){
		new Hide_AddInvoice();
	};
	
	/**
	 * Funktion die die Suche mit eingegebenen Wörter startet
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
	 * Funktion um Neues Rechnungselement hinzufügen anzuzeigen
	 * @method ShowItemAddPopUp
	 * @param {} id
	 * @return 
	 */
	$scope.ShowItemAddPopUp = function(id){
		new Show_AddItem_PopUp(id);
	};
	
	
	
	/**
	 * Init-Funktion der Seite invoices
	 * @method Init
	 * @return 
	 */
	function Init(){
		
		$scope.invoiceTypes = INVOICE_TYPES;
		
		new Update();
		
	}
	
	new Init();
	
});
