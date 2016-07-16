'use strict';

angular.module('crist_farms')

.controller('LoadRunController', ['$scope',
 function ($scope) {

   $scope.barCodes = [];

   $scope.submit = function(){

     // Determine if barcode is a bin vs. employee
     // 25 - Bin Barcode
     // Other - employee
     var typeOfBarCode = "";
     if ($scope.scan.length == 25){
       typeOfBarCode = "BIN";

     }
     else {
       typeOfBarCode = "Emplyoee";
     }

     var value = {
       barcode: $scope.scan,
       typeBarCode:typeOfBarCode
     }
     $scope.barCodes.push(value);
     $scope.scan = "";
     $scope.$broadcast('newItemAdded');
   }

 }]);
