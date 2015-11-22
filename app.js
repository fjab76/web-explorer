'use strict';

//var http = require('http');
//var https = require('https');
//var url = require('url');
var pageReader = require('./lib/pageReader');


var urlSeed = 'http://stackoverflow.com/';
pageReader.getAllLinks(urlSeed, 0, function(err,links){
	console.log(links);
});
/*
var protocol = url.parse(urlSeed).protocol;

console.log('urlSeed:'+urlSeed);
console.log('protocol:'+protocol);

var httpObject;
if(protocol==='http:'){
	httpObject = http;
}
else if(protocol==='https:'){
	httpObject = https;
}

httpObject.get(urlSeed,function(response){

		var page = '';
		response.on('data', function (chunk) {
		    page += chunk;
		  });

		response.on('end', function () {
			console.log(page);
		    pageReader.getAllLinks(page, 0, function(links){
		    	console.log(links);
		    });
		  });

		
	}).on('error', function(e) {
		  	console.log(e.message);
		});*/