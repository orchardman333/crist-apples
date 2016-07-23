'use strict';

angular.module('crist_farms')
.service('LoadRunService', ['$http',
 function ($http) {
   var service = {};
   service.SubmitLoadRun = function(data){
     $http.post("/api/loadRun/", data ).then(function (result) { /* probably need to do something here */});
   };
   service.GetLoadReport = function(callback){
     $http.get("/api/LoadReports/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };
   return service;
 }]);
