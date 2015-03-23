var connect = require('connect');
var http = require('http');

var app = connect()
  .use(connect.static(__dirname))
  .use(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Credentials', false);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end('hello world\n');
  });
var server = http.createServer(app);
server.listen(8082);
console.log('Server start @ 8082');