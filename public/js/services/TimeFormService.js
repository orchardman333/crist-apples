'use strict';

angular.module('crist_farms')
.service('TimeFormService', ['$http', function ($http) {
  // this service handles retrieving the truck drivers data from API
  var service = {};
  service.submitTimeRecord = function(data) {
    $http.post("/api/timeForm", data ).then(function (result) { console.log(result); });
  };

  service.getOutsideRecords = function(data, callback) {
    $http.post("/api/getoutsidetime", data).then(function(response) {
      callback(response.data);
    });

    service.submitOutsideRecords = function(data, callback) {
      $http.post("/api/outsidetime", data).then(function(response) {
callback()
});
    }
  };
  return service;
}]);
