// StorageTransferManager.js

var db = require("./DatabaseManager");
var decode = require("./LookupManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of load information
//req.body.binData = object array of BinIDs and destination storage/buyer/pack house
module.exports = {
  TransferBins: function (req,res) {
    var loadBinValues = [];
    var loadHeadingValues = [insertIntoLoadHeadingArray(req.body.loadData)];

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {

      //load_bin_table INSERTs
      loadBinValues.push([req.body.loadData.load.id, req.body.binData[i], req.body.loadData.storage.id]);
    }

    insertLoadHeading()
    .then(insertLoadBins)
    .then(updateBins)
    .then(function (){
      res.json({message: 'Hooray! Load entered successfully', error: false})
      console.log('END OF LOAD ' + loadHeadingValues[0][1])
    })
    .catch(function (e){
      res.json({message: e.name + ' ' + e.message, error: true})
    });

    //Wrapper functions
    function insertLoadHeading(){
      return insert(loadHeadingValues, 'load_heading_table')
    }
    function insertLoadBins(){
      return insert(loadBinValues, 'load_bins_table')
    }
    function updateBins(){
      return update(req.body.loadData.load.id, req.body.loadData.storage.id)
    }
  }
};

function insert(values, tableName){
  return new Promise (function(resolve, reject) {
    if (values.length > 0) {
      db.getConnection(function (err, connection){
        var query = connection.query('INSERT INTO ' + tableName + ' VALUES ?', [values], function (error, results, fields) {
          if (error) {
            console.log(error);
            reject(error);
          }
          connection.release();
          resolve();
        });
        console.log(query.sql);
      });
    }
    else {
      resolve();
    }
  });
}

function update(loadId, storageId){
  return new Promise (function(resolve, reject) {
      db.getConnection(function (err, connection){
        var query = connection.query('UPDATE `bin_table` INNER JOIN `load_bins_table` ON `bin_table`.`Bin ID`=`load_bins_table`.`Bin ID` SET `Previous Load` = ?, `Current Storage` = ? WHERE `Load ID` = ?', [loadId, storageId, loadId], function (error, results, fields) {
          if (error) {
            console.log(error);
            reject(error);
          }
          connection.release();
          resolve();
        });
        console.log(query.sql);
      });
  });
}

function insertIntoLoadHeadingArray(loadData) {
  return [loadData.load.type,
    loadData.load.id,
    loadData.truckDriver.id,
    loadData.loadDateTime,
    loadData.truck.id,
    loadData.loadComments,
    loadData.buyer,
    loadData.packoutId];
  };
