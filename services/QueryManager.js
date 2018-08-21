// Some reusable code for connecting and querying the database
const fs = require("fs");

module.exports = {
  standardStack: function (db, res, queryString, queryValues) {
    connect(db)
    .then(results => {
      return queryDb(results.connection, queryString, queryValues);
    })
    .then(results => {
      results.connection.release();
      res.json(results.data);
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      res.json({error: true, message: error.data.name + ' ' + error.data.message})
    })
  },
  connectOnly: connect,
  queryOnly: queryDb,
  writeFile: writeSql,

  insert: function (dbConnection, values, tableName) {
    if (values.length > 0) {
      return queryDb(dbConnection, 'INSERT INTO ' + tableName + ' VALUES ?', [values]);
    }
    else {
      return Promise.resolve({connection: dbConnection, sql:''});
    }
  },

  updateStorage: function (connection, loadId, storageId) {
    return queryDb(connection, 'UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = ? WHERE `Load ID` = ?', [loadId, storageId, loadId])
  },
  updatePack: function (connection, loadId, packoutId) {
    return queryDb(connection, 'UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = NULL, `Packout ID` = ? WHERE `Load ID` = ?', [loadId, packoutId, loadId])
  },
  updateSale: function (connection, loadId, soldToId, cbTicketId) {
    return queryDb(connection, 'UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = NULL, `Sold To` = ?, `CB Ticket` = ? WHERE `Load ID` = ?', [loadId, soldToId, cbTicketId, loadId])
  }
};

//Promisify async functions
function connect(database) {
  return new Promise (function(resolve, reject) {
    database.getConnection(function(error, dbConnection) {
      if (error) reject({getConnectionError: true, data: error});
      else resolve({connection: dbConnection});
    });
  });
}

function queryDb(dbConnection, queryString, queryValues) {
  return new Promise (function (resolve, reject) {
    var query = dbConnection.query(queryString, queryValues, function(error, results, fields) {
      if (error) reject({connection: dbConnection, data: error, sql: query.sql});
      else resolve({connection: dbConnection, data: results, sql: query.sql});
    });
    console.log(query.sql);
  });
}

function writeSql(file, data, options) {
  return new Promise (function (resolve, reject) {
    fs.writeFile(file, data, options, function(error) {
      if (error) reject(error);
      else resolve(null);
    });
  });
}
