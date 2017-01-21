// databaseManager.js
// ========

var db   = require("./DatabaseManager").pool;
module.exports = {
  GetTruckDrivers: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("SELECT `Employee ID` AS uid, `Employee First Name` AS first_name, `Employee Last Name` AS last_name FROM employee_table WHERE `Truck Driver`", function(err, rows, fields) {
          if (err) throw err;

          var driverList = [];
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            driverList.push({
              name: row.first_name + " " + row.last_name,
              id: row.uid
            });
          }
          callback(driverList);
        });
        connection.release();
      });
    }

    getData(function(driverList){
      res.json(driverList);
    });
  }
};
