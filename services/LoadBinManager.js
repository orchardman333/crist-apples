// LoadBinManager.js
// LdMch31P090110006
// Mch31P090110006
// ========
var mysql   = require("mysql");
var db   = require("./DatabaseManager");
module.exports = {
  LoadBins: function (req,res) {

    var holderBinId = '';
    var holderJobId = '';
    for(var i=0; i < req.body.barCodes.length; i++)
    {
      var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);
      if (barcodeValues.typeBarcode == 'bin'){
        // Insert into load_table
        insertIntoBinTable(barcodeValues);
        insertIntoLoadTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id);

        // Save bin id to variable for next barcode to use
        holderBinId=barcodeValues.binId;
        holderJobId=barcodeValues.jobId;

      }
      else {
        // Else this is a Employee
        var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);
        // Insert into boxes_table
        insertIntoBoxes(barcodeValues, holderBinId, '1', holderJobId)
      }
    }
    res.send("Data Saved!");
  }
};

var insertIntoLoadTable = function(barcodeValues, truck_driver_id, storage_id){
  //TODO: Find Truck ID
  var conn = db.connection;
  var sql = "INSERT INTO `orchard_run`.`load_table` VALUES('1','" +
              barcodeValues.binId+ "','" +
              truck_driver_id+ "','" +
              storage_id+ "'," +
              "CURDATE(),CURTIME(), '1')";
  console.log(sql);

  conn().query(sql, function(err, res){
    console.log(err);
    conn().commit(function(err) {
    });
  })
};

var insertIntoBinTable = function(barcodeValues){
    var conn = db.connection;
    var sql = '';

    if (barcodeValues.lengthBarCode == 17){
      sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
              barcodeValues.binId+ "','" +
              barcodeValues.varietyId+ "','" +
              barcodeValues.strainId+ "','" +
              barcodeValues.blockId+ "'," +
              "CURDATE(),'1','" +
              barcodeValues.pickId+ "'," +
              "null,null)";
    }
    else {
      sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
              barcodeValues.binId+ "','" +
              barcodeValues.varietyId+ "'," +
              "null"+ ",'" +
              barcodeValues.blockId+ "'," +
              "CURDATE(),'1','" +
              barcodeValues.pickId+ "'," +
              "null,null)";
    }

    console.log(sql);

    conn().query(sql, function(err, res){
      console.log(err);
      conn().commit(function(err) {
      });
    });
};


var insertIntoBoxes = function(barcodeValues, binId, boxes, jobId){
    var conn = db.connection;
    var sql = "INSERT INTO `orchard_run`.`boxes_table` VALUES('" +
                binId+ "','" +
                barcodeValues.eeId+ "','" +
                boxes+ "','" +
                jobId+ "')";
    console.log(sql);

    conn().query(sql, function(err, res){
      console.log(err);
      conn().commit(function(err) {
      });
    });
};


var decodeBarCode = function(barcode){
  var values = {};
  if (barcode.length == 17){
      values = {
        typeBarcode : 'bin',
        lengthBarCode: 17,
        strainId: barcode.substring(0, 2),
        varietyId: barcode.substring(2, 4),
        blockId: barcode.substring(4, 7),
        jobId: barcode.substring(7, 11),
        pickId: barcode.substring(12, 13),
        binId: barcode.substring(12, 17)
     }
  }
   else if (barcode.length ==15) {
      values = {
        typeBarcode : 'bin',
        lengthBarCode: 15,
        varietyId: barcode.substring(0, 2),
        blockId:  barcode.substring(2, 5),
        jobId:  barcode.substring(5, 9),
        pickId:  barcode.substring(9, 10),
        binId:  barcode.substring(10, 15)
        }
    }
  else {
    //this is an employee barcode
    values = {
      typeBarcode : 'employee',
      eeId : barcode
    }
  }
  return values;
};
