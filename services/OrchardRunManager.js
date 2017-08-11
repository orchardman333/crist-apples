// OrchardRunManager.js
// [bbb][vv][ss][n][t][p][jjjj][binid]
// h01 mc ld b u 1 p100 10000
// h01mcldbu1p10010000
// ========
var db = require("./DatabaseManager");
var decode = require("./LookupManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of extra load information
//req.body.binData = object array of bin and employee (picker) barcode
module.exports = {
  LoadBins: function (req,res) {
    var barcodeProperties = {};
    var binValues = [];
    var boxesValues = [];
    //var loadHeadingValues = [];
    var loadValues = [];
    var error
    //load_heading_table INSERT
    var loadHeadingValues = [insertIntoLoadHeadingArray(req.body.loadData)];

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      barcodeProperties = decode.decodeBarcode(req.body.binData[i].barcode, true);

      //bin_table & load_table INSERTs
      insertIntoBinArray(binValues, barcodeProperties, req.body.binData[i]);
      insertIntoLoadArray(loadValues, barcodeProperties.binId, req.body.binData[i].storage.id, req.body.loadData.load.id);

      //Pickers
      for (var j=0; j < req.body.binData[i].pickerIds.length; j++) {
        insertIntoBoxesArray(boxesValues, req.body.binData[i].pickerIds[j], barcodeProperties.binId)
      }
    }

    // insert(loadHeadingValues, 'load_heading_table', function () {
    //   insert(binValues, 'bin_table', function () {
    //     insert(loadValues, 'load_table', function () {
    //       insert(boxesValues, 'boxes_table', function () {
    //         console.log('end of load')
    //         res.json({message: 'Hooray!'})
    //       });
    //     });
    //   });
    // });
    insert(loadHeadingValues, 'load_heading_table')
    .then(function() {
      insert(binValues, 'bin_table')
      .then(function() {
        insert(loadValues, 'load_table')
        .then(function() {
          insert(boxesValues, 'boxes_table')
          .then(function() {
            res.json({message: 'Hooray! Load entered successfully', error: false})
            console.log('end of load')
          })
          .catch(function(e) {
            res.json({message: e.name + ' ' + e.message, error: true})
          })
        })
        .catch(function(e) {
          res.json({message: e.name + ' ' + e.message, error: true})
        })
      })
      .catch(function(e) {
        res.json({message: e.name + ' ' + e.message, error: true})
      })
    })
    .catch(function(e) {
      res.json({message: e.name + ' ' + e.message, error: true})
    })
  }
}

function insert(values, tableName){
  return new Promise (function(resolve, reject) {
    if (values.length > 0) {
      db.getConnection(function (err, connection){
        var query = connection.query('INSERT INTO ' + tableName + ' VALUES ?', [values], function (error, results, fields) {
          if (error) {
            reject(error);
            console.log(error);
          }
          connection.release();
          resolve();
        });
        console.log(query.sql);
      });
    }
    else {
      resolve();
    }
  });
}

function insertIntoBinArray(binValues, barcodeProperties, binData) {
  binValues.push([
    barcodeProperties.binId,
    barcodeProperties.blockId,
    barcodeProperties.varietyId,
    barcodeProperties.strainId,
    barcodeProperties.bearingId ,
    barcodeProperties.treatmentId,
    barcodeProperties.pickId,
    barcodeProperties.jobId,
    binData.pickDate,
    binData.boxesCount,
    binData.binComments,
  ]);
};

function insertIntoLoadHeadingArray(loadData) {
  return [loadData.load.type,
    loadData.load.id,
    loadData.truckDriver.id,
    loadData.loadDateTime,
    loadData.truck.id,
    loadData.loadComments];
  };

  function insertIntoLoadArray(loadValues, binId, storageId, loadId) {
    loadValues.push([loadId,
      binId,
      storageId]);
    };

    function insertIntoBoxesArray(boxesValues, employeeId, binId) {
      boxesValues.push(
        [binId,
          employeeId]
        );  //picker, not truck driver
      };
