'use strict';

angular.module('crist_farms')
.controller('DailyTimeReportController', ['$scope','TimeFormService', function ($scope, timeFormService) {
	$scope.timeData = [];
  $scope.date = new Date(Date.now() - 86400000);
  var doc;
  var res;
  var departmentIds = ['PM','P1','P2','P3','PY','M'];
  $scope.departments = [];
  for (const i of departmentIds) {
    $scope.departments.push({id: i, selected:false})
  };

  $scope.generatePDF = function() {
    doc = new jsPDF();
    timeFormService.GetDailyTime({date: $scope.date, departmentIds: $scope.departments.filter(a=>a.selected).map(b=>b.id)}, response => {
      $scope.timeData = response.timeData;
      //Set date on PDF same as query to db
      doc.text('Daily Time Report: ' + moment($scope.date).format('dddd YYYY-MM-DD'), 14, 16);
    });
  };
    
  // Sum all hours propery of object array
 $scope.getHoursSum = items => items.map(a=>a.hours).reduce((b,c)=>b+c,0).toFixed(3);


 $scope.downloadPDF = () => {
  res = doc.autoTableHtmlToJson(document.getElementById("hours-table"));
  doc.autoTable(res.columns, res.data, {startY: 20});
  document.getElementById("print").data = doc.output('datauristring');
  doc.save();
 }
        //Datepickers
        $scope.dateOptions = {
        	maxDate: new Date($scope.date.getFullYear()+1, 11, 31),
        	minDate: new Date($scope.date.getFullYear()-1, 0, 1),
        	startingDay: 0,
        	showWeeks: false
        };

        $scope.openDate = function(property) {
        	$scope.popup[property] = true;
        };

        $scope.popup = {};
  // $scope.check = function () {
  // 	console.log($scope.departments);
  // 	console.log($scope.departments.filter(a=>a.selected).map(b=>b.id));
  // }
}]);
