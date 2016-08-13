var db   = require("./DatabaseManager").pool;
module.exports = {
  GetStorageList: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("select `Storage ID` AS uid, `type` as storage_type, `Farm ID` as farm_id from storage_table", function(err, rows, fields) {
          if (err) throw err;
          var storageList = [];
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            storageList.push({
              name: row.storage_type,
              id: row.uid
            });
          }
          callback(storageList);
        });
        connection.release();
      });
    };
    getData(function(storageList){
      res.json(storageList);
    });
  }
};
