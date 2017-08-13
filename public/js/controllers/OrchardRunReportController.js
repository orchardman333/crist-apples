'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  $scope.load = orchardRunService.GetData();

var group = function(bins) {
  var grouping = groupBy(bins, 'blockName');
  for (var i in grouping) {
    grouping[i] = groupBy(grouping[i], 'varietyName');
    for (var j in grouping[i]) {
      grouping[i][j] = groupBy(grouping[i][j], 'strainName');
      for (var k in grouping[i][j]) {
        grouping[i][j][k] = {bins: grouping[i][j][k]};
        grouping[i][j][k].binCount = grouping[i][j][k].bins.length;
        grouping[i][j][k].sum = grouping[i][j][k].bins.map(a=>a.boxesCount).reduce((b,c)=>b+c,0);
      }
    }
  }
  return grouping;
}

var groupBy = function (collection, property) {
  var temp, index, keys = [], result = {};
  for (var i=0; i < collection.length; i++) {
    temp = collection[i][property]; //'h31'
    index = keys.indexOf(temp);
    if (index === -1) {
      keys.push(temp);
      result[temp]=[];
    }
    result[temp].push(collection[i]);
  }
  return result;
}
$scope.groupedBins = group($scope.load.binData);
//console.log($scope.groupedBins);
}]);
