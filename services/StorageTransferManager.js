// StorageTransferManager.js

const db = require("./DatabaseManager");
const query = require("./QueryManager")
const decode = require("./LookupManager");

//Take entire list of barcode scans (including form data like storage, truck driver, etc.) from Angular
//Then sort and INSERT them into db
//req.body.loadData = object of load information
//req.body.binData = object array of BinIDs and destination storage/buyer/pack house
module.exports = {
  TransferBins: function (req,res) {
    var loadBinValues = [];
    var loadHeadingValues = [];

    insertIntoLoadHeadingArray(loadHeadingValues, req.body.loadData);

    //Iterate through list of bins
    for (var i=0; i < req.body.binData.length; i++) {
      //load_bin_table INSERTs
      loadBinValues.push([req.body.loadData.load.id, req.body.binData[i].binId, req.body.loadData.storage.id]);
    }

    query.connectOnly(db)
    .then(results => {
      return query.insert(results.connection, loadHeadingValues, 'load_heading_table');
    })
    .then(results => {
      return query.insert(results.connection, loadBinValues, 'load_bins_table');
    })
    .then(results => {
      switch (req.body.loadData.load.type) {
      case 'st':
        return query.updateStorage(results.connection, req.body.loadData.load.id, req.body.loadData.storage.id);
      case 'pk':
        return query.updatePack(results.connection, req.body.loadData.load.id, req.body.loadData.packoutId);
      case 'sl':
        return query.updateSale(results.connection, req.body.loadData.load.id, req.body.loadData.soldToId, req.body.loadData.cbTicketId);
      default:
        return Promise.reject('Unknown Load Type');
      }
    })
    .then(results => {
      results.connection.release();
      res.json({message: 'Hooray! Load entered successfully', error: false});
      console.log('END OF LOAD ' + loadHeadingValues[0][1]);
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      res.json({message: error.data.name + ' ' + error.data.message, error: true})
      console.error(error.data);
    });
  }
};

//Create arrays for INSERT
function insertIntoLoadHeadingArray(loadHeadingValues, loadData) {
  loadHeadingValues.push([
    loadData.load.type,
    loadData.load.id,
    loadData.truckDriver.id,
    loadData.loadDateTime,
    loadData.truck.id,
    loadData.loadComments,
    loadData.buyer,
    loadData.packoutId
  ]);
};
