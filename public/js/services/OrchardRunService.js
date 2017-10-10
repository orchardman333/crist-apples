'use strict';

angular.module('crist_farms').service('OrchardRunService', ['$http', function($http) {
  var thisData = [];
  var service = {};

  service.SubmitLoad = function(data, callback) {
    $http.post("/api/orchardRunManager/", data).then(response => {
      callback(response.data);
    });
  };

  service.GetLoadReport = function(callback) {
    $http.get("/api/LoadReports/").then(response => {
      callback(response.data);
    });
  };
  service.GetReplacements = function(callback) {
    $http.get("/api/replacementvalues/").then(response => {
      callback(response.data);
    });
  };
  service.GetLoadId = function(data, callback) {
    $http.get("/api/loadId/", {params:{idType: data.idType}}).then(response => {
      callback(response.data);
    });
  };

  service.BinLookup = function(data, callback) {
    $http.get("/api/binlookup/", {params:{barcode: data.barcode}}).then(response => {
      callback(response.data);
    });
  };

  service.BinCheck = function(data, callback) {
    $http.get("/api/bincheck/", {params:{binId: data.binId}}).then(response => {
      callback(response.data);
    });
  };

  service.SaveData = function(data) {
    thisData = data;
  };

  service.GetData = function() {
    return thisData;
  };

  //Initialize load datetime and pick date for OR Load only
  service.timeSet = function () {
    var pickDate = new Date(Date.now());
    var loadDate = pickDate;
    var loadTimeHour, loadTimeMinute;
    if (loadDate.getMinutes() > 55) {
      loadTimeMinute = 0;
      if (loadDate.getHours() >= 23) loadTimeHour = 0;
      else loadTimeHour = loadDate.getHours()+1;
    }
    else {
      loadTimeMinute = Math.ceil(loadDate.getMinutes()/5)*5;
      loadTimeHour = loadDate.getHours();
    }
    return {
      pickDate: pickDate,
      loadDate: loadDate,
      loadTimeHour: loadTimeHour,
      loadTimeMinute: loadTimeMinute
    };
  };

  //Time Picker <select> options
  service.timeOptions = function() {
    var hourOptions = [{name: 'Midnight', value: 0},{name: '12 PM', value: 12},{name: '1 AM', value: 1},{name: '1 PM', value: 13}];
    var minuteOptions = [{name:'00',value:0},{name:'05',value:5}];
    for (var i=2; i<12; i++) {
      hourOptions.push({name: i + ' AM', value: i},{name: i + ' PM', value: i+12});
      minuteOptions.push({name:(''+5*i)+'',value:5*i});
    }
    hourOptions.sort((a,b) => a.value-b.value)

    return {
      hourOptions: hourOptions,
      minuteOptions: minuteOptions
    };
  };

  return service;
}]);
