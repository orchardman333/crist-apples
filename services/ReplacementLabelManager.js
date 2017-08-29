// ReplacementLabelManager

var db = require("./DatabaseManager");
var asynch = require("async");

module.exports = {
  ReplacementValues: function (res) {
    var object = {};
    var properties = ['bvs', 'bearing', 'treatment', 'pick', 'job'];
    var queries = [bvsQueryString,
                  'SELECT `bearing ID` AS id, `bearing Name` AS name FROM `bearing_table`',
                  'SELECT `treatment ID` AS id, `treatment Name` AS name FROM `treatment_table`',
                  'SELECT `pick ID` AS id, `pick Name` AS name FROM `pick_table`',
                  'SELECT `job ID` AS id, `job Name` AS name FROM `job_table`'];

      dbConnectionTo(db).then(function(connection) {
        asynch.eachOf(queries, function(query, index, callback) {
          var sqlQuery = connection.query(query, function(error, results, fields) {
            if (error) callback(error)
            else {
              object[properties[index]] = results;
              callback();
            }
          });
          console.log(sqlQuery.sql);
        },
        function(err) {
          if (err) res.json(err);
          else res.json(object);
          connection.release();
        }
      );
    })
    .catch(function (e) {
      res.json(e)
    })
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
        resolve(results)
      }
      console.log(query.sql);
    });
  });
}

var bvsQueryString = `SELECT
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
bvsQueryString = bvsQueryString.replace(/\n/g, ' ')    // Removes new-line characters
