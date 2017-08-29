// Returns a single [bin's properties or employee's name] from its full tag
'use strict'
var db = require("./DatabaseManager");
var asynch = require("async");

module.exports = {
  //Check if bin has entered db
  BinCheck: function(req,res) {
    var object={};
    db.getConnection(function(err, connection) {
        var query = connection.query('SELECT * FROM bin_table WHERE `Bin ID` = ?', [req.body.binId], function(error, results, fields) {
          try {
            object.exists = results[0]['Bin ID'] != null;
          }
          catch (e) {
            object.exists = false;
          }
          res.json(object);
          connection.release();
        });
        console.log(query.sql);
      });
  },

  //Take bin's IDs and return full names to frontend
  BinLookup: function(req,res) {
    var object={};
    db.getConnection(function(err, connection) {
      var idObject = module.exports.decodeBarcode(req.body.barcode, false);
      asynch.eachOf(idObject, function(value, property, callback) {
        property = property.slice(0,-2);
        //SELECT `block name` AS prop FROM `block_table` WHERE `block ID` = [yourBlockId]
        var query = connection.query('SELECT `'+ property +' Name` AS prop FROM `'+ property +'_table` WHERE `'+ property + ' ID` = ?', [value], function(error, results, fields) {
          try {
            object[property + 'Name'] = results[0].prop;
          }
          catch (e) {
            object[property + 'Name']='ERROR!';
            object.error = true;
            object.errorProp = property.toUpperCase();
          }
          callback();
        });
        console.log(query.sql);
      },
      function(err) {
        if (err) throw err;
        res.json(object);
        connection.release();
      }
    );
  });
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
  if (boolean) values.binId = barcode.substring(14, 19)
  return values;
},

GetJobs: function (res) {
  var jobList = [];
  db.getConnection(function(err, connection) {
    var query = connection.query('SELECT `Job ID` AS id, `Job Name` AS name FROM job_table', function(error, results, fields) {
      connection.release();
      for (var i=0; i<results.length; i++) {
        jobList.push({
          id: results[i].id,
          name: results[i].name
        });
      }
      res.json(jobList);
    });
    console.log(query.sql);
  });
}

}
