'use strict';
var app = angular.module('crist_farms', ['ngRoute', 'jkuri.datepicker']);

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
        .when('/#', {
            controller: 'HomeController',
            templateUrl: 'js/views/home.html',
        })
        .when('/load_run', {
            controller: 'LoadRunController',
            templateUrl: 'js/views/load_run.html',
        })
        .when('/pack_bin', {
            controller: 'PackBinController',
            templateUrl: 'js/views/pack_bin.html',
        })
        .when('/storage_transfer', {
            controller: 'StorageTransferController',
            templateUrl: 'js/views/storage_transfer.html',
        })
        .when('/time_form', {
            controller: 'TimeFormController',
            templateUrl: 'js/views/time_form.html',
        })
        .when('/lr', {
            controller: 'LrController',
            templateUrl: 'js/views/lr.html',
        })
        .when('/load_report', {
            controller: 'LoadReportController',
            templateUrl: 'js/views/load_report.html',
        })
        .otherwise({ redirectTo: '/#' });
}]);

app.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on(attr.focusOn, function(e) {
          elem[0].focus();
      });
   };

});
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
