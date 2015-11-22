'use strict';

var assert = require('assert');
var nock = require('nock');
var pageReader = require('../lib/pageReader');

/*
describe('...', function(){
    describe('...', function(){
        it('..', function(done){

            done();
        });
    });
});
*/

describe('given a URL with protocol http', function(){

    var requestedResource = 'content of the response';

    beforeEach(function(){
        var scope = nock('http://http-example')
                    .get('/path')
                .reply(200, requestedResource);

        });

    it('the corresponding resource is retrieved', function(done){
        var url = 'http://http-example/path';
        pageReader.retrieveResource(url, function(err,page){
            assert.equal(page,requestedResource);
            done();
        });
    });
});

describe('given a URL with protocol https', function(){

    var requestedResource = 'content of the response';

    beforeEach(function(){
        var scope = nock('https://https-example')
            .get('/path')
            .reply(200, requestedResource);

    });

    it('the corresponding resource is retrieved', function(done){
        var url = 'https://https-example/path';
        pageReader.retrieveResource(url, function(err,page){
            assert.equal(page,requestedResource);
            done();
        });
    });
});

describe('given the source code of a page', function(){

 	var page = (function(){/*<html>		
								<head>			
								</head>		
								<body>	
									<a href="http://www.mydomain.com/path/to/resource1">random text</a>	
									<a href="http://www.yourdomain.com/path/to/resource2"></a>
									<a href="http://www.theirdomain.com/path/to/resource3"/>
								</body>		
							</html>*/}).toString().match(/.*\/\*(.*[\s\S]*)\*\//)[1];

	describe('when reading the links', function(){

		it('all the links should be collected', function(done){
			pageReader.collectLinks(page,function(err,links){
				assert.equal(links[0],"http://www.mydomain.com/path/to/resource1");
				assert.equal(links[1],"http://www.yourdomain.com/path/to/resource2");
				assert.equal(links[2],"http://www.theirdomain.com/path/to/resource3");
				done();
			});
			
		});
	});
});


describe('given a seed URL', function(){
    var seed = 'http://domain/page0.html';

    beforeEach(function(){
        var scope = nock('http://domain')
                    .get('/page0.html')
                    .replyWithFile(200, __dirname + '/responses/page0.html')
                    .get('/page1.html')
                    .replyWithFile(200, __dirname + '/responses/page1.html')
                    .get('/page2.html')
                    .replyWithFile(200, __dirname + '/responses/page2.html')
                    .get('/page2_1.html')
                    .replyWithFile(200, __dirname + '/responses/page2_1.html')
                    .get('/page2_1_1.html')
                    .replyWithFile(200, __dirname + '/responses/page2_1_1.html');

    });

    describe('when depth is 0', function(){
        var depth = 0;

        it('all the links of page0 are collected', function(done){
            pageReader.getAllLinks(seed,depth,function(err,links){
                assert.equal(links.length,3);
                assert.equal(links[0],"http://domain/page0.html")
                assert.equal(links[1],"http://domain/page1.html");
                assert.equal(links[2],"http://domain/page2.html");
                done();
            })
        });
    });

    describe('when depth is 1', function(){
        var depth = 1;

        it('all the links of page0, page1 and page2 are collected', function(done){
            pageReader.getAllLinks(seed,depth,function(err,links){
                assert.equal(links.length,4);
                assert.equal(links[0],"http://domain/page0.html")
                assert.equal(links[1],"http://domain/page1.html");
                assert.equal(links[2],"http://domain/page2.html");
                assert.equal(links[3],"http://domain/page2_1.html");
                done();
            })
        });
    });

    describe('when depth is null', function(){
        var depth = null;

        it('all the links of the network are collected', function(done){
            pageReader.getAllLinks(seed,depth,function(err,links){
                assert.equal(links.length,5);
                assert.equal(links[0],"http://domain/page0.html");
                assert.equal(links[1],"http://domain/page1.html");
                assert.equal(links[2],"http://domain/page2.html");
                assert.equal(links[3],"http://domain/page2_1.html");
                assert.equal(links[4],"http://domain/page2_1_1.html");
                done();
            })
        });
    });
});