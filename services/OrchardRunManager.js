// OrchardRunManager.js
// [bbb][vv][ss][n][t][p][jjjj][binid]
// h01 mc ld b u 1 p100 10000
// h01mcldbu1p10010000
// ========
var db = require("./DatabaseManager");
var decode = require("./BarcodeDecodingManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of extra load information
//req.body.binData = object array of bin and employee (picker) barcode
module.exports = {
  LoadBins: function (req,res) {
    var barcodeProperties = {};
    //Ignore foreign key contraints
    //sqlStatements.push("SET FOREIGN_KEY_CHECKS=0;");

    //Push load_heading_table INSERTs
    insertIntoLoadHeadingTable(req.body.loadData);

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      barcodeProperties = decode.decodeBarcode(req.body.binData[i].barcode);

        //Push bin_table & load_table INSERTs to sqlStatements
        insertIntoBinTable(barcodeProperties, req.body.binData[i]);
        insertIntoLoadTable(barcodeProperties.binId, req.body.binData[i].storageId, req.body.loadData.loadId);

        //Pickers
        for (var j=0; j < req.body.binData[i].pickerIds.length; j++) {
            insertIntoBoxesTable(req.body.binData[i].pickerIds[j], barcodeProperties.binId)
          }
        }
        res.send("Data Saved!")
      // else if (barcodeProperties.typeBarcode != 'emp') {
      //   console.log(barcodeProperties.typeBarcode + "\nUnexpected barcode length/type in OrchardRunManager.js");
      // }

    //Send SQL to db
  //   db.getConnection(function(err, connection) {
  //     console.log(sqlStatements);
  //     for(var cnt=0; cnt < sqlStatements.length; cnt++)
  //     {
  //       connection.query(sqlStatements[cnt], function(err, rows, fields) {});
  //     }
  //     connection.commit(function(err) {connection.release();});
  //   });
  //   res.send("Data Saved!\n" + sqlStatements);
   }
};

function insert(sql, tableName, values){
  db.getConnection(function (err, connection){
    var query = connection.query('INSERT INTO `orchard_run`.' + tableName + ' VALUES(' + values + ')', sql, function (error, results, fields) {
      connection.release();
    });
    console.log(query.sql);
  });
};

function insertIntoBinTable(barcodeProperties, binData) {
  var sql = [barcodeProperties.binId,
    barcodeProperties.blockId,
    barcodeProperties.varietyId,
    barcodeProperties.strainId,
    barcodeProperties.bearingId ,
    barcodeProperties.treatmentId ,
    barcodeProperties.pickId ,
    barcodeProperties.jobId ,
    binData.pickDate ,
    binData.boxesCount ,
    binData.binComments];
    insert(sql, '`bin_table`', '?,?,?,?,?,?,?,?,?,?,?');
  };

function insertIntoLoadHeadingTable(loadData) {
    var sql = [loadData.loadType,
      loadData.loadId,
      loadData.truckDriverId,
      loadData.loadDate,
      loadData.loadDateTime,
      loadData.truckId,
      loadData.loadComments];
      insert(sql, '`load_heading_table`', '?,?,?,?,?,?,?');
  };

function insertIntoLoadTable(binId, storageId, loadId) {
    var sql = [loadId,
      binId,
      storageId];
      insert(sql, '`load_table`', '?,?,?');
  };

function insertIntoBoxesTable(employeeId, binId) {
    var sql = [binId,
      employeeId];  //picker, not truck driver

    insert(sql, '`boxes_table`', '?,?');
  };

// var insertIntoBinTable = function(barcodeProperties, binData) {
//   var sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
//     barcodeProperties.binId + "','" +
//     barcodeProperties.blockId + "','" +
//     barcodeProperties.varietyId + "','" +
//     barcodeProperties.strainId + "','" +
//     barcodeProperties.bearingId + "','" +
//     barcodeProperties.treatmentId + "','" +
//     barcodeProperties.pickId + "','" +
//     barcodeProperties.jobId + "','" +
//     binData.pickDate + "','" +
//     binData.boxesCount + "','" +
//     binData.binComments + "')";
//
//   sqlStatements.push (sql);
// };

// var insertIntoLoadHeadingTable = function(loadData) {
//   var sql = "INSERT INTO `orchard_run`.`load_heading_table` VALUES('" +
//     loadData.loadType + "','" +
//     loadData.loadId + "','" +
//     loadData.truckDriverId + "','" +
//     loadData.loadDate + "','" +
//     loadData.loadDateTime + "','" +
//     loadData.truckId + "','" +
//     loadData.loadComments + "')";
//
//   sqlStatements.push (sql);
// };
//
// var insertIntoLoadTable = function(binId, storageId, loadId) {
//   var sql = "INSERT INTO `orchard_run`.`load_table` VALUES('" +
//     loadId + "','" +
//     binId + "','" +
//     storageId + "')";
//
//   sqlStatements.push (sql);
// };
//
// var insertIntoBoxesTable = function(employeeId, binId) {
//   var sql = "INSERT INTO `orchard_run`.`boxes_table` VALUES('" +
//     binId + "','" +
//     employeeId + "')";  //picker, not truck driver
//
//   sqlStatements.push(sql);
// };
