//https://github.com/mscdex/node-mariasql
// set up ========================
var portListen = 4000;
var express  = require('express');
var app = express();                               // create our app w/ express
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var tools = require('./services/example');

// configuration =================
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// REST API -------------------------------------------------------------
app.get('/api/truck_drivers', function(req, res) {
  var ee ={
    name: "Scott",
    id: 1
  };

  var employees =[];
  employees.push(ee);
  res.json(employees);
});

app.get('/api/storage', function(req, res) {
  var store ={
    name: "storage1",
    id: 1
  };

  var store2 ={
    name: "storage2",
    id: 2
  };


  var storage_setup =[];
  storage_setup.push(store);
  storage_setup.push(store2);
  res.json(storage_setup);
});


// application -------------------------------------------------------------
app.get('*', function(req, res) {
  res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});



// listen (start app with node server.js) ======================================
app.listen(portListen);
console.log("App listening on port " + portListen);
console.log("API is available at localhost:" + portListen + "/api/");
