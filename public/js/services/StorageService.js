'use strict';

angular.module('crist_farms').service('StorageService', ['$http', function ($http) {
   // this service handles retrieving the storage data from API
   var service = {};

   service.GetStorageList = function(callback){
     $http.get("/api/storage").then(function(response) {
       callback(response.data);
     });
   };

   service.SubmitStorageTransfer = function(data, callback) {
     $http.post("/api/storageTransfer/", data).then(function(response) {
       callback(response.data);
     });
   };

   return service;
}]);
