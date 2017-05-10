'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
 function ($scope, orchardRunService) {
    $scope.timeSubmitted = new Date(Date.now());
     $scope.load = orchardRunService.GetData();

 }]);
