'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  //$scope.load = orchardRunService.GetOrchRunData();
  $scope.load = {
    loadData : {
      load: { "type": "or", "id": "1000"},
      truckDriver: { "id": "100", "name": "Jedd Crist"},
      loadDateTime: new Date(Date.now()),
      truck : {"id": "bbt", "name": "bin bandit"},
      loadComments: "load comments"
    },
    binData: [{
      barcode: "vaactrobu12520000",
      block: {id: "a03", name:"A3"},
      variety: {id: "rd", name:"Reds"},
      strain: {id: "ch", name:"Chief"},
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storage: {id: "20", name: "CA 20"},
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      block: {id: "a03", name:"A3"},
      variety: {id: "rd", name:"Reds"},
      strain: {id: "ch", name:"Chief"},
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storage: {id: "20", name: "CA 20"},
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      block: {id: "a02", name:"A2"},
      variety: {id: "rd", name:"Reds"},
      strain: {id: "ch", name:"Chief"},
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storage: {id: "20", name: "CA 20"},
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      block: {id: "a03", name:"A3"},
      variety: {id: "gd", name:"GD"},
      strain: {id: "ch", name:"Chief"},
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storage: {id: "20", name: "CA 20"},
      pickerIds: ["120","121"]
    }]
  }
  $scope.getBushelSum = function(items) {
    return items.map(a=>a.bushels).reduce((b,c)=>b+c,0);
  };
// var group = function(bins) {
//   var grouping = groupBy(bins, 'blockName');
//   for (var i in grouping) {
//     grouping[i] = groupBy(grouping[i], 'varietyName');
//     for (var j in grouping[i]) {
//       grouping[i][j] = groupBy(grouping[i][j], 'strainName');
//       for (var k in grouping[i][j]) {
//         grouping[i][j][k] = {bins: grouping[i][j][k]};
//         grouping[i][j][k].binCount = grouping[i][j][k].bins.length;
//         grouping[i][j][k].sum = grouping[i][j][k].bins.map(a=>a.boxesCount).reduce((b,c)=>b+c,0);
//       }
//     }
//   }
//   return grouping;
// }
//
// var groupBy = function (collection, property) {
//   var temp, index, keys = [], result = {};
//   for (var i=0; i < collection.length; i++) {
//     temp = collection[i][property]; //'h31'
//     index = keys.indexOf(temp);
//     if (index === -1) {
//       keys.push(temp);
//       result[temp]=[];
//     }
//     result[temp].push(collection[i]);
//   }
//   return result;
// }
//
// $scope.loadBushelSum = $scope.load.binData.map(a=>a.boxesCount).reduce((b,c)=>b+c,0);
// $scope.groupedBins = group($scope.load.binData);
//console.log($scope.groupedBins);
}]);
