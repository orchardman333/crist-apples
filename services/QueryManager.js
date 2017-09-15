// Some reusable code for connecting and querying the database

module.exports = {
  standardStack: function (db, res, queryString, queryValues) {
    connect(db)
    .then(connection => {
      return Promise.all([connection, queryDb(connection, queryString, queryValues)]);
    })
    .then(results => {
      results[0].release();
      res.json(results[1]);
    })
    .catch(error => {
      res.json({error: true, id: error.name, message: error.message})
    })
  },
  connectOnly: connect,
  queryOnly: queryDb,

  insert: function (connection, values, tableName) {
    if (values.length > 0) {
      return Promise.all([connection, queryDb(connection, 'INSERT INTO ' + tableName + ' VALUES ?', [values])]);
    }
    else {
      return Promise.all([connection]);
    }
  },

  update: function (connection, loadId, storageId) {
    return Promise.all([connection, queryDb(connection, 'UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = ? WHERE `Load ID` = ?', [loadId, storageId, loadId])]);
  }
};

function connect(database) {
  return new Promise (function(resolve, reject) {
    database.getConnection(function(error, connection) {
      if (error) reject(error);
      else resolve(connection);
    });
  });
}

function queryDb(connection, queryString, queryValues) {
  return new Promise (function (resolve, reject) {
    var query = connection.query(queryString, queryValues, function(error, results, fields) {
      if (error) reject(error);
      else resolve(results);
    });
    console.log(query.sql);
  });
}
