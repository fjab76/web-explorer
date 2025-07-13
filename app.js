'use strict';

var pageReader = require('./lib/pageReader');
var webServer = require('./lib/webServer');

// Check if running in web server mode
var args = process.argv.slice(2);
var isWebMode = args.includes('--web') || args.includes('-w');

if (isWebMode) {
  // Start web server
  var port = process.env.PORT || 3000;
  webServer.startServer(port);
} else {
  // Original CLI functionality
  var urlSeed = 'http://stackoverflow.com/';
  pageReader.getAllLinks(urlSeed, 0, function(err,links){
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Found', links.length, 'links:');
      console.log(links);
    }
  });
}
