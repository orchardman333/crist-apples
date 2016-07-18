//https://github.com/mscdex/node-mariasql
// set up ========================
var portListen = 4000;
var express  = require('express');
var app = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var eeManager = require('./services/EmployeeManager');
var storageManager = require('./services/StorageManager');
var loadBinManager = require('./services/LoadBinManager');

// configuration =================
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// REST API -------------------------------------------------------------
app.get('/api/truck_drivers', function(req, res) {
  eeManager.GetTruckDrivers(res);
});

app.get('/api/storage', function(req, res) {
  storageManager.GetStorageList(res);
});

app.post('/api/loadRun', function(req, res) {
  loadBinManager.LoadBins(req, res);
});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
  res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(portListen);
console.log("App listening on port " + portListen);
console.log("API is available at localhost:" + portListen + "/api/");
