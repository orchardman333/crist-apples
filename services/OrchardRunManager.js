// OrchardRunManager.js
// [bbb][vv][ss][n][t][p][jjjj][binid]
// h01 mc ld b u 1 p100 10000
// h01mcldbu1p10010000
// ========
const db = require("./DatabaseManager");
const query = require("./QueryManager")
const decode = require("./LookupManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of load heading information
//req.body.binData = object array of bin and employee (picker) barcode
module.exports = {
  LoadBins: function (req,res) {
    var barcodeProperties = {};
    var binValues = [];
    var bushelValues = [];
    var loadBinValues = [];
    var loadHeadingValues = [];

    //load_heading_table INSERT
    insertIntoLoadHeadingArray(loadHeadingValues, req.body.loadData);

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      barcodeProperties = decode.decodeBarcode(req.body.binData[i].barcode, true);

      //bin_table & load_table INSERTs
      insertIntoBinArray(binValues, barcodeProperties, req.body.binData[i], req.body.loadData.load.id);
      insertIntoLoadArray(loadBinValues, barcodeProperties.binId, req.body.binData[i].storage.id, req.body.loadData.load.id);

      //Pickers
      for (var j=0; j < req.body.binData[i].pickerIds.length; j++) {
        if (req.body.binData[i].pickerIds[j] == null) continue;
        insertIntoBoxesArray(bushelValues, req.body.binData[i].pickerIds[j], barcodeProperties.binId)
      }
    }

    query.connectOnly(db)
    .then(insertLoadHeading)
    .then(insertBinValues)
    .then(insertLoadBins)
    .then(insertBushelValues)
    .then(results => {
      results[0].release();
      res.json({message: 'Hooray! Load entered successfully', error: false})
      console.log('END OF LOAD ' + loadHeadingValues[0][1])
    })
    .catch(error => {
      res.json({message: error.name + ' ' + error.message, error: true})
      console.log(error);
    });
  }
};

//Wrapper functions
function insertLoadHeading(connection) {
  return query.insert(connection, loadHeadingValues, 'load_heading_table')
}
function insertBinValues(results) {
  return query.insert(results[0], binValues, 'bin_table')
}
function insertLoadBins(results) {
  return query.insert(results[0], loadBinValues, 'load_bins_table')
}
function insertBushelValues(results) {
  return query.insert(results[0], bushelValues, 'bushels_picker_table')
}

//Create arrays for INSERT statements
function insertIntoBinArray(binValues, barcodeProperties, binData, loadId) {
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
    loadId,
    binData.storage.id
  ]);
};

function insertIntoLoadHeadingArray(loadHeadingValues, loadData) {
  loadHeadingValues.push([loadData.load.type,
    loadData.load.id,
    loadData.truckDriver.id,
    loadData.loadDateTime,
    loadData.truck.id,
    loadData.loadComments,
    loadData.buyer,
    loadData.packoutId
  ]);
};

function insertIntoLoadArray(loadValues, binId, storageId, loadId) {
  loadValues.push([loadId, binId, storageId]);
};

function insertIntoBoxesArray(boxesValues, employeeId, binId) {
  boxesValues.push([binId, employeeId]);  //picker, not truck driver
};
