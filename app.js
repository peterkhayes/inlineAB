// Module dependencies
var express = require('express');
var http = require('http');
var path = require('path');

// Create server
var app = express();

// Configure server
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

// Mount statics
app.use(express.static(path.join(__dirname, '/.tmp')));
app.use(express.static(path.join(__dirname, '/client')));

// Route index.html
app.get('/', function(req, res) {
  res.sendfile(path.join(__dirname, '/client/index.html'));
});

// Start server
http.createServer(app).listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});
