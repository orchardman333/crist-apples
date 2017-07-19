'use strict';

angular.module('crist_farms')

.controller('OutsideTimeController', ['$scope', '$location', '$timeout', '$uibModal', 'EmployeeService', 'TimeFormService', function ($scope, $location, $timeout, $uibModal, employeeService, timeFormService) {
  timeFormService.GetJobs(function(data) {
    $scope.jobList=data;
    $scope.job=$scope.jobList[0];
  });

  employeeService.GetManagers(function(data) {
    $scope.managerList=data;
    $scope.manager=$scope.managerList[0];
    $scope.retrieveRecords();
  });

  $scope.shiftStatusOptions = [{boolean:true, name:'Shift In'}, {boolean:false, name:'Shift End'}];
  $scope.shiftStatus = $scope.shiftStatusOptions[0];
  $scope.time = new Date(Date.now());
  if ($scope.time.getMinutes()>55) {
    $scope.timeMinutes = 0;
    $scope.timeHours = $scope.time.getHours()+1;
  }
  else {
    $scope.timeMinutes = Math.ceil($scope.time.getMinutes()/5)*5;
    $scope.timeHours = $scope.time.getHours();
  }
  $scope.hourOptions = [{name: 'Midnight', value: 0},{name: '12 PM', value: 12},{name: '1 AM', value: 1},{name: '1 PM', value: 13}];
  $scope.minuteOptions = [{name:'00',value:0},{name:'05',value:5}];
  for (var i=2; i<12; i++) {
    $scope.hourOptions.push({name: i + ' AM', value: i},{name: i + ' PM', value: i+12});
    $scope.minuteOptions.push({name:(''+5*i)+'',value:5*i});
  }
  $scope.hourOptions.sort(function(obj1,obj2){return obj1.value-obj2.value})
  $scope.workingData = [];

  $scope.addToWorkingChanges = function() {
    //blank scan
    if ($scope.scan === null) {
      $scope.error = true;
      $scope.errorColor = 'danger';
      $scope.errorMessage = 'No Barcode Entered!';
      $timeout(function() {
        $scope.error = false;
      }, 2000);
    }
    //scanned barcode is a picker's barcode
    else if ($scope.scan.length == 6) {
      //check if picker ID has been clocked-in but not clocked-out
      if ($scope.retrievedData.map(a => a.employeeId).indexOf($scope.scan) >= 0) {
        $scope.error = true;
        $scope.errorColor = 'danger';
        $scope.errorMessage = 'Employee not clocked-out yet!';
        $timeout(function() {
          $scope.error = false;
          $scope.scan = null;
        }, 2000);
      }

      else if ($scope.workingData.map(a => a.employeeId).indexOf($scope.scan) == -1) {
        employeeService.LookupEmployee({barcode: $scope.scan}, function(decodedData) {
          //error in employeeLookup
          if (decodedData.error) {
            $scope.error = true;
            $scope.errorColor = 'danger';
            $scope.errorMessage = 'No ' + decodedData.errorProp + ' Found!';
            $timeout(function() {
              $scope.error = false;
              $scope.scan = null;
            }, 2000);
          }
          //good scan
          else {
            $scope.workingData.push({employeeId:$scope.scan, employeeName: decodedData.employeeName});
            $scope.scan = null;
          }
        });
      }
      //duplicate picker
      else {
        $scope.error = true;
        $scope.errorColor = 'danger';
        $scope.errorMessage = 'Duplicate Employee Entered!';
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

  $scope.toggle = function() {
    if (!$scope.toggleAll) {
      for (var i=0; i<$scope.retrievedData.length; i++) {
        $scope.retrievedData[i].selected = true;
      }
      $scope.toggleAll=true;
    }
    else {
      for (var i=0; i<$scope.retrievedData.length; i++) {
        $scope.retrievedData[i].selected = false;
      }
      $scope.toggleAll=false;
    }
  }

  $scope.refocus = function() {
    $scope.$broadcast('refocus');
  }

  $scope.submitButton = function() {
    var data = {};
    var dateTime = new Date($scope.time.getFullYear(),$scope.time.getMonth(),$scope.time.getDate(),$scope.timeHours, $scope.timeMinutes, 0, 0);
    //shifting in
    if ($scope.shiftStatus.boolean) {
      data = {
        employeeIds: $scope.workingData.map(a => a.employeeId),
        shiftIn: true,
        time: moment(dateTime).format('YYYY-MM-DD kk:mm:ss'),
        jobId: $scope.job.id,
        managerId: $scope.manager.id
      };
      $scope.submitRecords(data);
    }
    //shifting out
    else {
        data = {
          employeeIds: $scope.retrievedData.filter(a => a.selected).map(b => b.employeeId),
          shiftIn: false,
          time: moment(dateTime).format('YYYY-MM-DD kk:mm:ss'),
          date: moment($scope.time).format('YYYY-MM-DD')
        };
        $scope.lunchModal(data);
    }
  }

  $scope.submitRecords = function(data) {
    timeFormService.submitOutsideRecords(data, function(resObj) {
      $scope.modal(resObj, 1000);
      if (!resObj.error) {
        $scope.workingData = [];
        //Allow db to finish clock-out updates before pulling
        $timeout(function() {
          $scope.retrieveRecords();
        }, 500)
      }
    });
  }
  $scope.cancel = function() {
    $scope.workingData = [];
    $scope.retrieveRecords();
  }

  $scope.removeFromWorkingChanges = function(index) {
    $scope.workingData.splice(index, 1);
    $scope.refocus();
  }

  $scope.retrieveRecords = function() {
    timeFormService.getOutsideRecords({managerId:$scope.manager.id, date: moment($scope.time).format('YYYY-MM-DD')}, function(data) {
      $scope.retrievedData = data.timeData;
      $scope.crew = data.crew;
      console.log(data.crew);
      if (data.error) {
        $scope.modal(data, 1000)
      }
    })
  }
  //Datepickers
  $scope.dateOptions = {
    maxDate: new Date($scope.time.getFullYear()+1, 11, 31),
    minDate: new Date($scope.time.getFullYear()-1, 0, 1),
    startingDay: 0,
    showWeeks: false
  };

  $scope.openDate = function(property) {
    $scope.popup[property] = true;
  }

  $scope.popup = {};

  $scope.modal = function (object, time) {
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
  $scope.lunchModal = function (data) {
    var modalInstance = $uibModal.open({
      templateUrl: 'js/views/modal.html',
      backdrop: 'static',
      keyboard: false,
      controller: function($scope) {
        $scope.message = 'Add Lunch Break?';
        $scope.confirmColor = 'btn-primary';
        $scope.dismissColor = 'btn-warning';
      }
    });
    modalInstance.result.then(function(confirmation) {
      if (confirmation){
        data.lunch=true;
        var dateTime = new Date($scope.time.getFullYear(),$scope.time.getMonth(),$scope.time.getDate(), 12, 0, 0, 0);
        data.lunchStart= moment(dateTime).format('YYYY-MM-DD kk:mm:ss');
        dateTime = new Date($scope.time.getFullYear(),$scope.time.getMonth(),$scope.time.getDate(), 12, 30, 0, 0);
        data.lunchEnd= moment(dateTime).format('YYYY-MM-DD kk:mm:ss');
      }
      $scope.submitRecords(data);
    });
  }
}]);
