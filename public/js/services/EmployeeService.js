'use strict';

angular.module('crist_farms')
.service('EmployeeService', ['$http',
 function ($http) {
   // this service handles retrieving the truck drivers data from API
   var service = {};
   service.GetTruckDrivers = function(callback){
     $http.get("/api/truck_drivers/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };

   service.GetTrucks = function(callback){
     $http.get("/api/truck/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };
   return service;
 }]);
