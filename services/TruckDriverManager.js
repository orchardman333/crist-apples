// Retrieve truck drivers
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetTruckDrivers: function (res) {
    var getData = function(callback){
      var truckDriverList = [];
      db.getConnection(function(err, connection) {
        connection.query("SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Truck Driver`", function(err, rows, fields) {
          connection.release();
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            truckDriverList.push({
              id: row.id,
              name: row.firstName + " " + row.lastName
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
