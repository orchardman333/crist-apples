'use strict';

angular.module('crist_farms').service('OrchardRunService', ['$http', function($http) {
  var thisData = [];
  var service = {};

  service.SubmitLoad = function(data, callback) {
    $http.post("/api/orchardRunManager/", data).then(function(response) {
      callback(response.data);
    });
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

  service.BinLookup = function(data, callback) {
    $http.post("/api/BinLookup/", data).then(function(response) {
      callback(response.data);
    });
  };

  service.BinCheck = function(data, callback) {
    $http.post("/api/BinCheck/", data).then(function(response) {
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
