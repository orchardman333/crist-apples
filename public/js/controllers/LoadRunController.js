'use strict';

angular.module('crist_farms')

.controller('LoadRunController', ['$scope', 'LoadRunService', 'StorageService', 'EmployeeService',
 function ($scope, loadRunService, storageService, employeeService) {

   $scope.barCodes = [];
   $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   $scope.truckDrivers = [];
   $scope.storageList = [];

   employeeService.GetTruckDrivers(function (data) {
     $scope.truckDrivers=data;
   });

    storageService.GetStorageList(function (data) {
      $scope.storageList =data;
   });

   $scope.removeBarCode = function(barcode){
    var index =  $scope.barCodes.indexOf(barcode);
     if (index > -1) {
          $scope.barCodes.splice(index, 1);
      }
      $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   };

   $scope.clearData = function(){
     $scope.barCodes = [];
     $scope.scan="";
     $scope.$broadcast('newItemAdded');
     $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   };

   //console.log($scope.storageList);
   $scope.add_barcode = function(){
     var value = {
       barcode: $scope.scan,
       storage: $scope.default_storage,
       truck_driver: $scope.truck_driver
     }

     $scope.barCodes.push(value);
     $scope.scan = "";
     $scope.$broadcast('newItemAdded');
     $scope.displayBarCodes = $scope.barCodes.slice().reverse();
   };

   $scope.submit = function(){
      var data = {
        barCodes: $scope.barCodes
      };
      loadRunService.SubmitLoadRun(data);
      loadRunService.SaveData(data);
      window.location = "#/lr";
   };

   $scope.cancel = function(){
     $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Cancelled</span></div>')
            setTimeout(function () {
                $("div.alert").remove();
            }, 2000);
    $scope.clearData();
   };

 }]);
