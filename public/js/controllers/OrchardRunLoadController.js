'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, storageTransferService, truckService) {
  var currentDateTime = new Date(Date.now());
  $scope.pickDate = currentDateTime;
  $scope.loadDate = currentDateTime;
  $scope.loadTime = currentDateTime;
  $scope.onChange = function() {
              document.getElementById('scan').focus();
          };
$scope.loadTimeHour = currentDateTime.getHours();
$scope.loadTimeMinute = currentDateTime.getMinutes();
if ($scope.loadTimeHour > 12) {
$scope.loadPM = true;
$scope.loadTimeHour -= 12;
}
else if ($scope.loadTimeHour == 12) {
$scope.loadPM = true;
}
else if ($scope.loadTimeHour == 0) {
$scope.loadTimeHour = 12;
}
else {
  $scope.loadPM = false;

}
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
$scope.boxesCount = 20;
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

  $scope.clearLoad = function(){
    $scope.error = true;
    $scope.errorColor = 'warning';
    $scope.errorMessage = 'Load Canceled!';
    $timeout(function() {
      $scope.error = false;
    }, 2000);
    $scope.binData = [];
    $scope.scan = null;
    $scope.$broadcast('newItemAdded');
  };

//Confirmation modals
  $scope.submitLoadButton = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/modal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        $scope.message = 'Are you sure you want to submit the load?';
        $scope.confirmColor = 'btn-success';
        $scope.dismissColor = 'btn-warning';
      }
    });
    modalInstance.result.then(function(confirmation) {
      if (confirmation) {
        $scope.submitLoad();
      }
    });
  };

  $scope.clearLoadButton = function () {
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/modal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        $scope.message = 'Are you sure you want to cancel load?';
        $scope.confirmColor = 'btn-danger';
        $scope.dismissColor = 'btn-warning';
      }
    });
    modalInstance.result.then(function(confirmation) {
      if (confirmation) {
        $scope.clearLoad();
      }
    });
  };

//Datepickers
    $scope.dateOptions = {
      maxDate: new Date($scope.pickDate.getFullYear()+1, 11, 31),
      minDate: new Date($scope.pickDate.getFullYear()-1, 0, 1),
      startingDay: 0,
      showWeeks: false
    };

    $scope.openLoadDate = function() {
      $scope.popupLoad.opened = true;
    };

    $scope.openPickDate = function() {
      $scope.popupPick.opened = true;
    };

$scope.popupLoad = {
  opened: false
};

$scope.popupPick = {
  opened: false
};



}]);
