'use strict';

angular.module('crist_farms')

.controller('LoadRunController', ['$scope', 'LoadRunService', 'StorageService', 'EmployeeService',
 function ($scope, loadRunService, storageService, employeeService) {

   $scope.barCodes = [];
   $scope.truckDrivers = [];
   $scope.storageList = [];

   employeeService.GetTruckDrivers(function (data) {
     $scope.truckDrivers=data;
   });

    storageService.GetStorageList(function (data) {
      $scope.storageList =data;
   });

   //console.log($scope.storageList);
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
   };

 }]);
