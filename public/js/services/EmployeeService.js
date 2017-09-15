'use strict';

angular.module('crist_farms')
.service('EmployeeService', ['$http', function ($http){
  // this service handles retrieving the employee data from API
  var service = {};

  service.GetEmployees = function(callback) {
    $http.get("/api/employees").then(function(response){
      callback(response.data);
    });
  }

  service.GetManagers = function(callback) {
    $http.get("/api/managers").then(function(response){
      callback(response.data);
    });
  }

  service.LookupEmployee = function(data, callback) {
    $http.get("/api/employee", {params:{employeeId: data.employeeId}}).then(function(response) {
      callback(response.data);
    });
  };

  return service;
}]);
