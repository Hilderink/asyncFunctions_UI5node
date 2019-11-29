sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"web/web/model/models",
	'sap/m/MessageBox',
	"web/web/util/callstack",
	"sap/ui/core/Fragment"
], function (Controller, models, messageBox, callStack, Fragment) {
	"use strict";

	return Controller.extend("web.web.controller.View1", {
		onInit: function () {
			// set data model
			var oSettingsModel = models.createSettingsModel();
			oSettingsModel.init();
			this.getView().setModel(oSettingsModel, "settings");
			
			var oViewModel = models.createViewModel();
			oViewModel.init();
			this.getView().setModel(oViewModel, "view");
			
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
			).then(function(o){
				oView.add(0,-1);
				oView.addMessage('Success', 'GET succeeded for id:' + o.id, o.attachedServerMessage);
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
		
		handlePressPost1old: function() {
			//var oModel = this.getView().getModel("view");
			//oView.add(1,1);
			//this.handlePressTemp();
			//oView.add(0,-1);
		},
		handlePressTempold: function() {
			var oModel = this.getView().getModel("view");
			var i = oModel.getProperty("/waiter/length");
			i++;
			oModel.setProperty("/waiter/length",i);
			if(i>3){
				var that = this;
				var aGroupElements = sap.ui.getCore().byFieldGroupId("").filter(
					function(e){
						if(e.getCustomData().filter(function(cde){if(cde.getKey()==='waiterGroup'&&cde.getValue()==='group1'){return true;}else{return false;}}).length>0){
							return true;
						}
					});
				aGroupElements.forEach(e => e.setBusy(true));
				setTimeout(
					function(){that.getView().setBusy(true);}
					, 5000);
				setTimeout(
					function(){that.showError();}
					, 10000);
			}
		},
		showError: function() {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			messageBox.alert(
				"Your connection timed out. Check your connection and restart the application.",
				{
					styleClass: bCompact ? "sapUiSizeCompact" : ""
				}
			);
		},
		onOpenDialog : function () {
			var oView = this.getView();

			// create dialog lazily
			if (!this.byId("helloDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "web.web.fragments.mainDialog"
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