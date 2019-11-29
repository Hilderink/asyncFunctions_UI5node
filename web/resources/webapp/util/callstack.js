sap.ui.define([
'sap/m/MessageBox'
	], function(MessageBox) {
	"use strict";
	
	class stack {
		constructor(n){
			this.name = n;
			this.myArray = [];
			this.inProgress = false;
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
			var that = this;
			return new Promise(async function(resolve,reject){
				that.inProgress = true;
				var firstRow = that.myArray.splice(0,1)[0];
				firstRow.onStart();
				var d = await fetch(firstRow.url, {
	        		headers: {
						'Accept': 'application/json',
	 					'Content-Type': 'application/json'
					},
				    method: firstRow.method,
				    body: JSON.stringify(firstRow.data)
				});
				that.inProgress = false;
				var r = await d.json();
				firstRow.resolve(r);
				if(that.getLength()>0){
					setTimeout(function(){that.executeNext();},0);
				}
			});
		}
	}
	
	return{
		aStack: [],
		getStack: function(n){
			var s = this.aStack.find(function(s){return(s.name===n);});
			if(s===undefined){
	 			s = new stack(n);
	 			this.aStack.push(s);
	 		}
	 		return s;
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
		},
		getStackLength(group){
			var oStack = this.getStack(group);
			return oStack.getLength();
		}
	};
});