// databaseManager.js
// ========
var mysql   = require("mysql");
var db   = require("./DatabaseManager");
module.exports = {
  getSequence: function (res) {
    var getData = function(callback){
      var conn = db.connection;
      conn().query("UPDATE load_sequence SET id=id+1", function(err, rows, fields) {
        if (err) throw err;
        conn().commit(function(err) {
          conn().query("select id from load_sequence", function(err, rows, fields){
            var data={};
            for(var x=0; x<rows.length; x++){
              var row = rows[x];
               data={ id : row.id};
            }
            callback(data);
          });
        });
      });

      conn().end();
    }
    getData(function(data){
      res.json(data);
    });
  }
};
