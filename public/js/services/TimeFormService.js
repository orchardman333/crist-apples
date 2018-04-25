'use strict';

angular.module('crist_farms').service('TimeFormService', ['$http', function ($http) {
  // this service handles retrieving the truck drivers data from API
  var service = {};
  this.getTimeRecord = function(data, callback) {
    $http.get("/api/insidetime", {params:{employeeId: data.employeeId}}).then(response => {
      callback(response.data);
    });
  }
  this.submitTimeRecord = function(data, callback) {
    $http.post("/api/insidetime", data).then(response => {
      callback(response.data);
    });
  }
  this.getOutsideRecords = function(data, callback) {
    $http.post("/api/getoutsidetime", data).then(response => {
      callback(response.data);
    });
  }
  this.submitOutsideRecords = function(data, callback) {
    $http.post("/api/outsidetime", data).then(response => {
      callback(response.data);
    });
  }
  this.GetJobs = function(callback) {
    $http.get("/api/jobs").then(response => {
      callback(response.data);
    });
  }
  this.GetDailyTime = function(data, callback) {
    $http.post("/api/dailytime", data).then(response => {
      callback(response.data);
    });
  }
}]);
