// set up ========================
var portListen = 4000;
var express  = require('express');
var app = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var employeeManager = require('./services/EmployeeManager');
var storageManager = require('./services/StorageManager');
var orchardRunManager = require('./services/OrchardRunManager');
var storageTransferManager = require('./services/StorageTransferManager');
//var packingDumpManager = require('./services/PackingDumpManager');
var lookupManager = require('./services/LookupManager');
var truckManager = require('./services/TruckManager');
var loadSeqManager = require('./services/LoadSequenceIdManager');
var timeFormManager = require('./services/TimeFormManager');
var outsideTimeManager = require('./services/OutsideTimeManager');
var replacementLabelManager = require('./services/ReplacementLabelManager');
var timeReportManager = require('./services/TimeReportManager')
// configuration =================
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// REST API -------------------------------------------------------------
// People and Trucks
app.get('/api/trucks', function(req,res) {
  truckManager.GetTrucks(req,res);
});

app.get('/api/truckDrivers', function(req,res) {
  truckManager.GetTruckDrivers(req,res);
});

app.get('/api/employees', function(req,res) {
  employeeManager.GetEmployees(req,res);
});

app.get('/api/managers', function(req,res) {
  employeeManager.GetManagers(req,res);
});

app.get('/api/employee', function(req,res) {   // ?employeeId = ...
  employeeManager.EmployeeLookup(req,res);
});
//-------------------------------------------------------
// Bins and Orchard Run
app.get('/api/binlookup', function(req,res) {
  lookupManager.BinLookup(req,res);
});

app.get('/api/bincheck', function(req,res) {
  lookupManager.BinCheckLong(req,res);
});

app.post('/api/orchardRunManager', function(req,res) {
  orchardRunManager.LoadBins(req,res);
});

app.get('/api/loadId', function(req,res) {
  loadSeqManager.GetLoadId(req,res);
});

app.get('/api/jobs', function(req,res) {
  lookupManager.GetJobs(req,res);
});

app.get('/api/replacementvalues', function(req,res) {
  replacementLabelManager.ReplacementValues(req,res);
});
//-------------------------------------------------------
// Storages and Transfers
app.get('/api/storage', function(req,res) {
  storageManager.GetStorageList(req,res);
});

app.post('/api/storageTransfer', function(req,res) {
  storageTransferManager.TransferBins(req,res);
});

// app.post('/api/PackingDumpManager', function(req,res) {
//   packingDumpManager.DumpBins(req,res);
// });
//-------------------------------------------------------
// Time Clock
app.post('/api/getoutsidetime', function(req,res) {
  outsideTimeManager.SeeWork(req,res);
});

app.post('/api/outsidetime', function(req,res) {
  outsideTimeManager.DoWork(req,res);
});

app.get('/api/insidetime', function(req,res) {
  timeFormManager.SeeWork(req,res);
});

app.post('/api/insidetime', function(req,res) {
  timeFormManager.DoWork(req,res);
})

app.post('/api/dailytime', function(req,res) {
  timeReportManager.DailyTime(req,res);
});

// application -------------------------------------------------------------
app.get('*', function(req,res) {
  res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(portListen);
console.log("App listening on port " + portListen);
console.log("API is available at localhost:" + portListen + "/api/");
