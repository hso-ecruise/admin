'use strict';

/**
 * @ngdoc function
 * @name adminApp.controller:StatisticsCtrl
 * @description
 * # StatisticsCtrl
 * give some description here
 */

 application.controller('Ctrl_Statistics', function ($rootScope, $scope, RESTFactory, Helper, $mdDialog) {
	
	var statistics_all = {};
	
	
	function Update_Date(name){
		new Update("DATE", name);
	}
	
	
	function Update(type, value){
		
		statistics_all = {};
		$scope.statistics = statistics_all;
		
		
		$scope.statistic_selected = "false";
		
		$scope.editDisabled = "true";
		
		$scope.view = "info";
		
		var prom = {};
		
		if(type === "DATE"){
			prom = RESTFactory.Statistics_Get_ByDate(value);
		}else{
			prom = RESTFactory.Statistics_Get();
		}
		
		prom.then(function(response){
			
			var data = [];
			
			if(type === "DATE"){
				data.push(response.data);
			}else{
				data = response.data;
			}
			
			data.forEach(function(data_use, index){
				
				var statistic = {};
				
				var ID_STR = data_use.date;
				
				statistic.date = Helper.Get_Zeit(data_use.date);
				statistic.bookings = data_use.bookings;
				statistic.averageCharge = data_use.averageChargeLevel;
				
				statistics_all[ID_STR] = statistic;
				$scope.statistics = statistics_all;
				$scope.$apply();
				
			});
			
		}, function(response){
			
		});
		
		
	}
	
	function Load_Details(date){
		
		date = date + ".000Z";
		
		RESTFactory.Statistics_Get_ByDate(date).then(function(response){
			
			$scope.statistic_selected = "true";
			
			var data_use = response.data;
			
			var statistic = {};
			
			statistic.date = Helper.Get_Zeit(data_use.date);
			statistic.bookings = data_use.bookings;
			statistic.averageCharge = data_use.averageChargeLevel;
			
			$scope.currentStatistic = statistic;
			$scope.$apply();
			
		}, function(response){
			
		});
		
	}
	
	function LoadHeatMap(){
		
		//Get all stations
			//Get all car charging stations for each station
		
		
		
		
		
	}
	
	
	
	$scope.Load_Details = function(id){
		new Load_Details(id);
	};
	
	
	$scope.Enter_Search = function(){
		
		var search = $scope.searchQuery;
		
		if(search === undefined){
			new Update("ALL", undefined);
		}else{
			
			var date = Helper.Get_Zeit(search);
			
			var month = date.date_ele.month + 1;
			if(month < 10){
				month = "0" + month;
			}
			
			var day = date.date_ele.day;
			if(day < 10){
				day = "0" + day;
			}
			
			var search = date.date_ele.year + "-" + month + "-" + day;
			search = search + "T00:00:00.000Z";
			
			console.log(search);
			
			new Update_Date(search);
		}
		
	};
	
	
	function Init(){
		
		new Update("ALL", undefined);
		
	}

	new Init();
	
});
