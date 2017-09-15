// Retrieve next load number in respective sequence
// ========
const db   = require("./DatabaseManager");
const query = require("./QueryManager")

module.exports = {
  GetLoadId: function (req,res) {
    var idType = req.query.idType + ' id';
    query.connectOnly(db)
    .then(connection => {
      return Promise.all([connection, query.queryOnly(connection, 'SELECT ?? AS num FROM load_sequence_table', [idType])]);
    })
    .then(results => {
      return Promise.all([results[0], results[1], query.queryOnly(results[0], 'UPDATE load_sequence_table SET ?? = ?? + 1', [idType, idType])]);
    })
    .then(results => {
      results[0].release();
      res.json({loadId: results[1][0].num});
    })
    .catch(error => {
      console.error(error);
      res.json({error: true, id: error.name, message: error.message})
    })
  }
};
