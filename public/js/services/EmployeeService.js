'use strict';

angular.module('crist_farms')
.service('EmployeeService', ['$http', function ($http){
  // this service handles retrieving the trucks and truck drivers data from API
  var service = {};
  service.GetEmployees = function(callback){
    $http.get("/api/employees").then(function(response){
      callback(response.data);
    });
  }

return service;
}]);
