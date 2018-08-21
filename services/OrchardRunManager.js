//Submit load of orchard run bins to database
//Take JSON list of barcode scans and accompanying data (e.g., storage, truck driver, pickers, etc.)

//req.body.loadData = object of load heading information
//req.body.binData = object array of bin and picker (employee) barcodes

// [bbb][vv][ss][n][t][p][jjjj][binid]
// h01 mc ld b u 1 p100 10000
// h01mcldbu1p10010000
// ========
const db = require("./DatabaseManager");
const query = require("./QueryManager")
const decode = require("./LookupManager");


module.exports = {
  LoadBins: function (req,res) {
    //Helper variables to convert request object to usable form for INSERT functions
    var barcodeProperties = {};
    var binValues = [];
    var bushelValues = [];
    var loadBinValues = [];
    var loadHeadingValues = [];
    //String to be written to log
    var log = '';
    //Object response to API call
    var responseObject = {};

    //Create data structure for load_heading_table INSERT
    insertIntoLoadHeadingArray(loadHeadingValues, req.body.loadData);

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      //Parse bin barcode
      barcodeProperties = decode.decodeBarcode(req.body.binData[i].barcode, true);

      //Create data structure for bin_table & load_table INSERTs
      insertIntoBinArray(binValues, barcodeProperties, req.body.binData[i], req.body.loadData.load.id);
      insertIntoLoadArray(loadBinValues, barcodeProperties.bin.id, req.body.binData[i].storage.id, req.body.loadData.load.id);

      //Iterate through one bin's pickers (if any)
      if (req.body.binData[i].pickerIds.length > 0) {
        for (var j=0; j < req.body.binData[i].pickerIds.length; j++) {

          //Create data structure for bushels_picker_table INSERT
          insertIntoBoxesArray(bushelValues, req.body.binData[i].pickerIds[j], barcodeProperties.bin.id);
        }
      }
    }

    //Promise chain of INSERTing to database, writing logs, and responding to request 
    //Obtain database connection from pool
    query.connectOnly(db)
    //INSERT to tables
    .then(results => {
      return query.insert(results.connection, loadHeadingValues, 'load_heading_table');
    })
    .then(results => {
      log += results.sql + "\n";
      return query.insert(results.connection, binValues, 'bin_table');
    })
    .then(results => {
      log += results.sql + "\n";
      return query.insert(results.connection, loadBinValues, 'load_bins_table');
    })
    .then(results => {
      log += results.sql + "\n";
      return query.insert(results.connection, bushelValues, 'bushels_picker_table');
    })
    .then(results => {
      if (results.sql !== '') log += results.sql + "\n";
      results.connection.release();
      responseObject.dbInsert = {message: 'Load inserted to database successfully', error: false};
      return null;
    })
    //Catch any errors from INSERTing
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      log += "\n" + error.data.name + "\n" + error.data.message;
      responseObject.dbInsert = {message: error.data.name + ' ' + error.data.message, error: true};
      console.error(error.data);
      return null;
    })
    .then(results => {
      log += JSON.stringify(req.body);
      return query.writeFile(__dirname + '/../logs/' + req.body.loadData.load.id + '.txt', log, {encoding: 'utf8', flag: 'a'});
    })
    .then(results => {
      responseObject.writeLog = {message: 'Log written successfully', error: false};
      return null;
    })
    .catch(error => {
      responseObject.writeLog = {message: error.name + ' ' + error.message, error: true};
      console.error(error);
      return null;
    })
    .then(results => {
      res.json(responseObject);
      console.log('END OF LOAD ' + loadHeadingValues[0][1]);
    });
  }
};

//Create data structures for INSERT statements
function insertIntoBinArray(binValues, barcodeProperties, binData, loadId) {
  binValues.push([
    barcodeProperties.bin.id,
    barcodeProperties.block.id,
    barcodeProperties.variety.id,
    barcodeProperties.strain.id,
    barcodeProperties.treatment.id,
    barcodeProperties.pick.id,
    barcodeProperties.job.id,
    binData.pickDate,
    binData.bushels,
    binData.binComments,
    loadId,
    binData.storage.id,
    null,
    null,
    null
  ]);
};

function insertIntoLoadHeadingArray(loadHeadingValues, loadData) {
  loadHeadingValues.push([
    loadData.load.type,
    loadData.load.id,
    loadData.truckDriver.id,
    loadData.loadDateTime,
    loadData.truck.id,
    loadData.loadComments,
    null,
    null
  ]);
};

function insertIntoLoadArray(loadValues, binId, storageId, loadId) {
  loadValues.push([loadId, binId, storageId]);
};

function insertIntoBoxesArray(boxesValues, employeeId, binId) {
  boxesValues.push([binId, employeeId]);  //picker, not truck driver
};
