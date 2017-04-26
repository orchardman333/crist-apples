'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', '$location', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, $location, orchardRunService, storageTransferService, truckService) {
  var currentDateTime = new Date(Date.now());
  $scope.pickDate = currentDateTime;
  $scope.loadDateTime = currentDateTime;
  $scope.scan = null;
  $scope.boxesCount = 20;
  $scope.binComments = null;
  $scope.loadComments = null;
  $scope.binData = [];
  $scope.displayBinData = $scope.binData.slice().reverse();


  truckService.GetTrucks(function(data) {
    $scope.truckList=data;
    $scope.truck=$scope.truckList[0];
  });

  truckService.GetTruckDrivers(function(data) {
    $scope.truckDriverList=data;
    $scope.truckDriver=$scope.truckDriverList[0];
  });

  storageTransferService.GetStorageList(function(data) {
    $scope.storageList = data;
    $scope.storage=$scope.storageList[0];
  });

  $scope.addScan = function() {
    orchardRunService.DecodeBarcode({barCode: $scope.scan}, function(decodedData) {
      //scanned barcode is a bin's barcode
      if ($scope.scan.length == 19) {
        //check if duplicate bin ID has been scanned already
        if ($scope.binData.map(function(a) {return a.barcode}).indexOf($scope.scan) == -1) {
          var value = {
            barcode: $scope.scan,
            pickDate : moment($scope.pickDate).format('YYYY-MM-DD'),
            boxesCount: $scope.boxesCount,
            binComments: $scope.binComments,
            storageId: $scope.storage.id,
            storageName: $scope.storage.name,
            blockName: decodedData.blockName,
            varietyName: decodedData.varietyName,
            strainName: decodedData.strainName,
            bearingName: decodedData.bearingName,
            treatmentName: decodedData.treatmentName,
            pickName: decodedData.pickName,
            jobName: decodedData.jobName,
            pickerIds: []
          };
          $scope.binData.push(value);
        }
        //duplicate bin
        else {
          $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Duplicate Bin Entered!</span></div>')
          setTimeout(function () {
            $("div.alert").remove();
            $scope.$broadcast('newItemAdded');
          }, 2000);
        }
      }
      //scanned barcode is a picker's barcode
      else if ($scope.scan.length == 3) {
        //still need to check for bin as first scan will throw error
        //check if duplicate picker ID has been scanned already
        if ($scope.binData[$scope.binData.length - 1].pickerIds.indexOf($scope.scan) == -1) {
          $scope.binData[$scope.binData.length - 1].pickerIds.push($scope.scan);
console.log(decodedData.empName);
        }
        //duplicate picker
        else {
          $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Duplicate Picker Entered!</span></div>')
          setTimeout(function () {
            $("div.alert").remove();
            $scope.$broadcast('newItemAdded');
          }, 2000);
        }
      }
      //scanned barcode is invalid type
      else {
        $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Invalid Barcode Type!</span></div>')
        setTimeout(function () {
          $("div.alert").remove();
          $scope.$broadcast('newItemAdded');
        }, 2000);
      }

      $scope.displayBinData = $scope.binData.slice().reverse();
      $scope.scan = null;
      $scope.$broadcast('newItemAdded');
console.log($scope.displayBinData);

    });
  };

$scope.editScan = function(barcode){
  // var index =  $scope.binData.indexOf(barcode);
  //  if (index > -1) {
  //       $scope.binData.splice(index, 1);
  //   }
  //   $scope.displayBinData = $scope.binData.slice().reverse();
  //   $scope.$broadcast('newItemAdded');
};

$scope.removeScan = function(barcode){
  var index =  $scope.binData.indexOf(barcode);
  if (index > -1) {
    $scope.binData.splice(index, 1);
  }
  $scope.displaybinData = $scope.binData.slice().reverse();
  $scope.$broadcast('newItemAdded');
};

$scope.submitLoad = function(){

  orchardRunService.GetLoadId({idType: 'or'}, function(data){
    $scope.loadId = data.loadId;
    var load = {
      loadData: {
        loadType: 'or',
        loadId: $scope.loadId,
        truckDriverId: $scope.truckDriver.id,
        truckDriverName: $scope.truckDriver.name,
        loadDateTime: moment($scope.loadDateTime).format('YYYY-MM-DD kk:mm:ss'),
        truckId: $scope.truck.id,
        truckName: $scope.truck.name,
        loadComments: $scope.loadComments
      },
      binData: $scope.binData
    };
    orchardRunService.SubmitLoad(load);
    orchardRunService.SaveData(load);
    $location.url('/orchard_run_report');
  });
};

$scope.clearBinData = function(){
  $scope.binData = [];
  $scope.scan=null;
  $scope.$broadcast('newItemAdded');
  $scope.displayBinData = $scope.binData.slice().reverse();
};

$scope.cancelLoad = function(){
  $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Cancelled</span></div>')
  setTimeout(function () {
    $("div.alert").remove();
  }, 2000);
  $scope.clearBinData();
  $scope.$broadcast('newItemAdded');
};
}]);
