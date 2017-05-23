// Retrieve storage rooms
// ========
var db = require("./DatabaseManager");

module.exports = {
  GetStorageList: function (res) {
    var storageList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Storage ID` AS id, `Storage Name` AS name from storage_table', function(error, results, fields) {
        connection.release();
        for(var i=0; i<results.length; i++){
          storageList.push({
            id: results[i].id,
            name: results[i].name
          });
        }
        res.json(storageList);
      });
      console.log(query.sql);
    });
  }
};
