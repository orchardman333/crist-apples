'use strict';

angular.module('crist_farms')

.controller('TimeFormController', ['$scope','EmployeeService','TimeFormService',
 function ($scope,employeeService, timeFormService) {
   employeeService.GetTruckDrivers(function (data) {
     $scope.employees=data;
   });
   $scope.submit = function(){
     var data = {
       employee: $scope.employee,
       job_id: $scope.job_id
     }
     timeFormService.submitTimeRecord(data);

     $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Time Record Submitted!</span></div>')
            setTimeout(function () {
                $("div.alert").remove();
            }, 2000);
   };
 }]);
