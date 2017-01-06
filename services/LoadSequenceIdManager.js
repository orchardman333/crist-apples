// databaseManager.js
// ========
var db   = require("./DatabaseManager").pool;
module.exports = {
  getSequence: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("UPDATE loadsequence_table SET id=id+1", function(err, rows, fields) {
          if (err) throw err;
          connection.commit(function(err) {
            connection.query("select id from loadsequence_table", function(err, rows, fields){
              var data={};
              for(var x=0; x<rows.length; x++){
                var row = rows[x];
                 data={ id : row.id};
              }
              connection.release();
              callback(data);
            });
          });
        });
      });
    }
    getData(function(data){
      res.json(data);
    });
  }
};
