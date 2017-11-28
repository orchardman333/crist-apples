'use strict';

angular.module('crist_farms')
.controller('PackDumpLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'EmployeeService', 'StorageService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, employeeService, storageService, truckService) {

  //Date and Time variable initializing
  //Object.assign($scope, storageService.timeRefresh());
  Object.assign($scope, orchardRunService.timeOptions());

  $scope.focused = false;
  $scope.scan = null;
  $scope.loadComments = null;
  $scope.binData = [];

  truckService.GetTruckDrivers(data => {
    $scope.truckDriverList = data;
    $scope.truckDriver = $scope.truckDriverList.filter(a => a.id === 'GONARM')[0];
  });

  $scope.addScan = function() {
    //blank scan
    if ($scope.scan === null) alertError({message: 'No Barcode Entered!'});
    //scanned barcode is a bin's barcode
    else if ([5,19].indexOf($scope.scan.length) > -1) {
      if ($scope.scan.length === 19) {
        $scope.scan = $scope.scan.slice(-5);
      }
      //check if duplicate bin ID has been scanned on form already
      if ($scope.binData.indexOf($scope.scan) === -1) {
        $scope.$broadcast('toggle');
        //check if Bin ID has been entered in db
        orchardRunService.BinCheck({binId: $scope.scan}, function(decodedData) {
          //bin exists
          if (decodedData.length === 1) {
            $scope.binData.push({binId: $scope.scan});
            $scope.scan = null;
          }
          //bin check fails
          else alertError({message: 'Bin not found in database!'});
          $scope.$broadcast('toggle');
          $scope.$broadcast('refocus');
        });
      }
      //duplicate bin
      else alertError({message: 'Duplicate Bin Entered!'});
    }

    //scanned barcode is invalid type
    else alertError({message: 'Invalid Barcode Type!'});
  }
  $scope.refocus = function() {
    $scope.$broadcast('refocus');
  }

  $scope.removeScan = function(index){    //bin object
    $scope.binData.splice(index, 1);
    $scope.$broadcast('refocus');
  }

  var submitLoad = function() {
    if ($scope.binData.length === 0) {
      alertModal({message: 'No bins on load!', error: true})
      return;
    }
    if ($scope.packoutId == null) {
      alertModal({message: 'No Packout Number Entered!', error: true})
      return;
    }
    orchardRunService.GetLoadId({idType: 'pk'}, function(data) {
      $scope.loadId = data.loadId;
      var loadDateTime = new Date(Date.now());
      var load = {
        loadData: {
          load: {type:'pk', id: $scope.loadId},
          truckDriver: $scope.truckDriver,      //object
          loadDateTime: moment(loadDateTime).format('YYYY-MM-DD kk:mm:ss'),
          truck: {id: 'fkl'},                //object
          loadComments: $scope.loadComments,
          storage: {id: 'pk'},
          buyer: null,
          packoutId: $scope.packoutId
        },
        binData: $scope.binData
      };

      storageService.SubmitStorageTransfer(load, function (data) {
        alertModal(data, 2000);
        if (!data.error) {
          clearLoad(false);
          storageService.timeRefresh();
        }
      });
    });
  }

  $scope.clearScan = function(){
    $scope.scan = null;
    $scope.$broadcast('refocus');
  }

  var clearLoad = function (boolean) {
    if (boolean) alertError({message: 'Load Canceled!', color: 'danger'});
    $scope.binData = [];
    $scope.scan = null;
    $scope.$broadcast('refocus');
  }

  //Alerts
  var alertError = function (options) {
    $scope.error = true;
    $scope.errorColor = options.color? options.color : 'danger';
    $scope.errorMessage = options.message;
    $timeout(function() {
      $scope.error = false;
    }, options.time? options.time : 3000);
  }

  //Confirmation modals
  var confirmationModal = function (options, callback) {
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/modal_confirmation.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        Object.assign($scope, options)    //copy options properties into $scope
      }
    });
    modalInstance.result.then(function(confirmation) {
      if (confirmation) {
        callback(true);
      }
    });
  }

  $scope.submitLoadButton = function() {
    confirmationModal(
      {
        titleMessage:'Are you sure you want to submit the load?',
        confirmColor:'btn-success',
        confirmMessage: 'Yes, I\'m sure!',
        dismissColor:'btn-warning',
        dismissMessage: 'No, take me back!'
      },
      submitLoad)
    }

    $scope.clearLoadButton = function() {
      confirmationModal(
        {
          titleMessage:'Are you sure you want to cancel load?',
          confirmColor:'btn-success',
          confirmMessage: 'Yes, I\'m sure!',
          dismissColor:'btn-warning',
          dismissMessage: 'No, take me back!'
        },
        clearLoad)
      }

      // Alert modal
      var alertModal = function (object, time) {
        var modalInstance = $uibModal.open({
          templateUrl: 'js/views/modal_alert.html',
          backdrop: 'static',
          keyboard: false,
          controller: function($scope) {
            $scope.titleMessage = object.message;
            $scope.color = object.error? 'btn-danger' : 'btn-success';
          }
        });
        if (!object.error) {
          $timeout(function() {
            modalInstance.close(1);
          }, time);
        }
      }
    }]);
