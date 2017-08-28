// Retrieve Trucks and Truck Drivers
// ========
var db   = require("./DatabaseManager");

module.exports = {
  GetTrucks: function (res) {
    var truckList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Truck ID` AS id, `Truck Name` AS name FROM truck_table', function(error, results, fields) {
        connection.release();
        res.json(results);
      });
      console.log(query.sql);
    });
  },

  GetTruckDrivers: function (res) {
    var truckDriverList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Truck Driver`', function(error, results, fields) {
        connection.release();
        for (var i=0; i<results.length; i++) {
            results[i].name = results[i].firstName + ' ' + results[i].lastName;
          }
        res.json(results);
      });
      console.log(query.sql);
    });
  }
};
