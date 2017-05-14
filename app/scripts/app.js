'use strict';

/**
 * @ngdoc overview
 * @name adminApp
 * @description
 * # adminApp
 *
 * Main module of the application.
 */
var application = angular.module('adminApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
]);

var checkRouting= function ($rootScope, $location, $cookies) {
    
    if ($rootScope.LoggedIN === false || $rootScope.LoggedIN === undefined)
    {
	if($rootScope.LoggedIN === undefined){
	    $rootScope.LoggedIN = false;
	}
	
	$location.path("/start");
    }
    else
    {
	alert("true or other");
	alert($rootScope.LoggedIN);
    }
};

application.config(function ($routeProvider, $locationProvider){
    $routeProvider
	.when('/', {
	    templateUrl: 'views/start.html',
	    resolve: {
		factory: checkRouting
	    }

	})
	.when('/about', {
	    templateUrl: 'views/about.html',
	    controller: 'AboutCtrl',
	    controllerAs: 'about'
	})
	.when('/start', {
	    templateUrl: 'views/start.html',
	    controller: 'StartCtrl',
	    controllerAs: 'start'
	})
    	.when('/vehicles', {
	    templateUrl: 'views/vehicles.html',
	    controller: 'VehiclesCtrl',
	    controllerAs: 'vehicles'
	})
        .when('/users', {
	    templateUrl: 'views/users.html',
	    controller: 'UsersCtrl',
	    controllerAs: 'users'
	})
        .when('/bookings', {
	    templateUrl: 'views/bookings.html',
	    controller: 'BookingsCtrl',
	    controllerAs: 'bookings'
	})
        .when('/statistics', {
	    templateUrl: 'views/statistics.html',
	    controller: 'StatisticsCtrl',
	    controllerAs: 'statistics'
	})
	.otherwise({
	    redirectTo: '/'
	});

    $locationProvider
	.html5Mode(true);
});
