'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  $scope.load = orchardRunService.GetData();
//   $scope.load = {
//   loadData:{},
//   binData:[
//     {
//       barcode: '1',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h31',
//       varietyName: 'gol del',
//       strainName: 'red',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     },
//     {
//       barcode: '2',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h32',
//       varietyName: 'red del',
//       strainName: 'red chief',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     },
//     {
//       barcode: '3',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h31',
//       varietyName: 'red del',
//       strainName: 'red chief',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     },
//     {
//       barcode: '4',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h33',
//       varietyName: 'red del',
//       strainName: 'red chief',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     },
//     {
//       barcode: '5',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h32',
//       varietyName: 'red del',
//       strainName: 'red chief',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     },
//     {
//       barcode: '6',
//       pickDate : '2017-12-12',
//       boxesCount: 20,
//       binComments: '',
//       storage: 'ca1',    //object
//       blockName: 'h31',
//       varietyName: 'red del',
//       strainName: 'red chief',
//       bearingName: 'b',
//       treatmentName: 't',
//       pickName: '1',
//       jobName: 'p100',
//       pickerIds: ['100','120']
//     }
//   ]
// };

// var groupBy = function(collection, property) {
//   var temp, index, keys = [], result = [];
//   for (var i=0; i < collection.length; i++) {
//     temp = collection[i][property];
//     index = keys.indexOf(temp);
//     if (index > -1)
//     result[index].push(collection[i]);
//     else {
//       keys.push(temp);
//       result.push([collection[i]]);
//     }
//   }
//   return result;
// }

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
//console.log($scope.sorted);
}]);
