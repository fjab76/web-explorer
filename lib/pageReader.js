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

	When depth is null, the process continues indefinitely until it does not find any more links
 */
exports.getAllLinks = function(seedUrl,depthLimit,callback){
	var totalLinks = [];
	totalLinks.push(seedUrl);
	var depthHandler = {value:0,index:0};
	exports.getLinks(0, totalLinks, depthLimit, depthHandler, callback);
}

exports.getLinks = function(index, totalLinks, depthLimit, depthHandler, callback){

	exports.retrieveResource(totalLinks[index], function(err,page){
		if(!err) {
			exports.collectLinks(page, function (err, links) {
				if(!err) {

					for (var i = 0; i < links.length; i++) {
						totalLinks.push(links[i]);
					}

					//There are no more links in the list (all the links have been collected,
					//the end of the internet has been reached!!)
					if(index==totalLinks.length-1) {
						return callback(null, totalLinks);
					}

					//The last link of this depth level has been reached, either
					//1.returns all the links up to this level
					//2.jumps to the next level
					if(index==depthHandler.index){
						if(depthLimit==depthHandler.value){
							return callback(null, totalLinks);
						}
						else{
							depthHandler.value += 1;
							depthHandler.index = totalLinks.length-1;
						}
					}

					exports.getLinks(index+1, totalLinks, depthLimit, depthHandler, callback);
				}
			})
		}
	})
};