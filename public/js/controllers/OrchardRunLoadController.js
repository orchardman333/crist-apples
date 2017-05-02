'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', '$location', '$timeout', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, $location, $timeout, orchardRunService, storageTransferService, truckService) {
  var currentDateTime = new Date(Date.now());
  $scope.pickDate = currentDateTime;
  $scope.loadDateTime = currentDateTime;
  $scope.scan = null;
  $scope.boxesCount = 20;
  $scope.binComments = null;
  $scope.loadComments = null;
  $scope.binData = [];

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
    //blank scan
    if ($scope.scan === null) {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'No Barcode Entered!';
      $timeout(function() {
        $scope.error = false;
      }, 2000);
      $scope.$broadcast('newItemAdded');
    }
    //scanned barcode is a bin's barcode
    else if ($scope.scan.length == 19) {
      orchardRunService.DecodeBarcode({barCode: $scope.scan}, function(decodedData) {
        console.log(decodedData.error);
        //error in lookupManager
        if (decodedData.error) {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'No ' + decodedData.errorProp + ' Found!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 2000);
          $scope.$broadcast('newItemAdded');
        }
        //lookupManager OK
        else {
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
            $scope.scan = null;
            $scope.$broadcast('newItemAdded');
          }
          //duplicate bin
          else {
            $scope.error = true;
            $scope.errorColor = 'danger';
            $scope.errorMessage = 'Duplicate Bin Entered!';
            $timeout(function() {
              $scope.error = false;
              $scope.scan = null;
            }, 2000);
            $scope.$broadcast('newItemAdded');
          }
        }
      });
    }
    //scanned barcode is a picker's barcode
    else if ($scope.scan.length == 3) {
      orchardRunService.DecodeBarcode({barCode: $scope.scan}, function(decodedData) {
        //check for bin as first scan
        if ($scope.binData.length == 0) {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'Need Bin First!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 2000);
          $scope.$broadcast('newItemAdded');
        }
        //error in lookupManager
        else if (decodedData.error) {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'No ' + decodedData.errorProp + ' Found!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 2000);
          $scope.$broadcast('newItemAdded');
        }
        //check if duplicate picker ID has been scanned already
        else if ($scope.binData[$scope.binData.length - 1].pickerIds.indexOf($scope.scan) == -1) {
          $scope.binData[$scope.binData.length - 1].pickerIds.push($scope.scan);
          $scope.scan = null;
          $scope.$broadcast('newItemAdded');
        }
        //duplicate picker
        else {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'Duplicate Picker Entered!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 2000);
          $scope.$broadcast('newItemAdded');
        }
      });
    }
    //scanned barcode is invalid type
    else {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'Invalid Barcode Type!';
      $timeout(function() {
        $scope.error = false;
        $scope.scan = null;
      }, 2000);
      $scope.$broadcast('newItemAdded');
    }
  };

  $scope.removeScan = function(barcode){
    var index =  $scope.binData.indexOf(barcode);
    if (index > -1) {
      $scope.binData.splice(index, 1);
    }
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
      orchardRunService.SaveData(load);
      orchardRunService.SubmitLoad(load);
      $location.url('/orchard_run_report');
    });
  };

  $scope.clearScan = function(){
    $scope.scan=null;
    $scope.$broadcast('newItemAdded');
  };

  $scope.clearBinData = function(){
    $scope.binData = [];
    $scope.scan = null;
    $scope.$broadcast('newItemAdded');
  };

  $scope.cancelLoad = function(){
    $scope.error = true;
    $scope.errorColor = 'warning';
    $scope.errorMessage = 'Load Canceled!';
    $timeout(function() {
      $scope.error = false;
    }, 2000);
    $scope.clearBinData();
    $scope.$broadcast('newItemAdded');
  };
}]);
