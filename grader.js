#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "";
var URL_DEFAULT = "";
var CHECKSFILE_DEFAULT = "checks.json";
var rst =  "";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("File <%s> does not exist. Exiting.", instr);
	process.exit(1); 
    }
    return instr;
};

var assertUrlExists = function(inurl) {
    var instr = inurl.toString();
    rest.get(inurl).on('complete', function(result) {
	if (result instanceof Error) {
	   console.log('Error in URL < '+instr+" >: " + result.message);
	   process.exit(3);
        };
    });
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var loadUrlFile = function(urlfile,checksfile) {
     rest.get( urlfile.toString()).on('complete',function(result) { 
	if (result instanceof Error) {
	    console.log('Error in: '+urlfile +" >>>  "+ result.message);
	   } else {
 	    checks_out(result,checksfile);
	   }
	});
    
 };


var checks_out = function(htmlfile,checksfile) {
    $ = cheerio.load(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    var outJson = JSON.stringify(out, null, 4);
    console.log(outJson);

};

var checkHtmlFile = function(htmlfile, checksfile,url) {
    var html_file=url+"/"+htmlfile;
    if (url.length > 0) {
	loadUrlFile(html_file,checksfile);
    } else {
	if (htmlfile.length == 0){
	    htmlfile = "index.html";
	}
        assertFileExists(htmlfile )
	checks_out(fs.readFileSync(htmlfile),checksfile);
   }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_to_file>', 'URL to index.html',1, URL_DEFAULT)
	.parse(process.argv);

    checkHtmlFile(program.file, program.checks, program.url );

} else {
   exports.checkHtmlFile = checkHtmlFile;
}