var express = require('express')
var bodyParser = require('body-parser')

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

var routes = require('./api/routes');
routes(app);

app.listen(port, function() {
   console.log('Server started on port: ' + port);
});


