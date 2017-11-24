'use strict';

angular.module('crist_farms')
.controller('OrchardSaleReportController', ['$scope','StorageService',
function ($scope, storageService) {
  $scope.timeSubmitted = new Date(Date.now());
  $scope.load = storageService.GetOrchRunSaleData();

  $scope.getBushelSum = function(items) {
    return items.map(a=>a.bushels).reduce((b,c)=>b+c,0);
  };
  //console.log($scope.groupedBins);
}]);
