'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, orchardRunService, storageTransferService, truckService){
  // Set default values

  // $scope.currentDate = function(){
  //   var d = new Date(Date.now()),
  //   month = ('00' + (d.getMonth() + 1)).slice(-2),
  //   day = ('00' + d.getDate()).slice(-2),
  //   year = d.getFullYear(),
  //   hour = d.getHours(),
  //   minute = d.getMinutes(),
  //   seconds = '00';
  //
  //   return ([year, month, day].join('-') + ' ' + [hour, minute, seconds].join(':'));
  // };

  $scope.scan = null;
  $scope.loadData = [];
  $scope.displayLoadData = $scope.loadData.slice().reverse();
  $scope.pickDate = moment().format('YYYY-MM-DD');
  $scope.boxesCount = 20;
  //$scope.binComments = null;
  //$scope.loadComments = null;
  $scope.loadDate = moment().format('YYYY-MM-DD');
  $scope.loadDateTime = moment().format('YYYY-MM-DD hh:mm:00');

  truckService.GetTrucks(function (data) {
    $scope.truckList=data;
    $scope.truck=$scope.truckList[0];
  });

  truckService.GetTruckDrivers(function (data) {
    $scope.truckDriverList=data;
    $scope.truckDriver=$scope.truckDriverList[0];
  });

  storageTransferService.GetStorageList(function (data) {
    $scope.storageList = data;
    $scope.storage=$scope.storageList[0];
  });

  $scope.addScan = function(){
    if ($scope.scan === null){
      $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>No Barcode entered!</span></div>')
      setTimeout(function () {
        $("div.alert").remove();
        $scope.$broadcast('newItemAdded');
      }, 2000);
    }
    else{
      var callback = function(decodedData){
        if ($scope.scan.length == 19){   //Bin barcode
          var value = {
            buttonColor:'success',
            type: 'bin',
            barcode: $scope.scan,
            pickDate : $scope.pickDate,
            boxesCount: $scope.boxesCount,
            binComments: $scope.binComments,
            storageId: $scope.storage.id,
            storageName: $scope.storage.name,
            blockName: decodedData.blockName,
            varietyName: decodedData.varietyName,
            strainName: decodedData.strainName,
            bearingName: decodedData.bearingName,
            treatmentName: decodedData.treatmentName,
            pickName: decodedData.pickName,
            jobName: decodedData.jobName
          };
        }
        else if ($scope.scan.length == 3){   //Picker barcode
          var value = {
            buttonColor:'info',
            type: 'emp',
            barcode: $scope.scan
          };
        }
        else {
          var value = {
            barcode: 'barcode length/type ERROR',
            buttonColor: 'danger'
          };
        }

        $scope.loadData.push(value);
        $scope.scan = null;
        $scope.$broadcast('newItemAdded');
        $scope.displayLoadData = $scope.loadData.slice().reverse();
      };

      orchardRunService.DecodeBarcode({barCode: $scope.scan}, callback);
    }
  };

  $scope.editScan = function(barcode){
    // var index =  $scope.loadData.indexOf(barcode);
    //  if (index > -1) {
    //       $scope.loadData.splice(index, 1);
    //   }
    //   $scope.displayLoadData = $scope.loadData.slice().reverse();
    //   $scope.$broadcast('newItemAdded');
  };

  $scope.removeScan = function(barcode){
    var index =  $scope.loadData.indexOf(barcode);
    if (index > -1) {
      $scope.loadData.splice(index, 1);
    }
    $scope.displayLoadData = $scope.loadData.slice().reverse();
    $scope.$broadcast('newItemAdded');
  };

  $scope.submitLoad = function(){

    orchardRunService.GetLoadId({idType: 'or'}, function(data){
      $scope.loadId = data.loadId;
      var load = {
        loadDetails: {
          loadType: 'or',
          loadId: $scope.loadId,
          truckDriverId: $scope.truckDriver.id,
          loadDate: $scope.loadDate,
          loadDateTime: $scope.loadDateTime,
          truckId: $scope.truck.id,
          loadComments: $scope.loadComments
        },
        loadData: $scope.loadData
      };
      orchardRunService.SubmitLoad(load);
      orchardRunService.SaveData(load);
      window.location = "#/orchard_run_report";
    });
  };

  $scope.clearLoadData = function(){
    $scope.loadData = [];
    $scope.scan=null;
    $scope.$broadcast('newItemAdded');
    $scope.displayLoadData = $scope.loadData.slice().reverse();
  };

  $scope.cancelLoad = function(){
    $('#alert_placeholder').html('<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Load Cancelled</span></div>')
    setTimeout(function () {
      $("div.alert").remove();
    }, 2000);
    $scope.clearLoadData();
    $scope.$broadcast('newItemAdded');
  };
}]);
