'use strict';

angular.module('crist_farms')
.controller('PackDumpLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'EmployeeService', 'StorageService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, employeeService, storageService, truckService) {

  //Date and Time variable initializing
  var timeRefresh = function (){
    $scope.loadDate = new Date(Date.now());
    if ($scope.loadDate.getMinutes()>55) {
      $scope.loadTimeMinute = 0;
      $scope.loadTimeHour = $scope.loadDate.getHours()+1;
    }
    else {
      $scope.loadTimeMinute = Math.ceil($scope.loadDate.getMinutes()/5)*5;
      $scope.loadTimeHour = $scope.loadDate.getHours();
    }
  }
  timeRefresh();
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
    else if ([5,19].indexOf($scope.scan.length) > -1) {
      if ($scope.scan.length === 19) {
        $scope.scan = $scope.scan.slice(-5);
      }
      //check if duplicate bin ID has been scanned on form already
      if ($scope.binData.indexOf($scope.scan) == -1) {
        $scope.$broadcast('toggle');
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
          $scope.$broadcast('toggle');
          $scope.$broadcast('refocus');
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

  var submitLoad = function(){
    if ($scope.binData.length===0){
      alertModal({message: 'No bins on load!', error: true})
      return;
    }
    orchardRunService.GetLoadId({idType: 'pk'}, function(data){
      $scope.loadId = data.loadId;
      //var loadDateTime = new Date($scope.loadDate.getFullYear(),$scope.loadDate.getMonth(),$scope.loadDate.getDate(),$scope.loadTimeHour, $scope.loadTimeMinute, 0, 0);
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

      storageService.SubmitStorageTransfer(load, function (resObj) {
        alertModal(resObj, 1000);
        clearLoad(false);
        timeRefresh();
      });
    });
  }

  $scope.clearScan = function(){
    $scope.scan=null;
    $scope.refocus();
  }

  var clearLoad = function (boolean) {
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
