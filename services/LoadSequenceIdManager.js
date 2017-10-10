// Retrieve next load number in respective sequence
// ========
const db   = require("./DatabaseManager");
const query = require("./QueryManager")

module.exports = {
  GetLoadId: function (req,res) {
    var idType = req.query.idType + ' id';
    query.connectOnly(db)
    .then(results => {
      return query.queryOnly(results.connection, 'SELECT ?? AS num FROM load_sequence_table', [idType]);
    })
    .then(results => {
      return Promise.all([results.data, query.queryOnly(results.connection, 'UPDATE load_sequence_table SET ?? = ?? + 1', [idType, idType])]);
    })
    .then(results => {
      console.log("1");
      results[1].connection.release();
      console.log("2");
      res.json({loadId: results[0][0].num});
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      console.error(error);
      res.json({error: true, message: error.data.name + ' ' + error.data.message})
    })
  }
};
