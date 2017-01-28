'use strict';

angular.module('crist_farms')
.service('TruckService', ['$http',
 function ($http){
   // this service handles retrieving the trucks and truck drivers data from API
   var service = {};
   service.GetTruckDrivers = function(callback){
     $http.get("/api/truckDrivers").then(function(response){
       callback(response.data);
     });
   };

   service.GetTrucks = function(callback){
     $http.get("/api/trucks").then(function(response){
       callback(response.data);
     });
   };
   return service;
 }]);
