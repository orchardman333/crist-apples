// ReplacementLabelManager

var db = require("./DatabaseManager");
var decode = require("./LookupManager");
var asynch = require("async");

module.exports = {
  ReplacementValues: function (res) {
    //var tables = ['block', 'variety', 'strain', 'bearing', 'treatment', 'pick', 'job'];
    standardQueryStack(res, queryString, null)
  }
}

// My standard database query flow
// Get connection, send query, return results or error
function standardQueryStack (res, query, parameters) {
  dbConnectionTo(db)
  .then(function (successfulDbConnection) {
    queryDb(successfulDbConnection, query, parameters)
    .then(function (results) {
      res.json(results);
    })
    .catch(function (e) {
      res.json(e);
    })
  })
  .catch(function (e) {
    res.json(e);
  });
}

// Obtain MySQL connection to database
// return promise with successful connection or error
function dbConnectionTo (database) {
  return new Promise (function (resolve, reject) {
    database.getConnection(function (error, connection) {
      if (error) reject(error);
      else resolve(connection);
    });
  });
}

// Send query to database
// return promise with successful results or error
function queryDb(dbConnection, queryString, sqlValues) {
  return new Promise (function (resolve, reject) {
    var query = dbConnection.query(queryString, sqlValues, function(error, results, fields) {
      if (error) reject(error);
      else {
        dbConnection.release();
        resolve(results)
      }
      console.log(query.sql);
    });
  });
}

var queryString = `SELECT
bvs_table.\`Block ID\`,
block_table.\`Block Name\`,
bvs_table.\`Variety ID\`,
variety_table.\`Variety Name\`,
bvs_table.\`Strain ID\`,
strain_table.\`Strain Name\`

FROM bvs_table

INNER JOIN block_table ON bvs_table.\`Block ID\` = block_table.\`Block ID\`
INNER JOIN variety_table ON bvs_table.\`Variety ID\` = variety_table.\`Variety ID\`
INNER JOIN strain_table ON bvs_table.\`Strain ID\` = strain_table.\`Strain ID\``
queryString = queryString.replace(/\n/g, ' ')    // Removes new-line characters
