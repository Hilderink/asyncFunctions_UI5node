sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"web2/web2/model/models",
	'sap/m/MessageBox',
	"web2/web2/util/callstack",
	"sap/ui/core/Fragment"
], function (Controller, models, messageBox, callStack, Fragment) {
	"use strict";

	return Controller.extend("web2.web2.controller.View1", {
		onInit: function () {
			// set data model
			var oSettingsModel = models.createSettingsModel();
			oSettingsModel.init();
			this.getView().setModel(oSettingsModel, "settings");
			
			var oViewModel = models.createViewModel();
			oViewModel.init();
			this.getView().setModel(oViewModel, "view");
			
			callStack.initiateOnView(this.getView());
			
		},
		handlePressSaveSettings: function(){
			var oSettingsModel = this.getView().getModel("settings");
			oSettingsModel.setSettings();
		},
		handlePressClear: function() {
			var oView = this.getView().getModel("view");
			oView.clearMessages();
		},
		handlePressGet: function() {
			var oView = this.getView().getModel("view");
			var param = oView.getNextUniqueParameterText();
			switch(oView.getRadioStatus()){
				case 0:
					this.handlePressGet1(param);	
					break;
				case 1:
					this.handlePressGet2(param);	
					break;
				case 2:
					this.handlePressGet3(param);	
					break;
			}
		},
		handlePressPost: function() {
			var oView = this.getView().getModel("view");
			var param = oView.getNextUniqueParameterText();
			switch(oView.getRadioStatus()){
				case 0:
					this.handlePressPost1(param);	
					break;
				case 1:
					this.handlePressPost2(param);	
					break;				
				case 2:
					this.handlePressPost3(param);	
					break;
			}
		},
		handlePressGet1: function(param) {
			var oView = this.getView().getModel("view");
			oView.add(0,1);
			oView.addMessage('Information', 'GET started' );
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/api/data" + param,
				dataType: "json",
				success: function(o){
					oView.add(0,-1);
					oView.addMessage('Success', 'GET succeeded for id:' + o.id, o.attachedServerMessage);
				}
			});
		},
		handlePressGet2: function(param) {
			var oView = this.getView().getModel("view");
			oView.add(0,1);
			oView.addMessage('Warning', 'GET stacked' );
			callStack.get(
				'/api/data' + param, 
				'group1', 
				function(){oView.addMessage('Information', 'GET started' );}
			)
			.then(function(o){
				oView.add(0,-1);
				oView.addMessage('Success', 'GET succeeded for id:' + o.id, o.attachedServerMessage                          );
			});
		},
		handlePressPost1: function(param) {
			var oView = this.getView().getModel("view");
			var oData = {};
			oView.add(1,1);
			oData.id = oView.getId();
			oView.addMessage('Information', 'POST started for id:' + oData.id, '' );
			jQuery.ajax({
				type: "POST",
				contentType: "application/json",
				url: "/api/data" + param,
				dataType: "json",
				data: JSON.stringify(oData),
				success: function(o){
					oView.add(0,-1);
					oView.addMessage('Success', 'POST succeeded for id:' + oData.id);
				}
			});
		},
		handlePressPost2: function(param) {
			var oView = this.getView().getModel("view");
			var oData = {};
			oView.add(1,1);
			oData.id = oView.getId();
			oView.addMessage('Warning', 'POST stacked for id:' + oData.id, '' );
			callStack.post(
				'/api/data' + param, 
				'group1', 
				oData, 
				function(){oView.addMessage('Information', 'POST started for id:' + oData.id, '' );}
			)
			.then(function(o){
				oView.add(0,-1);
				oView.addMessage('Success', 'POST succeeded for id:' + oData.id);
			});
		},		
		handlePressGet3: function(param) {
			var oView = this.getView().getModel("view");
			oView.add(0,1);
			oView.addMessage('Warning', 'GET stacked' );
			callStack.get(
				'/api/data' + param, 
				'group1', 
				function(){oView.addMessage('Information', 'GET started' );}
			)
			.then(function(o){
				oView.add(0,-1);
				oView.addMessage('Success', 'GET succeeded for id:' + o.id, o.attachedServerMessage);
			})
			.catch(function(o){
				oView.add(0,-1);
				oView.addMessage('Error', 'GET failed');
			});
		},
		handlePressPost3: function(param) {
			var oView = this.getView().getModel("view");
			var oData = {};
			oView.add(1,1);
			oData.id = oView.getId();
			oView.addMessage('Warning', 'POST stacked for id:' + oData.id, '' );
			callStack.post(
				'/api/data' + param, 
				'group1', 
				oData, 
				function(){oView.addMessage('Information', 'POST started for id:' + oData.id, '' );}
			)
			.then(function(o){
				oView.add(0,-1);
				oView.addMessage('Success', 'POST succeeded for id:' + oData.id);
			})
			.catch(function(o){
				oView.add(0,-1);
				oView.addMessage('Error', 'POST failed for id:' + oData.id);
			});
		},
		onOpenDialog : function () {
			var oView = this.getView();

			// create dialog lazily
			if (!this.byId("helloDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "web2.web2.fragments.mainDialog"
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("helloDialog").open();
			}
		}
	});
});