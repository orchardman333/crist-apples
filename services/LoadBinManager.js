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
      console.log(barcodeValues);
      if (barcodeValues.typeBarcode == 'bin'){
        // Insert into bin_table
        var conn = db.connection;
        // Need to decode the default config to get "boxes"
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

        // Insert into load_table
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

var decodeBarCode = function(barcode){
  var values = {};
  if (barcode.length == 17){
    values = {
      typeBarcode : 'bin',
      strainId: barcode.substring(0, 1),
      varietyId: barcode.substring(2, 3),
      blockId: barcode.substring(4, 6),
      jobId: barcode.substring(7, 10),
      pickId: barcode.substring(11),
      binId: barcode.substring(12, 16)
    }
  }
   else if (barcode.length ==15) {
      values = {
        typeBarcode : 'bin',
        varietyId: barcode.substring(0, 1),
        blockId:  barcode.substring(2, 4),
        jobId:  barcode.substring(5, 8),
        pickId:  barcode.substring(9),
        binId:  barcode.substring(10, 14)
      }
  }
  else {
    //this is an employee barcode
    values = {
      typeBarcode : 'employee'
    }
  }
  return values;
};
