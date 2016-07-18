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
   $scope.add_barcode = function(){

     // Determine if barcode is a bin vs. employee
     // 25 - Bin Barcode
     // Other - employee
     var typeOfBarCode = "";
     if ($scope.scan.length > 25){
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

   $scope.submit = function(){
      $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Submitted</span></div>')
            setTimeout(function () {
                $("div.alert").remove();
            }, 2000);

      var data = {
        storage: $scope.default_storage,
        truck_driver: $scope.truck_driver,
        barCodes: $scope.barCodes
      };
      loadRunService.SubmitLoadRun(data);
   };

   $scope.cancel = function(){
     $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Cancelled</span></div>')
            setTimeout(function () {
                $("div.alert").remove();
            }, 2000);

     $scope.barCodes = [];
     $scope.scan="";
     $scope.$broadcast('newItemAdded');
   };

 }]);
