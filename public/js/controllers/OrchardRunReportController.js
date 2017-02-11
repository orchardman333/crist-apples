'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
 function ($scope, orchardRunService) {

     $scope.load = orchardRunService.GetData();
     
 }]);
