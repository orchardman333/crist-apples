'use strict';

angular.module('crist_farms')

.controller('TimeFormController', ['$scope', '$location', 'EmployeeService', 'TimeFormService', function ($scope, $location, employeeService, timeFormService) {
  employeeService.GetEmployees(function (data) {
    $scope.employeeList = data;
    $scope.employee = $scope.employeeList[0];
  });
  $scope.jobId = 'h001';
  $scope.shiftStatusOptions = [{boolean:null, name:'Please Select!'}, {boolean:true, name:'Shift In'}, {boolean:false, name:'Shift End'}];
  $scope.shiftStatus = $scope.shiftStatusOptions[0];      //true for shifting in, false for shifting out
  $scope.submit = function() {
    if ($scope.shiftStatus.boolean != null) {
      var data = {
        employeeId: $scope.employee.id,
        shiftIn: $scope.shiftStatus.boolean,
        jobId: $scope.jobId,
        managerId: '000'
      }
      console.log(data);
      timeFormService.submitTimeRecord(data);

      $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Time Record Submitted!</span></div>')
      setTimeout(function () {
        $("div.alert").remove();
      }, 2000);
      $location.url('/time_form')
    }

    else {
      console.log('NULLNULLNULL');
    }
  }
}]);
