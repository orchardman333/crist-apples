'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  $scope.load = orchardRunService.GetOrchRunData();
  
  $scope.getBushelSum = function(items) {
    return items.map(a=>a.bushels).reduce((b,c)=>b+c,0);
  };
}]);
