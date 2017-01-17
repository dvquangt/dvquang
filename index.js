var express = require('express');
var pg = require('pg');
pg.defaults.ssl = true;
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var http = require('http')
var connection = pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) throw err;
		connection = client;
	});

// Start SocketIO
// var socketIO = require('socket.io'),
//     http = require('http'),
//     port = process.env.PORT || 5000,
//     ip = process.env.IP || '192.168.0.120',
//     server = http.createServer().listen(port, ip, function(){
//         console.log('Started Socket.IO');
//     }),
//     io = socketIO.listen(server);
// io.set('match origin protocol', true);
// io.set('origins', '*:*');
// var run = function (socket){
//     socket.on('user-join', function (data) {
//         console.log('User ' + data + ' have joined');
//         socket.broadcast.emit('new-user', data);
//     });
//     socket.on('user-join', function (data) {
//         socket.broadcast.emit('new-user', data);
//     });
//     socket.on('sendMessage', function(data, user){
//         socket.broadcast.emit('receiveMessage', data, user);
//     });
// }
// io.sockets.on('connection', run);
// end SocketIO

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
  	connection.query('SELECT id, Order__c, CustomerName__c, ProductName__c FROM salesforce.Order__c ;', function(err, result) {
	 	if (err){
			response.send("Error " + err); 
		}else{ 
			response.send(result.rows); 
		}
	});
});

app.get('/api/order-detail/:id', function (request, response) {
	var id = request.params.id;
	if(id === ''){
		response.send('fasle'); 
	}
  	connection.query("SELECT id, Order__c, CustomerName__c, ProductName__c,quantity__c,unitprice__c,orderdate__c FROM salesforce.Order__c WHERE id = " + id + " ;", function(err, result) {
	 	if (err){
			response.send("Error " + err); 
		}else{ 
			response.send(result.rows); 
		}
	});
});

app.post('/api/login', function (req, res) {
	request({
	  uri: "https://login.salesforce.com/services/oauth2/token",
	  method: "POST",
	  form: {
	    grant_type: "password",
	    client_id: "3MVG9ZL0ppGP5UrBkp4gcpR4zFArWdyWq_uSvtxHqB2Kh3XW9.DtvHL6_BBORBjn3MSRNvfQtldgmQL3VWb7D",
	    client_secret: "4597579409077764254",
	    username: req.body.username,
	    password: req.body.password
	  }
	}, function(error, response, body) {
		var dt = JSON.parse(body);
		if(dt["access_token"] !== undefined){
		  	connection.query("SELECT id, sfid, canaccesscontact__c, canaccessorder__c FROM salesforce.User WHERE username ='" + req.body.username + "' ;", function(err, result) {
			 	if (err){
					res.send('false'); 
				}else{ 
					res.send(result.rows); 
				}
			});
		}else{
			res.send('false');
		}
	});
});

app.post('/api/updateOrder', function(req, res){
	var data = req.body;
  	connection.query("UPDATE salesforce.Order__c SET customername__c = $1, productname__c = $2,quantity__c = $3,unitprice__c = $4,orderdate__c = $5 WHERE id = $6;",[data.customername__c, data.productname__c, data.quantity__c, data.unitprice__c, data.orderdate__c, data.id], function(err, result) {
	 	if (err){
			res.send("Error " + err); 
		}else{ 
			res.send('true'); 
		}
	});
});

app.post('/api/insertOrder', function(req, res){
	var data = req.body;
  	connection.query("INSERT INTO salesforce.Order__c(customername__c, productname__c, orderdate__c, quantity__c, unitprice__c) VALUES ($1, $2, $3, $4, $5);",[data.customername__c, data.productname__c, data.orderdate__c, data.quantity__c, data.unitprice__c], function(err, result) {
	 	if (err){
			res.send("Error " + err); 
		}else{ 
			res.send('true'); 
		}
	});
});

app.post('/api/getContact', function(req, res){
  	connection.query('SELECT id, name, email, phone FROM salesforce.Contact ;', function(err, result) {
	 	if (err){
			res.send("Error " + err); 
		}else{ 
			res.send(result.rows); 
		}
	});
});
