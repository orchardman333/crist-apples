'use strict';

angular.module('crist_farms').service('StorageService', ['$http', function ($http) {
  var orchRunSaleData = [];
  var storageTransferData = [];
  // this service handles retrieving the storage data from API
  this.GetStorageList = function(callback) {
    $http.get("/api/storage").then(response => {
      callback(response.data);
    });
  };

  this.SubmitStorageTransfer = function(data, callback) {
    $http.post("/api/storageTransfer/", data).then(response => {
      callback(response.data);
    });
  };

  this.SetStorageTransferData = function(data) {
    storageTransferData = data;
  };

  this.GetStorageTransferData = function() {
    return storageTransferData;
  };

  this.SetOrchRunSaleData = function(data) {
    orchRunSaleData = data;
  };

  this.GetOrchRunSaleData = function() {
    return orchRunSaleData;
  };

  this.timeRefresh = function () {
    var date = new Date(Date.now());
    var minute, hour;
    if (date.getMinutes()>55) {
      minute = 0;
      if (date.getHours() >= 23) hour = 0;
      else hour = date.getHours()+1;
    }
    else {
      minute = Math.ceil(date.getMinutes()/5)*5;
      hour = date.getHours();
    }
    return {
      date: date,
      hour: hour,
      minute: minute
    };
  };
}]);
