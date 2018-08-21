'use strict';

angular.module('crist_farms')
.controller('OrchardRunReportController', ['$scope','OrchardRunService',
function ($scope, orchardRunService) {
  $scope.timeSubmitted = new Date(Date.now());
  $scope.load = orchardRunService.GetOrchRunData();
  
  $scope.getBushelSum = function(items) {
    return items.map(a=>a.bushels).reduce((b,c)=>b+c,0);
  };

  $scope.downloadPDF = function() {
    var doc = new jsPDF('landscape');

    var res1 = doc.autoTableHtmlToJson(document.getElementById("header-table"));
    doc.autoTable(res1.columns, res1.data, {startY: 20, theme: 'plain'});
    let first = doc.autoTable.previous;

    var res2 = doc.autoTableHtmlToJson(document.getElementById("bins-table"));
    doc.autoTable(res2.columns, res2.data, {startY: first.finalY + 5, theme: 'plain'});
    
    document.getElementById("print").data = doc.output('datauristring');
    doc.autoPrint();
    doc.save($scope.load.loadData.load.id);
  }
}]);