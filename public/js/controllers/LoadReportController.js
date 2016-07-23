'use strict';

angular.module('crist_farms')

.controller('LoadReportController', ['$scope','LoadRunService',
 function ($scope, LoadRunService) {
   LoadRunService.GetLoadReport(function (data) {
     $scope.rowCollection=data;
   });
 }]);
