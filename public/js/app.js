'use strict';
var app = angular.module('crist_farms', ['ngRoute', 'ui.bootstrap', 'angular.filter']);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
  .when('/', {
    controller: 'HomeController',
    templateUrl: 'js/views/home.html',
  })
  .when('/orchard_run_load', {
    controller: 'OrchardRunLoadController',
    templateUrl: 'js/views/orchard_run_load.html',
  })
  .when('/orchard_run_report', {
    controller: 'OrchardRunReportController',
    templateUrl: 'js/views/orchard_run_report.html',
  })
  .when('/pack_dump_load', {
    controller: 'PackDumpLoadController',
    templateUrl: 'js/views/pack_dump_load.html',
  })
  .when('/storage_transfer_load', {
    controller: 'StorageTransferLoadController',
    templateUrl: 'js/views/storage_transfer_load.html',
  })
  .when('/orchard_run_sale', {
    controller: 'OrchardRunSaleController',
    templateUrl: 'js/views/orchard_run_sale.html',
  })
  .when('/orchard_sale_report', {
    controller: 'OrchardSaleReportController',
    templateUrl: 'js/views/orchard_sale_report.html',
  })
  .when('/time_form', {
    controller: 'TimeFormController',
    templateUrl: 'js/views/time_form.html',
  })
  .when('/outside_time', {
    controller: 'OutsideTimeController',
    templateUrl: 'js/views/outside_time.html',
  })
  .otherwise({ redirectTo: '/' });
}]);

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('').html5Mode({
    enabled: true,
    requireBase: false
  });
}]);

app.directive('myFocus', function() {
  return function(scope, element, attrs) {
    scope.$on(attrs.myFocus, function() {
      element[0].focus();
    });
  };
});

app.directive('myInputToggle', function() {
  return function(scope, element, attrs) {
    scope.$on(attrs.myInputToggle, function() {
      element.prop("disabled", !element.prop("disabled"));
    });
  };
});

app.directive('myEnter', function () {
  return function (scope, element, attrs) {
    element.on("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.myEnter);
        });
        event.preventDefault();
      }
    });
  };
});
