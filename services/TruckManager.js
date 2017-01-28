// Retrieve trucks
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetTrucks: function (res) {
    var getData = function(callback){
      var truckList = [];
      db.getConnection(function(err, connection) {
        connection.query("SELECT `Truck ID` AS id, `Truck Name` AS name FROM truck_table", function(err, rows, fields) {
          connection.release();
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            truckList.push({
              id: row.id,
              name: row.name
            });
          }
          callback(truckList);
        });
      });
    };

    getData(function(truckList){
      res.json(truckList);
    });
  }
};
