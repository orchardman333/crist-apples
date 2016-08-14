// LoadBinManager.js
// LdMch31P090110006
// Mch31P090110006
// ========

var db   = require("./DatabaseManager").pool;
var statements = [];


module.exports = {
  LoadBins: function (req,res) {
    var holderBinId = '';
    var holderJobId = '';
    var number_of_ee = 0;
    var nr_boxes=0;
    statements.push("SET FOREIGN_KEY_CHECKS=0;");

    for(var i=0; i < req.body.barCodes.length; i++)
    {
      var barcodeValues = decodeBarCode(req.body.barCodes[i].barcode);      
      if (barcodeValues.typeBarcode == 'bin'){
        number_of_ee = 0;
        nr_boxes = req.body.barCodes[i].nr_boxes;

        // Insert into load_table
        //insertIntoLoadTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id);
        //
        insertIntoBinTable(barcodeValues, req.body.barCodes[i].truck_driver.id, req.body.barCodes[i].storage.id, req.body.barCodes[i].comments, req.body.barCodes[i].truck_id, req.body.barCodes[i].load_seq_id, req.body.barCodes[i].date, nr_boxes);

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
        insertIntoBoxes(barcodeValues, holderBinId, Math.round(100*(nr_boxes/number_of_ee))/100, holderJobId)
      }
    }


    console.log("length:" + statements.length);
    console.log(statements);

    db.getConnection(function(err, connection) {
      for(var cnt=0; cnt != statements.length; cnt++)
      {
        connection.query(statements[cnt], function(err, rows, fields) {});
      }
      connection.commit(function(err) {});
    });

    res.send("Data Saved!");
  }
};

var insertIntoLoadTable = function(barcodeValues, truck_driver_id, storage_id, truck_id, load_seq_id){
  var sql = "INSERT INTO `orchard_run`.`load_table` (`Load ID`, `Bin ID`, `Employee ID`, `Storage ID`, Date, Time, `Truck ID`) values ('" + load_seq_id+ "', "+  barcodeValues.binId + ",'"+  truck_driver_id + "','"+ storage_id + "', CURDATE(),CURTIME(), '"+ truck_id+ "')";
  statements.push(sql);
};

var insertIntoBinTable = function(barcodeValues, truck_driver_id, storage_id, comments, truck_id,load_seq_id, date, nr_boxes){
    var sql = '';

    if (barcodeValues.lengthBarCode == 17){
      sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
              barcodeValues.binId+ "','" +
              barcodeValues.varietyId+ "','" +
              barcodeValues.strainId+ "','" +
              barcodeValues.blockId+ "','" +
              date +"','" + nr_boxes + "','" +
              barcodeValues.pickId+ "'," +
              "null,'"+comments+"')";
    }
    else {
      sql = "INSERT INTO `orchard_run`.`bin_table` VALUES('" +
              barcodeValues.binId+ "','" +
              barcodeValues.varietyId+ "'," +
              "null"+ ",'" +
              barcodeValues.blockId+ "','" +
              date +"','" + nr_boxes + "','" +
              barcodeValues.pickId+ "'," +
              "null,'"+comments+"')";
    }

    console.log(sql);

    statements.push (sql);
    insertIntoLoadTable(barcodeValues, truck_driver_id, storage_id, truck_id,load_seq_id);
};


var insertIntoBoxes = function(barcodeValues, binId, boxes, jobId){
    var sql = "INSERT INTO `orchard_run`.`boxes_table` VALUES('" +
                binId+ "','" +
                barcodeValues.eeId+ "','" +
                boxes+ "','" +
                jobId+ "')";
    console.log(sql);
    statements.push(sql);
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
