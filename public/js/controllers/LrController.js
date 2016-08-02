'use strict';

angular.module('crist_farms')

.controller('LrController', ['$scope','LoadRunService',
 function ($scope, loadRunService) {
     $scope.rowCollection = [];
     var barCodes = loadRunService.GetData().barCodes;
     for(var i=0; i < barCodes.length; i++)
     {
       console.log(barCodes[i]);
       $scope.rowCollection.push({
        bin_id: barCodes[i].bin_id,
        block_names: barCodes[i].block_names,
        variety: barCodes[i].variety,
        storage: barCodes[i].storage.id,
        truck_driver: barCodes[i].truck_driver.name
      });
     }
 }]);
