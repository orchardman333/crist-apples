'use strict';

angular.module('crist_farms').service('EmployeeService', ['$http', function ($http){
  // this service handles retrieving the employee data from API

  this.GetEmployees = function(callback) {
    $http.get("/api/employees").then(response => {
      callback(response.data);
    });
  };

  this.GetManagers = function(callback) {
    $http.get("/api/managers").then(response => {
      callback(response.data);
    });
  };

  this.LookupEmployee = function(data, callback) {
    $http.get("/api/employee", {params:{employeeId: data.employeeId}}).then(response => {
      callback(response.data);
    });
  };
}]);
