// ReplacementLabelManager

const db = require("./DatabaseManager");
const query = require("./QueryManager")
const asynch = require("async");

const bvsQuery = `SELECT
bvs_table.\`Block ID\` AS blockId,
block_table.\`Block Name\` AS blockName,
bvs_table.\`Variety ID\` AS varietyId,
variety_table.\`Variety Name\` AS varietyName,
bvs_table.\`Strain ID\` AS strainId,
strain_table.\`Strain Name\` AS strainName
FROM bvs_table
INNER JOIN block_table ON bvs_table.\`Block ID\` = block_table.\`Block ID\`
INNER JOIN variety_table ON bvs_table.\`Variety ID\` = variety_table.\`Variety ID\`
INNER JOIN strain_table ON bvs_table.\`Strain ID\` = strain_table.\`Strain ID\``
const bvsQueryString = bvsQuery.replace(/\n/g, ' ')    // Removes new-line characters

module.exports = {
  ReplacementValues: function (req, res) {
    var queryStrings = [bvsQueryString, 'SELECT `Bearing ID` AS id, `Bearing Name` AS name FROM `bearing_table`', 'SELECT `Treatment ID` AS id, `Treatment Name` AS name FROM `treatment_table`', 'SELECT `Pick ID` AS id, `Pick Name` AS name FROM `pick_table`', 'SELECT `Job ID` AS id, `Job Name` AS name FROM `job_table`'];

    query.connectOnly(db)
    .then(results => {
      return Promise.all([query.queryOnly(results.connection, queryStrings[0], null), query.queryOnly(results.connection, queryStrings[1], null), query.queryOnly(results.connection, queryStrings[2], null), query.queryOnly(results.connection, queryStrings[3], null), query.queryOnly(results.connection, queryStrings[4], null)]);
    })
    .then(results => {
      results[0].connection.release();
      res.json({bvs: results[0].data, bearing: results[1].data, treatment: results[2].data, pick: results[3].data, job: results[4].data});
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      res.json({error: true, message: error.data.name + ' ' + error.data.message})
      console.error(error.data);
    });
  }
}
