'use strict';

describe('Testsuite: Statisticpage admin', function () {

	var MainCtrl;
	var scope;
	var q;
	var deferred;

	var RESTFactory;

	var statistic_data = [];
	var statistic_1;
	var statistic_2;

	beforeEach(module('adminApp'));
	beforeEach(module('ngAnimate'));
	beforeEach(module('ngRoute'));
	beforeEach(module('ngCookies'));

	beforeEach(function () {

		RESTFactory = {
			Statistics_Get_ByDate: function (date) {
				deferred = q.defer();
				return deferred.promise;
			},
			Statistics_Get: function () {
				deferred = q.defer();
				return deferred.promise;
			}
		};

	});

	beforeEach(inject(function ($controller, $rootScope, $q) {
		
		spyOn(RESTFactory, 'Statistics_Get').and.callThrough();
		
		q = $q;
		scope = $rootScope.$new();
		
		MainCtrl = $controller('Ctrl_Statistics', {
			$scope: scope,
			RESTFactory: RESTFactory
		});

		//SCOPE STUFF
		scope.testing = true;


		statistic_1 = {
			"date": "2017-06-07T00:00:00.000Z",
			"bookings": 20,
			"averageChargeLevel": 70
		};

		statistic_2 = {
			"date": "2017-06-08T00:00:00.000Z",
			"bookings": 16,
			"averageChargeLevel": 90
		};

		var data = [];
		data.push(statistic_1);
		data.push(statistic_2);

		statistic_data = { 'data': data };

	}));


	it('Check if Statistics_Get in RESTFactory was called', function () {

		expect(RESTFactory.Statistics_Get).toHaveBeenCalled();

	});

	it('Check if statistics are set on scope', function () {

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.statistics).not.toBe(undefined);

	});

	it('Check if no statistic is selected', function () {

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.statistic_selected).toBe("false");

	});

	it('Check if statistic is selected', function () {
		
		deferred.resolve(statistic_data);
		scope.$root.$digest();

		scope.Load_Details(scope.statistics[0]);

		statistic_data = { 'data': statistic_1 };

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.statistic_selected).toBe("true");

	});

	it('Check if statistic data are loaded', function () {

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		scope.Load_Details(scope.statistics[0]);

		statistic_data = { 'data': statistic_1 };

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.currentStatistic.averageCharge).toBe(70);

	});

	it('Check if search loads only one statistic', function () {

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		scope.Load_Details(scope.statistics[0]);

		scope.searchQuery = "2017-06-08";

		scope.Enter_Search();

		statistic_data = { 'data': statistic_2 };

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.statistics[statistic_2.date]).not.toBe(undefined);

		expect(scope.statistics[1]).toBe(undefined);

	});

	it('Check if search loads all statistic', function () {

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		scope.Load_Details(scope.statistics[0]);

		scope.searchQuery = null;

		scope.Enter_Search();

		deferred.resolve(statistic_data);
		scope.$root.$digest();

		expect(scope.statistics[statistic_1.date]).not.toBe(undefined);

		expect(scope.statistics[statistic_2.date]).not.toBe(undefined);

	});

});
