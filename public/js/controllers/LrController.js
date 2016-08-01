'use strict';

angular.module('crist_farms')

.controller('LrController', ['$scope','LoadRunService',
 function ($scope, loadRunService) {
   console.log(loadRunService.GetData());
 }]);
