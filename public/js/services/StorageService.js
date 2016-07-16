'use strict';

angular.module('crist_farms')
.service('StorageService', ['$http',
 function ($http) {
   // this service handles retrieving the storage data from API
   var service = {};

   service.GetStorageList = function(callback){
     $http.get("/api/storage/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };

   return service;
 }]);
