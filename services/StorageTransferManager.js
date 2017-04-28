// StorageTransferManager.js
// ========
var db = require("./DatabaseManager");
var decode = require("./BarcodeDecodingManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of extra load information
//req.body.binData = object array of bin and employee (picker) barcode
module.exports = {
  TransferBins: function (req,res) {
    var barcodeProperties = {};
    var binValues = [];
    var boxesValues = [];
    var loadHeadingValues = [];
    var loadValues = [];
    //Ignore foreign key contraints
    //sqlStatements.push("SET FOREIGN_KEY_CHECKS=0;");

    //Push load_heading_table INSERTs
    insertIntoLoadHeadingTable(loadHeadingValues, req.body.loadData);

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      barcodeProperties = decode.decodeBarcode(req.body.binData[i].barcode);

        //Push bin_table & load_table INSERTs to sqlStatements
        insertIntoBinTable(binValues, barcodeProperties, req.body.binData[i]);
        insertIntoLoadTable(loadValues, barcodeProperties.binId, req.body.binData[i].storageId, req.body.loadData.loadId);

        //Pickers
        for (var j=0; j < req.body.binData[i].pickerIds.length; j++) {
            insertIntoBoxesTable(boxesValues, req.body.binData[i].pickerIds[j], barcodeProperties.binId)
          }
        }

insert(loadHeadingValues, 'load_heading_table', function () {
  insert(binValues, 'bin_table', function () {
    insert(loadValues, 'load_table', function () {
      insert(boxesValues, 'boxes_table', function () {
        console.log('done')
      });
    });
  });
});

        res.send("Data Saved!")

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

function insertIntoBinTable(binValues, barcodeProperties, binData) {
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

function insertIntoLoadHeadingTable(loadHeadingValues, loadData) {
    loadHeadingValues.push([
      loadData.loadType,
      loadData.loadId,
      loadData.truckDriverId,
      loadData.loadDateTime,
      loadData.truckId,
      loadData.loadComments]
);
  };

function insertIntoLoadTable(loadValues, binId, storageId, loadId) {
    loadValues.push([loadId,
      binId,
      storageId]);

  };

function insertIntoBoxesTable(boxesValues, employeeId, binId) {
    boxesValues.push(
      [binId,
      employeeId]
    );  //picker, not truck driver
  };
