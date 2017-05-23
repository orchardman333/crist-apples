// Retrieve next load number in respective sequence
// ========
var db   = require("./DatabaseManager");

module.exports = {
  GetLoadId: function (req,res) {
    var idType = req.body.idType + ' id';
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT ?? AS num FROM load_sequence_table', [idType], function(error, results, fields) {
          if (error) throw error
          var data= {loadId: results[0].num};
          var query = connection.query('UPDATE load_sequence_table SET ?? = ?? + 1', [idType, idType], function(error, results, fields) {
            if (error) throw error
            connection.release();
            res.json(data);
          });
          console.log(query.sql);
        });
        console.log(query.sql);
      });
  }
};
