/*eslint no-console: 0*/
"use strict";
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var xsenv = require('@sap/xsenv');
var services = xsenv.getServices({ hana: 'hana' });

var hdbext = require('@sap/hdbext');

var datajs = require('./js/data');

var settingsjs = require('./js/settings');

app.use('/', hdbext.middleware(services.hana));

app.get('/api/data', async function (req, res) {
  try{
	res.send(await datajs.getData(req));
  }catch(err){
  	res.status(500);
  	res.send('Error while getting data.');
  }
});

app.post('/api/data', async function (req, res) {
  try{
	res.send(await datajs.setData(req));
  }catch(err){
  	res.status(500);
  	res.send('Error while getting data.');
  }
});

app.get('/api/settings', function (req, res) {
  res.send(settingsjs.getSettings());
});

app.post('/api/settings', function (req, res) {
  settingsjs.setSettings(req);
  res.send();
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('myapp listening on port ' + port);
});