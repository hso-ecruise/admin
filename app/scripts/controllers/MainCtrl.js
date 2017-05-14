'use strict';

application.controller('Ctrl_Main', function ($rootScope, $scope) {
    var init = function () {
	$rootScope.loggedIN = "false";
    };

    init();

    $scope.ChangeView = function (input) {
	$scope.currentView = input;
    };
});
