// OrchardRunManager.js
// [bbb][vv][ss][n][t][p][jjjj][binid]
// h01 mc ld b u 1 p100 10000
// h01mcldbu1p10010000
// ========
var db = require("./DatabaseManager");
var decode = require("./BarcodeDecodingManager");
var sqlStatements = [];

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadDetails = object of extra load information
//req.body.loadData = object array of bin and employee (picker) barcode
module.exports = {
  LoadBins: function (req,res) {
    sqlStatements = [];   //Clear old statements
    var barcodeProperties = {};
    var nextBarcode = {};
    //Ignore foreign key contraints
    sqlStatements.push("SET FOREIGN_KEY_CHECKS=0;");

    //Push load_heading_table INSERTs
    insertIntoLoadHeadingTable(req.body.loadDetails);

    //Iterate through list of bins
    for(var i=0; i < req.body.loadData.length; i++) {
      barcodeProperties = decode.decodeBarcode(req.body.loadData[i].barcode);

        //Push bin_table & load_table INSERTs to sqlStatements
        insertIntoBinTable(barcodeProperties, req.body.loadData[i]);
        insertIntoLoadTable(barcodeProperties.binId, req.body.loadData[i].storageId, req.body.loadDetails.loadId);

        //Pickers
        for(var j=0; j < req.body.loadData[i].pickerIds.length; j++) {

            insertIntoBoxesTable(req.body.loadData[i].pickerIds[j], barcodeProperties.binId)
          }
        }
      // else if (barcodeProperties.typeBarcode != 'emp') {
      //   console.log(barcodeProperties.typeBarcode + "\nUnexpected barcode length/type in OrchardRunManager.js");
      // }

    //Send SQL to db
    db.getConnection(function(err, connection) {
      console.log(sqlStatements);
      for(var cnt=0; cnt < sqlStatements.length; cnt++)
      {
        connection.query(sqlStatements[cnt], function(err, rows, fields) {});
      }
      connection.commit(function(err) {connection.release();});
    });
    res.send("Data Saved!\n" + sqlStatements);
  }
};

var insertIntoBinTable = function(barcodeProperties, loadData) {
  var sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
    barcodeProperties.binId + "','" +
    barcodeProperties.blockId + "','" +
    barcodeProperties.varietyId + "','" +
    barcodeProperties.strainId + "','" +
    barcodeProperties.bearingId + "','" +
    barcodeProperties.treatmentId + "','" +
    barcodeProperties.pickId + "','" +
    barcodeProperties.jobId + "','" +
    loadData.pickDate + "','" +
    loadData.boxesCount + "','" +
    loadData.binComments + "')";

  sqlStatements.push (sql);
};

var insertIntoLoadHeadingTable = function(loadDetails) {
  var sql = "INSERT INTO `orchard_run`.`load_heading_table` VALUES('" +
    loadDetails.loadType + "','" +
    loadDetails.loadId + "','" +
    loadDetails.truckDriverId + "','" +
    loadDetails.loadDate + "','" +
    loadDetails.loadDateTime + "','" +
    loadDetails.truckId + "','" +
    loadDetails.loadComments + "')";

  sqlStatements.push (sql);
};

var insertIntoLoadTable = function(binId, storageId, loadId) {
  var sql = "INSERT INTO `orchard_run`.`load_table` VALUES('" +
    loadId + "','" +
    binId + "','" +
    storageId + "')";

  sqlStatements.push (sql);
};

var insertIntoBoxesTable = function(employeeId, binId) {
  var sql = "INSERT INTO `orchard_run`.`boxes_table` VALUES('" +
    binId + "','" +
    employeeId + "')";  //picker, not truck driver

  sqlStatements.push(sql);
};
