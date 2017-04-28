// Retrieve trucks
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetTrucks: function (res) {
    var getData = function(callback){
      var truckList = [];
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT `Truck ID` AS id, `Truck Name` AS name FROM truck_table', function(error, results, fields) {
          connection.release();
          for(var i=0; i<results.length; i++){
            truckList.push({
              id: results[i].id,
              name: results[i].name
            });
          }
          callback(truckList);
        });
        console.log(query.sql);
      });
    };

    getData(function(data){
      res.json(data);
    });
  }
};
