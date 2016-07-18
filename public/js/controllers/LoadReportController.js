'use strict';

angular.module('crist_farms')

.controller('LoadReportController', ['$scope',
 function ($scope) {
     //rowCollection
     var rowCollection = [];
     var person = {
       lastName: 'Ross',
       firstName: 'Scott'
     }

     var person2= {
       lastName: 'Crist',
       firstName: 'Jedd'
     }
     rowCollection.push(person);
     rowCollection.push(person2);

     $scope.rowCollection=rowCollection;
 }]);
