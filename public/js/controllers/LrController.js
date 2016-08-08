'use strict';

angular.module('crist_farms')

.controller('LrController', ['$scope','LoadRunService',
 function ($scope, loadRunService) {
     $scope.rowCollection = [];
     var barCodes = loadRunService.GetData().barCodes;
     for(var i=0; i < barCodes.length; i++)
     {
       var eeList = [];
       for(var index=i+1; index < barCodes.length; index++)
       {
         if (barCodes[index].barcode.length < 13){
           eeList.push(barCodes[index].barcode);
         }
         else {
           break;
         }
       }

       if (barCodes[index].barcode.length < 13)
       {
         $scope.rowCollection.push({
          bin_id: barCodes[i].bin_id,
          block_names: barCodes[i].block_names,
          variety: barCodes[i].variety,
          storage: barCodes[i].storage.id,
          truck_driver: barCodes[i].truck_driver.name,
          nr_boxes : barCodes[i].nr_boxes,
          comments: barCodes[i].comments,
          pickers : eeList.join(",")
        });
       }
     }
 }]);
