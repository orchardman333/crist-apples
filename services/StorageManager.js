// Retrieve storage rooms
// ========
var db = require("./DatabaseManager");

module.exports = {
  GetStorageList: function (res) {
    var storageList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Storage ID` AS id, `Storage Name` AS name from storage_table', function(error, results, fields) {
        connection.release();
        res.json(results);
      });
      console.log(query.sql);
    });
  }
};
