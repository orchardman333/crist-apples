// Retrieve truck drivers
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetTruckDrivers: function (res) {
    var getData = function(callback){
      var truckDriverList = [];
      db.getConnection(function(err, connection) {
        connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Truck Driver`', function(error, results, fields) {
          connection.release();
          for (var i=0; i<results.length; i++) {
            truckDriverList.push({
              id: results[i].id,
              name: results[i].firstName + ' ' + results[i].lastName
            });
          }
          callback(truckDriverList);
        });
      });
    };

    getData(function(truckDriverList){
      res.json(truckDriverList);
    });
  }
};
