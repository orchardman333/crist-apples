'use strict';

angular.module('crist_farms')

.controller('OutsideTimeController', ['$scope', '$location', '$timeout', 'EmployeeService', 'TimeFormService', function ($scope, $location, $timeout, employeeService, timeFormService) {
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
$scope.minuteOptions = [{name:'00',value:0}];
for (var i=2; i<12; i++) {
$scope.hourOptions.push({name: i + ' AM', value: i},{name: i + ' PM', value: i+12});
$scope.minuteOptions.push({name:(5*i)+'',value:5*i});
}
$scope.hourOptions.sort(function(obj1,obj2){return obj1.value-obj2.value})
  //,{name:'05',value:5},{name:'10',value:10},{name:'15',value:15},{name:'20',value:20},{name:'25',value:25},{name:'30',value:30},{name:'35',value:35},{name:'40',value:40},{name:'45',value:45},{name:'50',value:50},{name:'55',value:55}];
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

  $scope.submitRecords = function() {
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
    }
    //shifting out
    else {
      data = {
        employeeIds: $scope.retrievedData.filter(a => a.selected).map(b => b.employeeId),
        shiftIn: false,
        time: moment(dateTime).format('YYYY-MM-DD kk:mm:ss')
      };
    }
    timeFormService.submitOutsideRecords(data, function() {
      $scope.workingData = [];
      $scope.retrieveRecords();
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
    timeFormService.getOutsideRecords({managerId:$scope.manager.id}, function(data) {
      $scope.retrievedData = data.timeData;
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
}]);
