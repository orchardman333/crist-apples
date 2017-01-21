'use strict';

angular.module('crist_farms')
.service('OrchardRunService', ['$http',
 function ($http) {
   var thisData = [];
   var service = {};
   service.SubmitLoadRun = function(data){
     $http.post("/api/orchardRun/", data ).then(function (result) { /* probably need to do something here */});
   };
   service.GetLoadReport = function(callback){
     $http.get("/api/LoadReports/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };

   service.GetLoadSequenceId = function(callback){
     $http.get("/api/loadSequenceId/").success(function(data, status, headers, config)
     {
       callback(data);
     });
   };


   service.SaveData = function(data){
     thisData = data;
   };

   service.DecodeBarCode = function(data, callback){
    $http.post("/api/LookupManager/", data ).then(function (result) {
      console.log(result.data);
      callback(result.data);
    });
   };

   service.GetData = function(){
     return thisData;
   };
   return service;
 }]);
