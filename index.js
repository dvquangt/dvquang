var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
app.get('/db', function (request, response) {
	pg.defaults.ssl = true;
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) throw err;
	  console.log('Get data from server...');
	  client.query('SELECT hohocsinh__c, tenhocsinh__c FROM salesforce.hocsinh__c;', function(err, result) {
		 if (err){
			console.error(err); response.send("Error " + err); 
		}else{ 
			response.render('pages/db', {results: result.rows} ); 
			}
		});
	});
});

app.get('/getOrder', function (request, response) {
	console.log('getOrder ...');
	console.log(process.env.DATABASE_URL);
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  	if (err) throw err;
	  	console.log('Get data from server...');
	  	client.query('SELECT Order__c, CustomerName__c, ProductName__c FROM Order__c ;', function(err, result) {
		 	if (err){
				console.error(err); response.send("Error " + err); 
			}else{ 
				response.send(result.rows); 
			}
		});
	});
});

