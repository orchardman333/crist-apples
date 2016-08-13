// databaseManager.js
// ========

var db   = require("./DatabaseManager").pool;
module.exports = {
  GetTruckDrivers: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("select `Employee ID` AS uid, `Employee First Name` as first_name, `Employee Last Name` as last_name from employee_table", function(err, rows, fields) {
          if (err) throw err;

          var eeList = [];
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            eeList.push({
              name: row.first_name + " " + row.last_name,
              id: row.uid
            });
          }
          callback(eeList);
        });
        connection.release();
      });
    }

    getData(function(eeList){
      res.json(eeList);
    });
  }
};
