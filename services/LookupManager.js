// Returns a single [bin's properties or employee's name] from its full tag
const db = require("./DatabaseManager");
const query = require("./QueryManager");
const asynch = require("async");

module.exports = {
  //Check if bin has entered db
  BinCheck: function(req,res) {
    query.standardStack(db, res, 'SELECT `Bin ID` AS binId FROM bin_table WHERE `Bin ID` = ?', [req.query.binId]);
  },

  //Take bin's IDs and return full names to frontend
  BinLookup: function(req,res) {
    var resObject = {error: false, errorProp: null};
    query.connectOnly(db)
    .then(results => {
      return new Promise (function (resolve, reject) {
        var idObject = module.exports.decodeBarcode(req.query.barcode, false);
        asynch.eachOf(idObject, function(value, property, callback) {
          property = property.slice(0,-2);
          //SELECT `block name` AS prop FROM `block_table` WHERE `block ID` = [yourBlockId]
          query.queryOnly(results.connection, 'SELECT `'+ property +' Name` AS prop FROM `'+ property +'_table` WHERE `'+ property + ' ID` = ?', [value])
          .then(results => {
            if (results.data.length ==1) {
              resObject[property + 'Name'] = results.data[0].prop;
            }
            else {
              resObject[property + 'Name']='ERROR!';
              resObject.error = true;
              resObject.errorProp = property.toUpperCase();
            }
              callback();
          })
          .catch(error => {
            callback(error);
          });
        },
        function(error) {
          if (error) reject(error);
          else resolve({connection: results.connection});
        });
      })
    })
    .then(results => {
      results.connection.release();
      res.json(resObject);
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      res.json({error: true, message: error.data.name + ' ' + error.data.message});
      console.error(error.data);
    })
  },

  decodeBarcode : function(barcode, boolean) {
    var values = {
      blockId: barcode.substring(0, 3),
      varietyId: barcode.substring(3, 5),
      strainId: barcode.substring(5, 7),
      bearingId: barcode.substring(7, 8),
      treatmentId: barcode.substring(8, 9),
      pickId: barcode.substring(9, 10),
      jobId: barcode.substring(10, 14)
    };
    if (boolean) values.binId = barcode.substring(14, 19);
    return values;
  },

  GetJobs: function (req, res) {
    query.standardStack(db, res, 'SELECT `Job ID` AS id, `Job Name` AS name FROM job_table', null);
  }
}
