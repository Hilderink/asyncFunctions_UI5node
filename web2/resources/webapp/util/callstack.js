sap.ui.define([
'sap/m/MessageBox'
	], function(MessageBox) {
	"use strict";
	
	class stack {
		constructor(n){
			this.name = n;
			this.myArray = [];
			this.inProgress = false;
			this.isLimit = false;
			this.alertList = [];
		}
		static initiateOnView(v){
			this.v = v;
			this.aStack = [];
			this.i = 0;
		}
		static getStack(n){
			var s = this.aStack.find(function(s1){return(s1.name===n);});
			if(s===undefined){
	 			s = new stack(n);
	 			this.aStack.push(s);
	 		}
	 		return s;
		}
		push(o){
			this.myArray.push(o);
		}
		getLength(){
			var i = this.myArray.length;
			if(this.inProgress){
				i++;
			}
			return i;
		}
		executeNext(){
			this.controller = new AbortController();
			const signal = this.controller.signal;
			var that = this;
			return new Promise(async function(resolve,reject){
				that.inProgress = true;
				var firstRow = that.myArray.splice(0,1)[0];
				firstRow.onStart();
				var p1 = fetch(firstRow.url, {
	        		headers: {
						'Accept': 'application/json',
	 					'Content-Type': 'application/json'
					},
				    method: firstRow.method,
				    signal: signal,
				    body: JSON.stringify(firstRow.data)
				});
				var p2 = new Promise(
					function(resolve,reject){
						setTimeout(function(){
							resolve('Slow');
						},3000);
				});
				var p3 = new Promise(
					function(resolve,reject){
						setTimeout(function(){
							reject('Timeout');
						},10000);
				});
				try{
					var d = await Promise.race([p1,p2]);
					if(d!=='Slow'){
						var o = await d.json();
					}else{
						that.checkLimits();
						d = await Promise.race([p1,p3]);
						o = await d.json();
					}
					firstRow.resolve(o);
				}catch(e){
					stack.abortProgram();
					firstRow.reject(e);
				}finally{
					that.inProgress = false;
					that.checkLimits();
					if(that.getLength()>0){
						setTimeout(function(){that.executeNext();},0);
					}
				}
			});
		}
		checkLimits(){
			var that = this;
			if(that.getLength()>3){
				that.isLimit = true;
			}
			if(that.getLength()<2){
				if(that.isLimit){
					that.unsetGroupBusy();
				}
				that.isLimit = false;
			}
			if(that.isLimit){
				that.setGroupBusy();
			}
		}
		setGroupBusy(){
			var that = this;
			var p1 = new Promise(function(resolve, reject){
				setTimeout(function(){reject();},5000);
				that.alertList.push(resolve);
			})
			.then(function(){
				
			})
			.catch(function(e){
				stack.setGeneralBusy(that.name);
			});
			var aGroupElements = sap.ui.getCore().byFieldGroupId("").filter(
				function(e){
					if(e.getCustomData().filter(function(cde){if(cde.getKey()==='waiterGroup'&&cde.getValue()===that.name){return true;}else{return false;}}).length>0){
						return true;
					}
				});
			aGroupElements.forEach(e => e.setBusy(true));
		}
		unsetGroupBusy(){
			var that = this;
			stack.unsetGeneralBusy(this.name);
			for (var resolveElement of that.alertList) {         
			    resolveElement(); 
			}     
			var aGroupElements = sap.ui.getCore().byFieldGroupId("").filter(
				function(e){
					if(e.getCustomData().filter(function(cde){if(cde.getKey()==='waiterGroup'&&cde.getValue()===that.name){return true;}else{return false;}}).length>0){
						return true;
					}
				});
			aGroupElements.forEach(e => e.setBusy(false));
		}
		static setGeneralBusy(n){
			if(n==='group1'){
				this.v.setBusy(true);
			}
		}
		static unsetGeneralBusy(n){
			if(n==='group1'){
				if(this.i===0){
					this.v.setBusy(false);
				}
			}
		}
		static abortProgram(){
			for(var oStack of this.aStack){
				oStack.abortStack();
			}
			this.showConnectionError();
		}
		abortStack(){
			this.controller.abort();
			this.myArray = [];
		}
		static showConnectionError(){
			MessageBox.alert(
				"Your connection timed out. Check your connection and restart the application.",
				{
					styleClass: "sapUiSizeCompact"
				}
			);
			throw new Error('Application aborted!');
		}
	}
	
	return{
		aStack: [],
		initiateOnView: function(v){
			stack.initiateOnView(v);
		},
		getStack: function(n){
	 		return stack.getStack(n);
		},
		get: function(url, group, fOnStart) {
			var that = this;
			return new Promise(function(resolve, reject){
				var o = {url: url, method:'GET', resolve: resolve, reject: reject, onStart: fOnStart};
				var oStack = that.getStack(group);
				oStack.push(o);
				if(oStack.getLength()===1){
					var result = oStack.executeNext();
				}
			});
		},
		post: function(url, group, data, fOnStart) {
			var that = this;
			return new Promise(function(resolve, reject){
				var o = {url: url, method:'POST', data:data, resolve: resolve, reject: reject, onStart: fOnStart};
				var oStack = that.getStack(group);
				oStack.push(o);
				if(oStack.getLength()===1){
					var result = oStack.executeNext();
				}
			});
		}
	};
});