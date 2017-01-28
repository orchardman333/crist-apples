'use strict';

angular.module('crist_farms')
.service('StorageTransferService', ['$http',
 function ($http) {
   // this service handles retrieving the storage data from API
   var service = {};
   service.GetStorageList = function(callback){
     $http.get("/api/storage").then(function(response)
     {
       callback(response.data);
     });
   };
   return service;
 }]);
