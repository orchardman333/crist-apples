'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, storageTransferService, truckService) {

  //Date and Time variable initializing
  var currentDateTime = new Date(Date.now());
  $scope.pickDate = currentDateTime;
  $scope.loadDate = currentDateTime;
  $scope.loadTimeHour = currentDateTime.getHours();
  $scope.hourOptions = [{name:'8 (AM)',value:8},{name:'9 (AM)',value:9},{name:'10 (AM)',value:10},{name:'11 (AM)',value:11},{name:'12 (PM)',value:12},{name:'1 (PM)',value:13},{name:'2 (PM)',value:14},{name:'3 (PM)',value:15},{name:'4 (PM)',value:16},{name:'5 (PM)',value:17},{name:'6 (PM)',value:18},{name:'7 (PM)',value:19}]
  $scope.loadTimeMinute = Math.floor(currentDateTime.getMinutes()/5)*5;
  $scope.minuteOptions = [{name:'00',value:0},{name:'05',value:5},{name:'10',value:10},{name:'15',value:15},{name:'20',value:20},{name:'25',value:25},{name:'30',value:30},{name:'35',value:35},{name:'40',value:40},{name:'45',value:45},{name:'50',value:50},{name:'55',value:55}]
$scope.focused = false;
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
        }
        //lookupManager OK
        else {
          //check if duplicate bin ID has been scanned already
          if ($scope.binData.map(function(a) {return a.barcode.slice(-5)}).indexOf($scope.scan.slice(-5)) == -1) {
            var value = {
              barcode: $scope.scan,
              pickDate : $scope.pickDate,
              boxesCount: $scope.boxesCount,
              binComments: $scope.binComments,
              storage: $scope.storage,    //object
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
        }
        //check if duplicate picker ID has been scanned already
        else if ($scope.binData[$scope.binData.length - 1].pickerIds.indexOf($scope.scan) == -1) {
//good scan
          $scope.binData[$scope.binData.length - 1].pickerIds.push($scope.scan);
          $scope.scan = null;
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
    }
  };
$scope.refocus = function() {
$scope.$broadcast('refocus');
console.log('event');
}
  $scope.removeScan = function(barcode){
    var index =  $scope.binData.indexOf(barcode);
    if (index > -1) {
      $scope.binData.splice(index, 1);
$scope.refocus();
    }
  };

  $scope.submitLoad = function(){

    orchardRunService.GetLoadId({idType: 'or'}, function(data){
      $scope.loadId = data.loadId;
      $scope.loadDateTime = new Date($scope.loadDate.getFullYear(),$scope.loadDate.getMonth(),$scope.loadDate.getDate(),$scope.loadTimeHour, $scope.loadTimeMinute, 0, 0);
      for (var i=0; i<$scope.binData.length; i++) {
$scope.binData[i].pickDate = moment($scope.binData[i].pickDate).format('YYYY-MM-DD');
}
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
    $scope.refocus();
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
    $scope.refocus();
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

  $scope.openDate = function(property) {
    $scope.popup[property] = true;
  };

  $scope.popup = {};
  //
  // $scope.popupPick = {
  //   opened: false
  // };
}]);
