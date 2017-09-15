'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', '$location', '$timeout', '$uibModal', 'OrchardRunService', 'EmployeeService', 'StorageService', 'TruckService',
function ($scope, $location, $timeout, $uibModal, orchardRunService, employeeService, storageService, truckService) {

  //Date and Time variable initializing
  var currentDateTime = new Date(Date.now());
  $scope.pickDate = currentDateTime;
  $scope.loadDate = currentDateTime;
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

  storageService.GetStorageList(function(data) {
    $scope.storageList = data;
    $scope.storage=$scope.storageList[0];
  });

  $scope.addScan = function(event) {
    //blank scan
    if ($scope.scan == null) {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'No Barcode Entered!';
      $timeout(function() {
        $scope.error = false;
      }, 2000);
    }
    //scanned barcode is a bin's barcode
    else if ($scope.scan.length == 19) {
      $scope.$broadcast('toggle');
      //check if Bin ID has been entered in db already
      orchardRunService.BinCheck({binId: $scope.scan.slice(-5)}, function(decodedData) {
        //bin already exists, discard scan
        if (decodedData.exists) {
          $scope.error = true;
          $scope.errorColor = 'danger';
          $scope.errorMessage = 'Bin already found in database!';
          $timeout(function() {
            $scope.error = false;
            $scope.scan = null;
          }, 2000);
          $scope.$broadcast('toggle');
          $scope.$broadcast('refocus');
        }
        //bin does not exist, continue checks
        else {
          //check if duplicate bin ID has been scanned on form already
          if ($scope.binData.map(a => a.barcode).map(b => b.slice(-5)).indexOf($scope.scan.slice(-5)) === -1) {
            orchardRunService.BinLookup({barcode: $scope.scan}, function(decodedData) {
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
              $scope.$broadcast('toggle');
              $scope.$broadcast('refocus');
            });
          }
          //duplicate bin in form
          else {
            $scope.error = true;
            $scope.errorColor = 'danger';
            $scope.errorMessage = 'Duplicate Bin Entered!';
            $timeout(function() {
              $scope.error = false;
              $scope.scan = null;
            }, 2000);
            $scope.$broadcast('toggle');
            $scope.$broadcast('refocus');
          }
        }
      });
    }

    //scanned barcode is a picker's barcode
    else if ($scope.scan.length == 6) {
      //check to make sure at least one bin is present
      if ($scope.binData.length <= 0) {
        $scope.error = true;
        $scope.errorColor = 'danger';
        $scope.errorMessage = 'Need Bin First!';
        $timeout(function() {
          $scope.error = false;
          $scope.scan = null;
        }, 2000);
      }
      //check if duplicate picker ID has been scanned already
      else if ($scope.binData[$scope.binData.length - 1].pickerIds.indexOf($scope.scan) == -1) {
        $scope.$broadcast('toggle');
        employeeService.LookupEmployee({employeeId: $scope.scan}, function(decodedData) {
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
          //picker ID not found in database
          else if (decodedData.length == 0) {
            $scope.error = true;
            $scope.errorColor = 'danger';
            $scope.errorMessage = 'No Employee ID Found!';
            $timeout(function() {
              $scope.error = false;
              $scope.scan = null;
            }, 2000);
          }
          else {
            //good scan
            $scope.binData[$scope.binData.length - 1].pickerIds.push($scope.scan);
            $scope.scan = null;
          }
          $scope.$broadcast('toggle');
          $scope.$broadcast('refocus');
        });
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
  $scope.removePicker = function(indexBin, indexPicker){    //bin object
    $scope.binData[indexBin].pickerIds.splice(indexPicker, 1);
    $scope.refocus();
  }
  var submitLoad = function(){
    if ($scope.binData.length===0){
      alertModal({titleMessage: 'No bins on load!', color: 'btn-danger'})
      return;
    }
    orchardRunService.GetLoadId({idType: 'or'}, function(data){
      $scope.loadId = data.loadId;
      var loadDateTime = new Date($scope.loadDate.getFullYear(),$scope.loadDate.getMonth(),$scope.loadDate.getDate(),$scope.loadTimeHour, $scope.loadTimeMinute, 0, 0);
      for (var i=0; i<$scope.binData.length; i++) {
        $scope.binData[i].pickDate = moment($scope.binData[i].pickDate).format('YYYY-MM-DD');
      }
      var load = {
        loadData: {
          load: {type:'or', id: $scope.loadId},
          truckDriver: $scope.truckDriver,      //object
          loadDateTime: moment(loadDateTime).format('YYYY-MM-DD kk:mm:ss'),
          truck: $scope.truck,                //object
          loadComments: $scope.loadComments,
          buyer: null,
          packoutId: null
        },
        binData: $scope.binData
      };
      orchardRunService.SaveData(load);
      orchardRunService.SubmitLoad(load, function (data){
        if (data.error) {
          alertModal({titleMessage: data.message, color: 'btn-danger'})
        }
        else {
          $location.url('/orchard_run_report');
        }
      });
    });
  }

  $scope.clearScan = function(){
    $scope.scan=null;
    $scope.refocus();
  }

  var clearLoad = function(){
    $scope.error = true;
    $scope.errorColor = 'warning';
    $scope.errorMessage = 'Load Canceled!';
    $timeout(function() {
      $scope.error = false;
    }, 2000);
    $scope.binData = [];
    $scope.scan = null;
    $scope.refocus();
  }

  //Get Replacement Values
  var foundReplacements = false;
  var getReplacements = function () {
    if (!foundReplacements) {
      orchardRunService.GetReplacements(function(data) {
        data.bvs.sort((a,b)=> a.blockName.localeCompare(b.blockName));
        $scope.repList = data;
        $scope.repBvs = $scope.repList.bvs[0];
        $scope.repBearing = $scope.repList.bearing[0];
        $scope.repTreatment = $scope.repList.treatment[0];
        $scope.repPick = $scope.repList.pick[0];
        $scope.repJob = $scope.repList.job[0];
        foundReplacements = true;
      });
    }
  }
  //ReplacementValues
  $scope.showReplacements = function () {
    $scope.replaceLabel = true;
    getReplacements();
  }
  $scope.cancelReplacements = () => $scope.replaceLabel = false;

  $scope.buildReplacementBarcode = function () {
    $scope.scan = $scope.repBvs.blockId
    .concat($scope.repBvs.varietyId,$scope.repBvs.strainId,$scope.repBearing.id, $scope.repTreatment.id,$scope.repPick.id,$scope.repJob.id);
    $scope.refocus();
    $scope.replaceLabel = false;
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
        callback();
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
      // Alert modals
      var alertModal = function (options) {
        var modalInstance = $uibModal.open({
          templateUrl: 'js/views/modal_alert.html',
          keyboard: false,
          controller: function($scope) {
            Object.assign($scope, options)    //copy options properties into $scope
          }
        });
      }

      //Datepickers
      $scope.dateOptions = {
        maxDate: new Date($scope.pickDate.getFullYear()+1, 11, 31),
        minDate: new Date($scope.pickDate.getFullYear()-1, 0, 1),
        startingDay: 0,
        showWeeks: false
      };

      $scope.openDate = function(property) {
        $scope.popup[property] = true;
      }

      $scope.popup = {};
    }]);
