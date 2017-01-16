var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

app.get('/api/getOrder', function (request, response) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  	if (err) throw err;
	  	client.query('SELECT Order__c, CustomerName__c, ProductName__c FROM salesforce.Order__c ;', function(err, result) {
		 	if (err){
				console.error(err); response.send("Error " + err); 
			}else{ 
				response.send(result.rows); 
			}
		});
	});
});

app.get('/api/order-detail/:id', function (request, response) {
	var orderNo = request.params.id;
	if(orderNo === ''){
		response.send('fasle'); 
	}
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  	if (err) throw err;
	  	client.query("SELECT id, Order__c, CustomerName__c, ProductName__c,quantity__c,unitprice__c,orderdate__c FROM salesforce.Order__c WHERE Order__c = '" + orderNo + "' ;", function(err, result) {
		 	if (err){
				console.error(err); response.send("Error " + err); 
			}else{ 
				response.send(result.rows); 
			}
		});
	});
});

app.get('/api/login/:username/:password', function (req, res) {
	request({
	  uri: "https://login.salesforce.com/services/oauth2/token",
	  method: "POST",
	  form: {
	    grant_type: "password",
	    client_id: "3MVG9ZL0ppGP5UrBkp4gcpR4zFArWdyWq_uSvtxHqB2Kh3XW9.DtvHL6_BBORBjn3MSRNvfQtldgmQL3VWb7D",
	    client_secret: "4597579409077764254",
	    username: req.params.username,
	    password: req.params.password
	  }
	}, function(error, response, body) {
		var dt = JSON.parse(body);
		if(dt["access_token"] !== undefined){
			res.send('true');
		}else{
			res.send('false');
		}
	});
});

app.post('/api/updateOrder', function(req, res){
	var data = req.body;
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  	if (err) throw err;
	  	client.query("UPDATE salesforce.Order__c SET CustomerName__c = {$1}, ProductName__c = {$2},quantity__c = {3},unitprice__c = {$4} ,orderdate__c = {$5} FROM salesforce.Order__c WHERE id = {$6}",[data.customername__c, data.productname__c, data.quantity__c, data.unitprice__c, data.orderdate__c, data.id], function(err, result) {
		 	if (err){
				response.send("Error " + err); 
			}else{ 
				response.send('true'); 
			}
		});
	});
});

