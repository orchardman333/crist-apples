'use strict';

angular.module('crist_farms')
.controller('DailyTimeReportController', ['$scope','TimeFormService', function ($scope, timeFormService) {
	var timeData = [];
	$scope.date = new Date(Date.now() - 86400000);

	$scope.departmentIds = ['PM','P1','P2','P3','PY'];
	$scope.departments = [];
	for (var i of $scope.departmentIds) {
		$scope.departments.push({id: i, selected:false})
	};

	$scope.submit = function() {
		timeFormService.GetDailyTime({date: $scope.date, departmentIds: $scope.departments.filter(a=>a.selected).map(b=>b.id)}, response => {
			$scope.timeData = response.timeData;
			console.log($scope.timeData);
		});
	};
	  $scope.getHoursSum = function(items) {
    return items.map(a=>a.hours).reduce((b,c)=>b+c,0).toFixed(3);
  };
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
