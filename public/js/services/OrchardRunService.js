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
  service.GetReplacements = function(callback) {
    $http.get("/api/replacementvalues/").then(function(response) {
      callback(response.data);
    });
  };
  service.GetLoadId = function(data, callback) {
    $http.get("/api/loadId/", {params:{idType: data.idType}}).then(function(response) {
      callback(response.data);
    });
  };

  service.BinLookup = function(data, callback) {
    $http.get("/api/binlookup/", {params:{barcode: data.barcode}}).then(function(response) {
      callback(response.data);
    });
  };

  service.BinCheck = function(data, callback) {
    $http.get("/api/bincheck/", {params:{binId: data.binId}}).then(function(response) {
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
