sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {
		createSettingsModel: function () {
			var oModel = new JSONModel();
			oModel.init = async function(){
				var aSettings = await this._getSettings();
				this.setProperty("/behaviour", aSettings.behaviour);
				this.setProperty("/delay", aSettings.delay);
			};
			oModel._getSettings = async function(resolve, reject){
				var d = await fetch('/api/settings', {
	        		headers: {
						'Accept': 'application/json',
	 					'Content-Type': 'application/json'
					},
				    method: "GET"
				});
				d = await d.json();
				return(d);
			};
			oModel.setSettings = async function(resolve, reject){
				//DATADEF
				var that = this;
	        	const controller = new AbortController();
    			const signal = controller.signal;
    			
    			//PREPARE
    			var oSettings = {};
    			oSettings.behaviour = that.getProperty("/behaviour");
    			oSettings.delay = that.getProperty("/delay");
    			
    			//GO
	        	var p1 = new Promise(async function(resolve, reject){setTimeout(function(){resolve({status:500, timeout:true});},3000);});
	        	var p2 = fetch('/api/settings', {
	        		headers: {
						'Accept': 'application/json',
	 					'Content-Type': 'application/json'
					},
				    method: "POST",
				    signal: signal,
				    body: JSON.stringify(oSettings)
				});
				
				//HANDLE
				Promise.race([p1,p2]).then(async function(r){
					if(r.status === 201 || r.status === 200){
						//
					}else{
						if(r.timeout){
							controller.abort();
						}else{
							//
						}
					}
				});
			};
			return oModel;
		},
		createViewModel: function () {
			var oModel = new JSONModel();
			oModel.init = function(){
				this.setProperty("/id", 1); 
				this.setProperty("/selectedButton",2);
				this.setProperty("/stackLength", 0);
				this.setProperty("/uniqueParameter", false);
				this.setProperty("/unique", 0);
				this.setProperty("/messages", [{type:'Success', title: 'Application started', subtitle: 'Welcome in Den Bosch!'}]);
			};
			oModel.add = function(n,m){
				var i = this.getProperty("/stackLength");
				this.setProperty("/stackLength", i + m);
				if(n>0){
					i = this.getProperty("/id");
					this.setProperty("/id", i + 1);
				}
			};
			oModel.getId = function(){
				return this.getProperty("/id");
			};
			oModel.getRadioStatus = function(){
				return this.getProperty("/selectedButton");
			};
			oModel.addMessage = function(type, title, subtitle=''){
				console.log(title);
				var o = {type:type, title:title, subtitle:subtitle};
				var a = this.getProperty("/messages");
				a.push(o);
				this.setProperty("/messages",a);
			};
			oModel.clearMessages = function(type, title, subtitle=''){
				this.setProperty("/messages", []);
			};
			oModel.getNextUniqueParameterText= function(){
				if(this.getProperty("/uniqueParameter")===true){
					var r = this.getProperty("/unique");
					r++;
					this.setProperty("/unique", r);
					r = '?param=' + r;
				}else{
					r = '';
				}
				return r;
			};
			return oModel;
		}

	};
});