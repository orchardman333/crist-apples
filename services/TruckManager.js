// databaseManager.js
// ========
var db   = require("./DatabaseManager").pool;
module.exports = {
  GetTrucks: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("SELECT `Truck ID` AS uid, `Truck Name` AS truck_name FROM truck_table", function(err, rows, fields) {
          connection.release();
          if (err) throw err;

          var truckList = [];
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            truckList.push({
              id: row.uid,
              name: row.truck_name
            });
          }
          callback(truckList);
        });
      });
    }

    getData(function(truckList){
      res.json(truckList);
    });
  }
};
