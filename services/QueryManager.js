// Some reusable code for connecting and querying the database

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

  insert: function (dbConnection, values, tableName) {
    if (values.length > 0) {
      return queryDb(dbConnection, 'INSERT INTO ' + tableName + ' VALUES ?', [values]);
    }
    else {
      return Promise.resolve({connection: dbConnection});
    }
  },

  update: function (connection, loadId, storageId) {
    return queryDb(connection, 'UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = ? WHERE `Load ID` = ?', [loadId, storageId, loadId])
  }
};

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
      if (error) reject({connection: dbConnection, data: error});
      else resolve({connection: dbConnection, data: results});
    });
    console.log(query.sql);
  });
}
