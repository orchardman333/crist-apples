'use strict';

angular.module('crist_farms')

.controller('LrController', ['$scope','LoadRunService',
 function ($scope, loadRunService) {
     $scope.rowCollection = [];
     var barCodes = loadRunService.GetData().barCodes;

     console.log( barCodes[0]);
     $scope.truck_driver = barCodes[0].truck_driver.name;
     $scope.truck_id = barCodes[0].truck_driver.id;
     $scope.date = barCodes[0].date;

     $scope.CurrentDate = new Date();

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

       console.log(barCodes[i].barcode.length);

       if (barCodes[i].barcode.length > 13)
       {
         $scope.rowCollection.push({
          bin_id: barCodes[i].bin_id,
          block_names: barCodes[i].blockName,
          variety: barCodes[i].variety,
          storage: barCodes[i].storage.id,
          truck_driver: barCodes[i].truck_driver.id,
          nr_boxes : barCodes[i].nr_boxes,
          comments: barCodes[i].comments,
          pickers : eeList.join(","),
          strainName : barCodes[i].strainName
        });
       }
     }
 }]);
