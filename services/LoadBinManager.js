// LoadBinManager.js
// LdMch31P090110006
// Mch31P090110006
// ========
var mysql   = require("mysql");
var db   = require("./DatabaseManager");
module.exports = {
  LoadBins: function (req,res) {
    for(var i=0; i < req.body.barCodes.length; i++)
    {
      var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);
      // TODO: Need to decode the default config to get "boxes"

      //console.log(barcodeValues);
      if (barcodeValues.typeBarcode == 'bin'){

        // Insert into load_table
        insertIntoLoadTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id);
        insertIntoBinTable(barcodeValues);

        // Save bin id to variable for next barcode to use
      }
      else {
        // Else this is a Employee
        // Insert into boxes_table
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
    var sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
                barcodeValues.binId+ "','" +
                barcodeValues.varietyId+ "','" +
                barcodeValues.strainId+ "','" +
                barcodeValues.blockId+ "'," +
                "CURDATE(),'1','" +
                barcodeValues.pickId+ "'," +
                "null,null)";
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
          varietyId: barcode.substring(0, 2),
          blockId:  barcode.substring(2, 5),
          jobId:  barcode.substring(5, 9),
          pickId:  barcode.substring(9, 10),
          binId:  barcode.substring(10, 15)
          }
      }
  else {
    //this is an employee barcode
    // TODO:  Stub this out with data
    values = {
      typeBarcode : 'employee'
    }
  }
  return values;
};
