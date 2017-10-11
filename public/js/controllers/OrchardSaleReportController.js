'use strict';

angular.module('crist_farms')
.controller('OrchardSaleReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  //$scope.load = orchardRunService.GetData();
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
      blockName:"A3",
      varietyName:"Reds",
      strainName:"Chief",
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storageName: "CA 20",
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      blockName:"A3",
      varietyName:"Reds",
      strainName:"Chief",
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storageName: "CA 20",
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      blockName:"A2",
      varietyName:"Reds",
      strainName:"Chief",
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storageName: "CA 20",
      pickerIds: ["120","121"]
    },
    {
      barcode: "vaactrobu12520000",
      blockName:"A3",
      varietyName:"GD",
      strainName:"Chief",
      pickDate: "2017-08-02",
      bushels: 20,
      binComments: "bincomments123",
      storageId: "20",
      storageName: "CA 20",
      pickerIds: ["120","121"]
    }]
  }
  $scope.getBushelSum = function(items) {
    return items.map(a=>a.bushels).reduce((b,c)=>b+c,0);
  };
  //console.log($scope.groupedBins);
}]);
