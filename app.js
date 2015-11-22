'use strict';

//var http = require('http');
//var https = require('https');
//var url = require('url');
var pageReader = require('./lib/pageReader');


var urlSeed = 'http://stackoverflow.com/';
pageReader.getAllLinks(urlSeed, 0, function(err,links){
	console.log(links);
});
