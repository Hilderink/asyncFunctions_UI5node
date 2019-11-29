/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var settingsjs = require('./settings');
var xsenv = require('@sap/xsenv');
var services = xsenv.getServices({ hana: 'hana' });

module.exports = {
	data: {},
	getData: function(req) {
		var that = this;
		return new Promise(async function(resolve, reject){  
			var d = {};
			if(settingsjs.hasErrors()){
				reject('Error written here');
    		}
    		await settingsjs.handleTimeout(.5); 
		    d = that.data;     
		    d.attachedServerMessage = 'On ' 
		    						+ await that.getServerTime(req) 
		    						+ ' host ' 
		    						+ services.hana.host 
		    						+ ' responded ' 
		    						+ that.data.id;
		    await settingsjs.handleTimeout(.5); 
		    resolve(d);
		});     
	},
	setData: function(req) {
		var that = this;
		return new Promise(async function(resolve, reject){  
			if(settingsjs.hasErrors()){
				reject({publicMessage: 'Error'});
    		}    
		    await settingsjs.handleTimeout(.5); 
		    that.data = req.body;
		    await settingsjs.handleTimeout(.5); 
		    resolve({});
		});     
	},
	getServerTime: function(req){
		return new Promise(function(resolve, reject){
			req.db.exec('SELECT CURRENT_UTCTIMESTAMP FROM DUMMY', function (err, rows) {
				var d = new Date(rows[0].CURRENT_UTCTIMESTAMP);
				resolve(d.getHours()+2 + ":" + d.getMinutes() + ":" + d.getSeconds() + "[" + d.getMilliseconds() + "]");
			});
		});
	}
};