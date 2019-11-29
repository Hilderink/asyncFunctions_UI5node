"use strict";

module.exports = {
	oSettings: {},
	hasErrors: function(){
		if(this.oSettings.behaviour==='A'){
			return true;
		}else{
			return false;
		}
	},
	handleTimeout: function(mulitiplier){
		var that = this;
		return new Promise((resolve)=>{  
			var delay = 0;
			if(that.oSettings.behaviour==='F'){
			  delay = that.oSettings.delay * 1000 * mulitiplier;
			}
			if(that.oSettings.behaviour==='R'){
			  delay = Math.random() * 5000 * mulitiplier;
			}
			setTimeout(() => {   
				resolve();
			}, delay);
		});   
	},
	setSettings: function(req){
		this.oSettings = req.body;
		return;
	},
	getSettings: function(){
		return this.oSettings;
	}
};