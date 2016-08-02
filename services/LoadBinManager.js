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
    var number_of_ee = 0;
    for(var i=0; i < req.body.barCodes.length; i++)
    {
      var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);
      if (barcodeValues.typeBarcode == 'bin'){
        number_of_ee = 0;
        // Insert into load_table
        //insertIntoLoadTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id);
        //
        insertIntoBinTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id);

        // Save bin id to variable for next barcode to use
        holderBinId=barcodeValues.binId;
        holderJobId=barcodeValues.jobId;

        for(var index=i+1; index < req.body.barCodes.length; index++)
        {
          var barcodeValues = decodeBarCode(req.body.barCodes[index].barcode);
          if (barcodeValues.typeBarcode != 'bin'){
            number_of_ee = number_of_ee + 1;
          }
          else {
            break;
          }
        }
      }
      else {
        // Else this is a Employee
        //var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);
        // Insert into boxes_table
        //Math.round(100*number_of_ee)/100;
        insertIntoBoxes(barcodeValues, holderBinId, Math.round(100*number_of_ee)/100, holderJobId)
      }
    }
    res.send("Data Saved!");
  }
};

var insertIntoLoadTable = function(barcodeValues, truck_driver_id, storage_id){
  var conn = db.connection;
  var sql = "INSERT INTO `orchard_run`.`load_table` (`Load ID`, `Bin ID`, `Employee ID`, `Storage ID`, Date, Time, `Truck ID`) select max(`Load ID`)+1, "+  barcodeValues.binId + ",'"+  truck_driver_id + "','"+ storage_id + "', CURDATE(),CURTIME(), '1' from `orchard_run`.`load_table` ";
  console.log(sql);
  conn().query(sql, function(err, res){
    console.log(err);
    conn().commit(function(err) {
    });
  });
};

var insertIntoBinTable = function(barcodeValues, truck_driver_id, storage_id){
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
        insertIntoLoadTable(barcodeValues, truck_driver_id, storage_id);
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
        pickId: barcode.substring(11, 12),
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
