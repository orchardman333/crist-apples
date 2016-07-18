'use strict';

angular.module('crist_farms')
.service('LoadRunService', ['$http',
 function ($http) {
   // this service will handle the get and post of Load Run Data
   var service = {};

   service.SubmitLoadRun = function(data){
     $http.post("/api/loadRun/", data ).then(function (result) {
       console.log(data + " " + result);
     });
   };

   return service;
 }]);
