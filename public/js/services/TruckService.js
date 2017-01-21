'use strict';

angular.module('crist_farms')
.service('TruckService', ['$http',
 function ($http) {
   // this service handles retrieving the trucks and truck drivers data from API
   var service = {};
   service.GetTruckDrivers = function(callback){
     $http.get("/api/truckDrivers/").success(function(data, status, headers, config)
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
