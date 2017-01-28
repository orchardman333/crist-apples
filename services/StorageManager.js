// Retrieve storage rooms
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetStorageList: function (res) {
    var getData = function(callback){
      var storageList = [];
      db.getConnection(function(err, connection) {
        connection.query("select `Storage ID` AS id, `Storage Name` AS name from storage_table", function(err, rows, fields) {
        connection.release();
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            storageList.push({
              id: row.id,
              name: row.name
            });
          }
          callback(storageList);
        });
      });
    };

    getData(function(storageList){
      res.json(storageList);
    });
  }
};
