// PakingDumpManager.js

var db = require("./DatabaseManager");
var decode = require("./LookupManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of load information
//req.body.binData = object array of BinIDs and destination storage/buyer/pack house
module.exports = {
  DumpBins: function (req,res) {
    var binId = '';
    var loadValues = [];

    //load_heading_table INSERT
    var loadHeadingValues = [loadData.load.type,
      loadData.load.id,
      loadData.truckDriver.id,
      loadData.loadDateTime,
      loadData.truck.id,
      loadData.loadComments];

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      binId = req.body.binData[i].barcode.slice(-5);

      //load_table INSERTs
      loadValues.push([loadId, binId, storageId]);
    }

    insert(loadHeadingValues, 'load_heading_table', function () {
      insert(loadValues, 'load_table', function () {
        console.log('end of load')
        res.json({message: 'Hooray!'})
      });
    });
  }
};

function insert(values, tableName, callback){
  if (values.length > 0) {
    db.getConnection(function (err, connection){
      var query = connection.query('INSERT INTO ' + tableName + ' VALUES ?', [values], function (error, results, fields) {
        if (error) throw error;
        connection.release();
        callback();
      });
      console.log(query.sql);
    });
  }
  else {
    callback();
  }
};
