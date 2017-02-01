'use strict';

angular.module('crist_farms')
.controller('OrchardRunLoadController', ['$scope', 'OrchardRunService', 'StorageTransferService', 'TruckService',
function ($scope, orchardRunService, storageTransferService, truckService) {
$scope.$watch('loadData', function() {
  console.log($scope.loadData);
});
$scope.$watch('displayLoadData', function() {
  console.log($scope.displayLoadData);
});
  // Set default values
  $scope.scan = null;
  $scope.loadData = [];
  $scope.displayLoadData = $scope.loadData.slice().reverse();
  $scope.pickDate = moment().format('YYYY-MM-DD');
  $scope.boxesCount = 20;
  //$scope.binComments = null;
  //$scope.loadComments = null;
  $scope.loadDate = moment().format('YYYY-MM-DD');
  $scope.loadDateTime = moment().format('YYYY-MM-DD hh:mm:00');


  truckService.GetTrucks(function(data) {
    $scope.truckList=data;
    $scope.truck=$scope.truckList[0];
  });

  truckService.GetTruckDrivers(function(data) {
    $scope.truckDriverList=data;
    $scope.truckDriver=$scope.truckDriverList[0];
  });

  storageTransferService.GetStorageList(function(data) {
    $scope.storageList = data;
    $scope.storage=$scope.storageList[0];
  });

  $scope.addScan = function() {
    orchardRunService.DecodeBarcode({barCode: $scope.scan}, function(decodedData) {
      if ($scope.loadData.map(function(a) {return a.barcode}).indexOf($scope.scan) == -1){
        if ($scope.scan.length == 19){   //Bin barcode
          var value = {
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
            jobName: decodedData.jobName,
            pickerIds: []
          };
          $scope.loadData.push(value);
        }
        else if ($scope.scan.length == 3){   //Picker barcode
          //check for bin as first scan
          if ($scope.loadData[$scope.loadData.length - 1].pickerIds.indexOf($scope.scan) == -1){
            $scope.loadData[$scope.loadData.length - 1].pickerIds.push($scope.scan);
          }
          else {
            $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Duplicate Picker Entered!</span></div>')
            setTimeout(function () {
              $("div.alert").remove();
              $scope.$broadcast('newItemAdded');
            }, 2000);
          }
        }

        else {
          $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Invalid Barcode Entered!</span></div>')
          setTimeout(function () {
            $("div.alert").remove();
            $scope.$broadcast('newItemAdded');
          }, 2000);
        }
      }


    else {
      $('#alert_placeholder').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>Duplicate Bin Entered!</span></div>')
      setTimeout(function () {
        $("div.alert").remove();
        $scope.$broadcast('newItemAdded');
      }, 2000);
    }

        $scope.displayLoadData = $scope.loadData.slice().reverse();
        $scope.scan = null;
        $scope.$broadcast('newItemAdded');
      });

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
