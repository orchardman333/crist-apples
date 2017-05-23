'use strict';

angular.module('crist_farms')
.service('OrchardRunService', ['$http', function($http) {
  var thisData = [];
  var service = {};

  service.SubmitLoad = function(data) {
    $http.post("/api/orchardRunManager/", data).then(function(response) { /* probably need to do something here */});
  };

  service.GetLoadReport = function(callback) {
    $http.get("/api/LoadReports/").then(function(response) {
      callback(response.data);
    });
  };

  service.GetLoadId = function(data, callback) {
    $http.post("/api/loadId/", data).then(function(response) {
      callback(response.data);
    });
  };

  service.LookupBin = function(data, callback) {
    $http.post("/api/BinLookup/", data).then(function(response) {
      callback(response.data);
    });
  };

  service.SaveData = function(data) {
    thisData = data;
  };

  service.GetData = function() {
    return thisData;
  };

  return service;
}]);
