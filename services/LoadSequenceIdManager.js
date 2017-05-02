// databaseManager.js
// ========
var db   = require("./DatabaseManager");
module.exports = {
  GetLoadId: function (req,res) {
    var num = '';
    var idType = req.body.idType + ' id';
    //likely don't need callback here, need to escape query values
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT `' + idType + '`  AS num FROM load_sequence_table', function(error, results, fields) {
          if (error) throw error
          var data= {loadId: results[0].num};
          var query = connection.query('UPDATE load_sequence_table SET `' + idType + '` = `' + idType + '` + 1', function(error, results, fields) {
            if (error) throw error
            connection.release();
            callback(data);
          });
          console.log(query.sql);
        });
        console.log(query.sql);
      });
    };

    getData(function(data){
      res.json(data);
    });
  }
};
