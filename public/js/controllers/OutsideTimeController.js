'use strict';

angular.module('crist_farms')

.controller('OutsideTimeController', ['$scope', '$location', '$timeout', 'EmployeeService', 'TimeFormService', 'OrchardRunService', function ($scope, $location, $timeout, employeeService, timeFormService, orchardRunService) {

  employeeService.GetManagers(function(data) {
    $scope.managerList=data;
    $scope.manager=$scope.managerList[0];
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
  $scope.hourOptions = [{name:'8 (AM)',value:8},{name:'9 (AM)',value:9},{name:'10 (AM)',value:10},{name:'11 (AM)',value:11},{name:'12 (PM)',value:12},{name:'1 (PM)',value:13},{name:'2 (PM)',value:14},{name:'3 (PM)',value:15},{name:'4 (PM)',value:16},{name:'5 (PM)',value:17},{name:'6 (PM)',value:18},{name:'7 (PM)',value:19}];
  $scope.minuteOptions = [{name:'00',value:0},{name:'05',value:5},{name:'10',value:10},{name:'15',value:15},{name:'20',value:20},{name:'25',value:25},{name:'30',value:30},{name:'35',value:35},{name:'40',value:40},{name:'45',value:45},{name:'50',value:50},{name:'55',value:55}];
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
    else if ($scope.scan.length == 3) {
      //check if duplicate picker ID has been scanned already
      if ($scope.workingData.indexOf($scope.scan) == -1) {
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

  $scope.refocus = function() {
    $scope.$broadcast('refocus');
  }

  $scope.submitRecords = function() {
    var dateTime = new Date($scope.time.getFullYear(),$scope.time.getMonth(),$scope.time.getDate(),$scope.timeHours, $scope.timeMinutes, 0, 0);
    var data = {
      employeeIds: $scope.workingData.map(a => a.employeeId),
      shiftIn: $scope.shiftStatus.boolean,
      time: moment(dateTime).format('YYYY-MM-DD kk:mm:ss'),
      jobId: $scope.jobId,
      managerId: $scope.manager.id
    };
    timeFormService.submitOutsideRecords(data, function(response) {
      $scope.workingData = [];
      $scope.retrieveRecords();
    });
  }

  $scope.removeFromWorkingChanges = function(person) {
    var index =  $scope.workingData.indexOf(person);
    if (index > -1) {
      $scope.workingData.splice(index, 1);
    }
$scope.refocus();

}
  $scope.retrieveRecords = function() {
    timeFormService.getOutsideRecords({managerId:$scope.manager.id}, function(data) {
      $scope.retrievedData=data.timeData;
    })
  }

}]);
