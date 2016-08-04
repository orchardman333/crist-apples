// databaseManager.js
// ========
var mysql   = require("mysql");
var db   = require("./DatabaseManager");
module.exports = {
  GetTrucks: function (res) {
    var getData = function(callback){
      var conn = db.connection;
      conn().query("select `Truck ID` AS uid from truck_table", function(err, rows, fields) {
        if (err) throw err;

        var truckList = [];
        for(var x=0; x<rows.length; x++){
          var row = rows[x];
          truckList.push({
            id: row.uid
          });
        }
        callback(truckList);
      });
      conn().end();
    }

    getData(function(truckList){
      res.json(truckList);
    });
  }
};
