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
    .then(connection => {
      // var promiseArray = [connection];
      // for (var i=0; i<=queryStrings; i++) {
      //   promiseArray.push(query.queryCallback(connection, queryStrings[i], null));
      // }
      // return Promise.all(promiseArray);
      return Promise.all([connection, query.queryOnly(connection, queryStrings[0], null), query.queryOnly(connection, queryStrings[1], null), query.queryOnly(connection, queryStrings[2], null), query.queryOnly(connection, queryStrings[3], null), query.queryOnly(connection, queryStrings[4], null)])
    })
    .then(results => {
      results[0].release();
      res.json({bvs: results[1], bearing: results[2], treatment: results[3], pick: results[4], job: results[5]});
    })
    .catch(error => {
      res.json({error: true, id: error.name, message: error.message})
    });
  }
}
