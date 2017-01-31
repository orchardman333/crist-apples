// databaseManager.js
// ========
var db   = require("./DatabaseManager");
module.exports = {
  GetLoadId: function (req,res) {
    var num = '';
    var xxid = req.body.idType + " id";
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("SELECT `" + xxid + "`  AS num FROM load_sequence_table", function(err, rows, fields){
          var data={ loadId: rows[0].num};
          connection.query("UPDATE load_sequence_table SET `" + xxid + "` = `" + xxid + "` + 1", function(err, rows, fields) {
            connection.release();
            callback(data);
          });
        });
      });
    };

    getData(function(data){
      res.json(data);
    });
  }
};
