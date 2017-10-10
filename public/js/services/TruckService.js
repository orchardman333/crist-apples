'use strict';

angular.module('crist_farms').service('TruckService', ['$http', function ($http){
  // this service handles retrieving the trucks and truck drivers data from API
  this.GetTruckDrivers = function(callback) {
    $http.get("/api/truckDrivers").then(response => {
      callback(response.data);
    });
  };

  this.GetTrucks = function(callback) {
    $http.get("/api/trucks").then(response => {
      callback(response.data);
    });
  };
}]);
