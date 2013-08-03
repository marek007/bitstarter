var express = require("express");
var fs = require('fs');
var app = express();
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var html_file = "./index.html"
var str_to_send = decoder.write(fs.readFileSync(html_file));
app.use(express.logger());

app.get('/', function(request, response) {
  response.send(str_to_send);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
