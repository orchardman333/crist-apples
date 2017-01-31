'use strict';
var app = angular.module('crist_farms', ['ngRoute', 'jkuri.datepicker']);

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
        .when('/time_form', {
            controller: 'TimeFormController',
            templateUrl: 'js/views/time_form.html',
        })
        .otherwise({ redirectTo: '/' });
}]);

app.directive('focusOn', function() {
   return function(scope, element, attrs) {
      scope.$on(attrs.focusOn, function() {
          element[0].focus();
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
