'use strict';

angular.module('myApp', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])
    .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('grey')
        .warnPalette('red')
        .accentPalette('blue')
})
    .controller('Ctrl_Main', Ctrl_Main);

function Ctrl_Main($scope) {
    $scope.currentNavItem = 'login';
}

