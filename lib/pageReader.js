'use strict';

var http = require('http');
var https = require('https');
var urlModule = require('url');
var cheerio = require('cheerio');
var async = require('async');
var iter = 0;


/*
	Reads the html code of the page received as parameter and collects all the links (href value of <a> elements).
	Finally, it calls the callback passing the list of collected links as a parameter.
 */
exports.collectLinks = function(page, callback){
	
	var href = [];
	var $ = cheerio.load(page);
	
	var links = $('a','body');
	for (var i = 0; i < links.length; i++) {
		href.push(links[i].attribs.href);
	};

	callback(null,href);
};

/*
	Retrieve the resource corresponding to a given a URL and calls the callback function passing the resource
	retrieved as a parameter
 */
exports.retrieveResource = function(url, callback){
	//console.log('url:'+url+'\n');
	var protocol = urlModule.parse(url).protocol;

	var httpObject;
	if(protocol==='http:'){
		httpObject = http;
	}
	else if(protocol==='https:'){
		httpObject = https;
	}

	httpObject.get(url,function(response){

		var page = '';
		response.on('data', function (chunk) {
			page += chunk;
		});

		response.on('end', function () {
			callback(null,page);
		});


	}).on('error', function(e) {
		callback(e.message);
	});

};

/*
	Starting from the seed URL, this function follows the links and collect them, calling the
	callback function with a list of all the collected links.
	The function follows the links up to the depth corresponding to the value depthLimit, where
	- depthLimit=0 means that only the links of the seed page are collected
	- depthLimit=1 means that the links of the seed page and the links of the pages reached from
	the seed page are collected, and so on
 */
exports.getAllLinks = function(seedUrl,depthLimit,callback){
	var totalLinks = [];
	totalLinks.push(seedUrl);
	var depthRecorder = {};
	depthRecorder.value = 0;
	exports.getLinks(0, totalLinks, depthLimit, callback, depthRecorder);
}

exports.getLinks = function(index, totalLinks, depthLimit, callback, depth){

	exports.retrieveResource(totalLinks[index], function(err,page){
		if(!err) {
			exports.collectLinks(page, function (err, links) {
				if(!err) {

					for (var i = 0; i < links.length; i++) {
						totalLinks.push(links[i]);
					};

					if(!depth.index){
						depth.index = totalLinks.length-1;
					}

					if(depthLimit==0){
						return callback(null, totalLinks);
					}

					if(index==totalLinks.length-1) {
						return callback(null, totalLinks);
					}

					if(depthLimit==depth.value && index==depth.index){
						return callback(null, totalLinks.slice(0,index+1));
					}

					if(index==depth.index){
						depth.value += 1;
						depth.index = totalLinks.length-1;
					}

					exports.getLinks(index+1, totalLinks, depthLimit, callback, depth);
				}
			})
		}
	})
};