'use strict';

angular.module('crist_farms', ['ngRoute'])
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
        .when('/#', {
            controller: 'HomeController',
            templateUrl: 'js/views/home.html',
        }) //load_run
        .when('/load_run', {
            controller: 'LoadRunController',
            templateUrl: 'js/views/load_run.html',
        }) //load_run
        .otherwise({ redirectTo: '/#' });
}]);
