'use strict';

angular.module('crist_farms')
.controller('PackDumpLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'EmployeeService', 'StorageService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, employeeService, storageService, truckService) {

  //Date and Time variable initializing
  $scope.loadDate = new Date(Date.now());
  if ($scope.loadDate.getMinutes()>55) {
    $scope.loadTimeMinute = 0;
    $scope.loadTimeHour = $scope.loadDate.getHours()+1;
  }
  else {
    $scope.loadTimeMinute = Math.ceil($scope.loadDate.getMinutes()/5)*5;
    $scope.loadTimeHour = $scope.loadDate.getHours();
  }
  $scope.hourOptions = [{name: 'Midnight', value: 0},{name: '12 PM', value: 12},{name: '1 AM', value: 1},{name: '1 PM', value: 13}];
  $scope.minuteOptions = [{name:'00',value:0},{name:'05',value:5}];
  for (var i=2; i<12; i++) {
    $scope.hourOptions.push({name: i + ' AM', value: i},{name: i + ' PM', value: i+12});
    $scope.minuteOptions.push({name:(''+5*i)+'',value:5*i});
  }
  $scope.hourOptions.sort((a,b) => a.value-b.value)

  $scope.focused = false;
  $scope.scan = null;
  $scope.loadComments = null;
  $scope.binData = [];

  truckService.GetTruckDrivers(function(data) {
    $scope.truckDriverList=data;
    $scope.truckDriver=$scope.truckDriverList.filter(a => a.id === 'GONARM')[0];
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
      $scope.scan = $scope.scan.slice(-5);
      //check if duplicate bin ID has been scanned on form already
      if ($scope.binData.indexOf($scope.scan) == -1) {
        //check if Bin ID has been entered in db
        orchardRunService.BinCheck({binId: $scope.scan}, function(decodedData) {
          //bin exists
          if (decodedData.exists) {
            $scope.binData.push($scope.scan);
            $scope.scan = null;
          }
          //bin check fails
          else {
            $scope.error = true;
            $scope.errorColor = 'danger';
            $scope.errorMessage = 'Bin not found in database!';
            $timeout(function() {
              $scope.error = false;
              $scope.scan = null;
            }, 2000);
          }
        });
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
  }
  $scope.refocus = function() {
    $scope.$broadcast('refocus');
  }
  $scope.removeScan = function(index){    //bin object
    $scope.binData.splice(index, 1);
    $scope.refocus();
  }

  $scope.submitLoad = function(){

    orchardRunService.GetLoadId({idType: 'pk'}, function(data){
      $scope.loadId = data.loadId;
      var loadDateTime = new Date($scope.loadDate.getFullYear(),$scope.loadDate.getMonth(),$scope.loadDate.getDate(),$scope.loadTimeHour, $scope.loadTimeMinute, 0, 0);
      var load = {
        loadData: {
          load: {type:'pk', id: $scope.loadId},
          truckDriver: $scope.truckDriver,      //object
          loadDateTime: moment(loadDateTime).format('YYYY-MM-DD kk:mm:ss'),
          truck: {id: 'FKL'},                //object
          loadComments: $scope.loadComments,
          storage: {id: 'PK'}
        },
        binData: $scope.binData
      };
      //orchardRunService.SaveData(load);
      storageService.SubmitStorageTransfer(load, function (resObj) {
        $scope.responseModal(resObj, 1000);
        if (!resObj.error) {
          $scope.workingData = [];
          //Allow db to finish clock-out updates before pulling
          $timeout(function (){
          }, 500)
        };
        //$location.url('/orchard_run_report');
        $scope.clearLoad(false);
      });
    });
  }

  $scope.clearScan = function(){
    $scope.scan=null;
    $scope.refocus();
  }

  $scope.clearLoad = function (boolean) {
    if (boolean) {
      $scope.error = true;
      $scope.errorColor = 'warning';
      $scope.errorMessage = 'Load Canceled!';
      $timeout(function() {
        $scope.error = false;
      }, 2000);
    }
    $scope.binData = [];
    $scope.scan = null;
    $scope.refocus();
  }

  //Confirmation modals
  $scope.responseModal = function (object, time) {
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/alert_modal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        $scope.message = object.message;
        $scope.color = object.error? 'btn-danger' : 'btn-success';
      }
    });
    if (!object.error) {
      $timeout(function() {
        modalInstance.close(1);
      }, time);
    }
  }

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
  }

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
        $scope.clearLoad(true);
      }
    });
  }

  //Datepickers
  $scope.dateOptions = {
    maxDate: new Date($scope.loadDate.getFullYear()+1, 11, 31),
    minDate: new Date($scope.loadDate.getFullYear()-1, 0, 1),
    startingDay: 0,
    showWeeks: false
  };

  $scope.openDate = function(property) {
    $scope.popup[property] = true;
  }

  $scope.popup = {};
}]);
