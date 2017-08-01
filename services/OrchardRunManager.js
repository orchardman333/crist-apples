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

    insert(loadHeadingValues, 'load_heading_table', function () {
      insert(binValues, 'bin_table', function () {
        insert(loadValues, 'load_table', function () {
          insert(boxesValues, 'boxes_table', function () {
            console.log('end of load')
            res.json({message: 'Hooray!'})
          });
        });
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
