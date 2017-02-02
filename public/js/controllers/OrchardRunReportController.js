'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
 function ($scope, orchardRunService) {

     $scope.load = orchardRunService.GetData();
    //  $scope.truckDriver = $scope.load.loadData.truckDriverName;
    //  $scope.truck = $scope.load.loadData.truckName;
    //  $scope.date = $scope.load.loadData.loadDate;
    //  $scope.dateTime = $scope.load.loadData.loadDateTime;
 }]);
