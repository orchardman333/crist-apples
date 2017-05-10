'use strict';

angular.module('crist_farms')

.controller('OutsideTimeController', ['$scope', '$location', 'EmployeeService', 'TimeFormService', function ($scope, $location, employeeService, timeFormService) {
  $scope.findRecords = function() {
console.log('1');
timeFormService.getOutsideRecords({managerId:'120'}, function(data) {
$scope.data=data;
console.log(data);
})
}
console.log('2');
//$scope.findRecords();
console.log('3');
}]);
