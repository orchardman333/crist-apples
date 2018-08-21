// Retrieve list of storage rooms
// ========
const db = require("./DatabaseManager");
const query = require("./QueryManager")

module.exports = {
  GetStorageList: function (req, res) {
    query.standardStack(db, res, 'SELECT `Storage ID` AS id, `Storage Name` AS name from storage_table', null);
  }
};
