sap.ui
		.define(
				[ "z_tpo_timecard/controller/common/timesheet",
				  "z_tpo_timecard/model/model-app",
				  "z_tpo_timecard/model/model-tempo",
				  "z_tpo_timecard/model/model-texts",
				  "z_tpo_timecard/model/model-timecard",
				  "z_tpo_timecard/model/model-timecarddetails",
				  "tpoUtils/common/base"
				  ],
				function(Controller, mApp, mTempo, mTexts, mTimecard, mTcDetails,_d) {
					"use strict";
					return Controller
							.extend(
									"z_tpo_timecard.controller.timesheetDerco",
									{
										grid: null,
										enterTimeDialog : {
											Model : null,
											Control : null,
										},
										onInit : function() {

											var _view = this.getView();
											
											this.getView().setModel(mTempo.get());
											this.getView().setModel(mTimecard.get(), "tcard");											
											this.getView().setModel(new sap.ui.model.json.JSONModel({
												seqnr:null,
												time1: null,
												time2: null,
												lunch1: null,
												lunch2: null,
												date:null,
												dateFrom : null,
												dateTo : null,
												add:false,
												sPath:null,
												minDate: mTempo.grid.StartDate,
												maxDate: mTempo.grid.payEndDate
											}),'derco');
											

											this.getView().addStyleClass(
													"sapUiSizeCompact");

											sap.ui.getCore().getEventBus().subscribe("framework", "renderDerco", this.evOnRenderDerco, this);
											sap.ui.getCore().getEventBus().subscribe("framework", "refreshChild", this.evOnRenderDerco, this);
											
										},

										evOnRenderDerco : function(channel, event, data) {
											this.renderDetailsGrid();		
										},

										/**
										 * Similar to onAfterRendering, but this
										 * hook is invoked before the
										 * controller's View is re-rendered (NOT
										 * before the first rendering! onInit()
										 * is used for that one!).
										 * 
										 * @memberOf lm_app1.app
										 */
										onBeforeRendering : function() {

										},

										/**
										 * Called when the View has been
										 * rendered (so its HTML is part of the
										 * document). Post-rendering
										 * manipulations of the HTML could be
										 * done here. This hook is the same one
										 * that SAPUI5 controls get after being
										 * rendered.
										 * 
										 * @memberOf lm_app1.app
										 */
										 onAfterRendering: function() {
												var self = this;

												this.resizeGridHeight();

												window.onresize = function() {
													self.resizeGridHeight();
												}

										
										 },
										/**
										 * Called when the Controller is
										 * destroyed. Use this one to free
										 * resources and finalize activities.
										 * 
										 * @memberOf lm_app1.app
										 */
										onExit : function() {
											sap.ui.getCore().getEventBus().unsubscribe("framework", "renderDerco", this.evOnRenderDerco, this);
											sap.ui.getCore().getEventBus().unsubscribe("framework", "refreshChild", this.evOnRenderDerco, this);
											(!mTimecard.get().oData.ApprovalMode && mTimecard.get().oData.Editable) ? sap.ui.getCore().getEventBus().publish("tempoNav", "reloadTimedata") : false ;
											this.exitFramework();

										},

										renderDetailsGrid : function() {
											var self = this;

											if (!(this.grid instanceof sap.m.Table)) {
											    this.grid = new sap.m.Table(
												    {
													inset : false,
													headerDesign : sap.m.ListHeaderDesign.Standard,
													mode : sap.m.ListMode.None,
													includeItemInSelection : false,
													headerToolbar: new sap.m.Bar({
														contentLeft: [
															new sap.m.Label({
																text: 'headerToolbar'
															})
														]
														}),
													infoToolbar: new sap.m.Bar({
														contentLeft: [
															new sap.m.Label({
																text: 'infoToolbar'
															})
														]
													})
												    });
											} 
											this.grid.removeAllColumns();
											
											this.grid
											.addColumn(new sap.m.Column(
												{
													mergeDuplicates: true,
													header :  new sap.m.Label({
									                	text : "{i18n>hdrWkDate}"
													}),
													width: "",
													demandPopin : false,
													//popinDisplay : sap.m.PopinDisplay.WithoutHeade,
												}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "15%",
													header :  new sap.m.Label({
									                	text : "{i18n>hdrStartTime}"
													}),
													minScreenWidth : '1000px',
													demandPopin : true,
													popinDisplay : "Inline",
												}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrULStart}"
														}),
														minScreenWidth : '1000px',
														width: "15%",
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrULEnd}"
														}),
														width: "15%",
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrEndTime}"
														}),
														width: "15%",
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrTotalHrs}"
														}),
														width: "",
														demandPopin : false,
														hAlign: 'Right'
														//popinDisplay : sap.m.PopinDisplay.WithoutHeade,
													}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrTSHrs}"
														}),
														width: "",
														demandPopin : false,
														hAlign: 'Right'
														//popinDisplay : sap.m.PopinDisplay.WithoutHeade,
													}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "2rem",
													hAlign: 'Center',
													visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }"
											}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "2rem",
													hAlign: 'Center',
													visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }"
											}));

											
											var _timerows = new sap.m.ColumnListItem({
												type : {
													path : "{tcard>/}",
													formatter : function(d) {
														if (d) {
															if (d.ApprovalMode === false && d.Editable === true) {
																return 'Active';
															} else {
																return 'Inactive';
															}
														} else {
															return 'Inactive';
														}
													}
												}
											});


											_timerows.addCell(new sap.m.Text({
												text : "{Workdate}"
											}));

											//_timerows.addCell(new sap.m.Text({
											//	text : "{Timestr}"
											//}));
											
											_timerows.addCell(new sap.m.TimePicker({
												value: "{Timestr}",
												displayFormat: "hh:mm a",
												valueFormat: "HH:mm:ss",
												editable : "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												placeHolder: "{i18n>hdrStartTime}",
												change: function(oEvent){
													var _ctx = oEvent.oSource.getBindingContext();
													var oStamp = self.getView().getModel('derco').oData;											
													oStamp.time1 = oEvent.getParameter('newValue') || "-";
													oStamp.time2 = "_";
													oStamp.lunch1 = "_";
													oStamp.lunch2 = "_";
													oStamp.add = false;
													oStamp.sPath = _ctx.sPath;
													oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
													oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');

													mTempo.changeDercoStamp({"Data" :oStamp})
													.done(function(oData, oResponse){
														console.log('updated.');
													})
												}
											}));

											_timerows.addCell(new sap.m.TimePicker({
												value: "{Lunchstr}",
												displayFormat: "hh:mm a",
												valueFormat: "HH:mm:ss",
												editable : "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												placeHolder: "{i18n>hdrStartTime}",
												change: function(oEvent){
													var _ctx = oEvent.oSource.getBindingContext();
													var oStamp = self.getView().getModel('derco').oData;											
													oStamp.time1 = "_";
													oStamp.time2 = "_";
													oStamp.lunch1 = oEvent.getParameter('newValue') || "-";
													oStamp.lunch2 = "_";
													oStamp.add = false;
													oStamp.sPath = _ctx.sPath;
													oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
													oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');
													mTempo.changeDercoStamp({"Data" :oStamp})
													.done(function(oData, oResponse){														
														console.log('updated.');
													})
												}
											}));

											_timerows.addCell(new sap.m.TimePicker({
												value: "{Lunchend}",
												displayFormat: "hh:mm a",
												valueFormat: "HH:mm:ss",
												editable : "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												placeHolder: "{i18n>hdrStartTime}",
												change: function(oEvent){
													var _ctx = oEvent.oSource.getBindingContext();
													var oStamp = self.getView().getModel('derco').oData;											
													oStamp.time1 = "_";
													oStamp.time2 = "_";
													oStamp.lunch1 = "_";
													oStamp.lunch2 = oEvent.getParameter('newValue') || "-";
													oStamp.add = false;
													oStamp.sPath = _ctx.sPath;
													oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
													oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');
													mTempo.changeDercoStamp({"Data" :oStamp})
													.done(function(oData, oResponse){														
														console.log('updated.');
													})
												}
											}));

											_timerows.addCell(new sap.m.TimePicker({
												value: "{Timeend}",
												displayFormat: "hh:mm a",
												valueFormat: "HH:mm:ss",
												editable : "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												placeHolder: "{i18n>hdrStartTime}",
												change: function(oEvent){
													var _ctx = oEvent.oSource.getBindingContext();
													var oStamp = self.getView().getModel('derco').oData;											
													oStamp.time1 = "_";
													oStamp.time2 = oEvent.getParameter('newValue') || "-";
													oStamp.lunch1 = "_";
													oStamp.lunch2 = "_";
													oStamp.add = false;
													oStamp.sPath = _ctx.sPath;
													oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
													oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');
													mTempo.changeDercoStamp({"Data" :oStamp})
													.done(function(oData, oResponse){														
														console.log('updated.');
													})
												}
											}));

//											_timerows.addCell(new sap.m.Text({
//												text : "{Lunchstr}"
//											}));
//
//											_timerows.addCell(new sap.m.Text({
//												text : "{Lunchend}"
//											}));
//
//											_timerows.addCell(new sap.m.Text({
//												text : "{Timeend}"
//											}));


											_timerows.addCell(new sap.m.Text({
												text : "{Dhrs}",
												textAlign : sap.ui.core.TextAlign.Right
											}));

											_timerows.addCell(new sap.m.Text({
												text : "{Tshrs}",
												textAlign : sap.ui.core.TextAlign.Right
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src: "sap-icon://delete",
												hoverColor: "red",
												activeColor: "white",
												activeBackgroundColor: "red",
												press: function(oEvent){
													self.deleteTimeStampLine(oEvent);
												},
												visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												enabled: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }"
											
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src: "sap-icon://add",
												hoverColor: "blue",
												activeColor: "white",
												activeBackgroundColor: "blue",
												press: function(oEvent){
													self.addTimeStampLine(oEvent);
												},
												visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }",
												enabled: "{= ${tcard>/ApprovalMode} === false && ${tcard>/Editable} === true  }"
											
											}));

											this.grid.bindAggregation("items", {
										    	path: "/WorkTimeRecords", 
										    	sorter: {
										    		path: 'Workdate',
										    		descending: false
										    	},
										    	filters: [
										    		new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, mTempo.grid.EmployeeID),
										    		new sap.ui.model.Filter("Payend", sap.ui.model.FilterOperator.EQ, mTempo.grid.payEndDate.toLocaleDateString("en-US"))],
										    	template: _timerows
										    });	
											
											mApp.setSaveVisible(false);
											mApp.get().refresh(true);


										},
										deleteTimeStampLine: function(oEvent) {
											var _ctx = oEvent.oSource.getBindingContext();
												sap.m.MessageBox.confirm( _ctx.oModel.getProperty(_ctx.sPath +'/Workdate')+" at "+_ctx.oModel.getProperty(_ctx.sPath +'/Timestr'), {
													     title:  mTexts.getText('prDelTS'),
													     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
																onClose: function(oAction) {
																	if (oAction === sap.m.MessageBox.Action.YES) {																		
																		mTempo.deleteDercoStamp({sPath:_ctx.sPath, Data: _ctx.oModel.getProperty(_ctx.sPath)})
																			.done(function(data) {
																				_ctx.oModel.refresh(true);
																			});
																	}
																}
														}
													);			
//											}
										},	

										editTimeStampLine: function(oEvent) {
											var _ctx = oEvent.oSource.getBindingContext();
											var self = this;
											var oStamp = this.getView().getModel('derco').oData;											
											oStamp.time1 = _ctx.oModel.getProperty(_ctx.sPath +'/Timestr');
											oStamp.time2 = _ctx.oModel.getProperty(_ctx.sPath +'/Timeend');
											oStamp.lunch1 = _ctx.oModel.getProperty(_ctx.sPath +'/Lunchstr');
											oStamp.lunch2 = _ctx.oModel.getProperty(_ctx.sPath +'/Lunchend');
											oStamp.add = false;
											oStamp.sPath = _ctx.sPath;
											oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
											oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');
											
											if (!self.enterTimeDialog.Control) {												
												self.enterTimeDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.editDerco", self);
											}
											
											_d.openDialog(self.enterTimeDialog);

										},	
										
										
//										setDateValues: function(oEvent){
//											var _vm = this.getView().getModel('derco');
//											var _m = oEvent.oSource.getItems()[0].getBindingContext().oModel;
//											var _p = oEvent.oSource.getItems()[0].getBindingContextPath();
//											var _d=null;
//											_vm.oData.minDate = new Date(_m.getProperty(_p+'/Workdate'));
//											_vm.oData.maxDate = new Date(_m.getProperty(_p+'/Workdate'));
//											
//											for (var ii=0; ii<oEvent.oSource.getItems().length;ii++){
//												_p = oEvent.oSource.getItems()[ii].getBindingContextPath();
//												_d = new Date(_m.getProperty(_p+'/Workdate'));
//												
//												if (_d < _vm.oData.minDate) {
//													_vm.oData.minDate = new Date(_d);
//												}
//
//												if (_d > _vm.oData.maxDate) {
//													_vm.oData.maxDate = new Date(_d);
//												}
//											};
//											
//											_m = null;
//											_vm.refresh(true);
//											sap.ui.getCore().byId("xxDateSel").setDateValue(_vm.oData.dateFrom);
//											sap.ui.getCore().byId("xxDateSel").setSecondDateValue(_vm.oData.dateTo);
//										},
										resizeGridHeight : function() {
											$("#tBody").height($("#tcCont").height()
													- $("#tHeader--header").height());
										},
										changeDateFilter: function(oEvent){
											this.grid.getBinding('items').aFilters = [];
											this.grid.getBinding('items').filter(new sap.ui.model.Filter("Workdate", sap.ui.model.FilterOperator.EQ, oEvent.getParameter('value')));
											mTempo.get().refresh(true);
										},
										onAddTimestamp: function(oEvent){
											var self = this;
											
											this.clearStampEntry();
											this.getView().getModel('derco').oData.add = true;
											if (!self.enterTimeDialog.Control) {												
												self.enterTimeDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.addDerco", self);
											}
											
											_d.openDialog(self.enterTimeDialog);
											
										},
										onTimeEntryCancel : function(oEvent) {
											_d.destroyDialog(this.enterTimeDialog);
										},
										onTimeEntrySave : function(oEvent) {
											var _self = this;
											var _a;
											var _promise = $.Deferred();	
											
											_d.destroyDialog(this.enterTimeDialog);
											
											_a = (this.getView().getModel('derco').oData.add) ? "addDercoStamp" : "changeDercoStamp";
											
											mTempo[_a]({"Data" :this.getView().getModel('derco').oData})
											.done(function(oData, oResponse){
												mTempo.get().refresh(true);
												console.log('updated.');
											})
											return _promise;
										},
										clearStampEntry: function() {
											var oStamp = this.getView().getModel('derco').oData;
											
											oStamp.time1 = null;
											oStamp.time2 = null;
											oStamp.lunch1 = null;
											oStamp.lunch2 = null;
											oStamp.date = null;
										},
										updateTimeRecord: function(oEvent){
											var _ctx = oEvent.oSource.getBindingContext();
											var self = this;
											var oStamp = this.getView().getModel('derco').oData;											
											oStamp.time1 = _ctx.oModel.getProperty(_ctx.sPath +'/Timestr');
											oStamp.time2 = _ctx.oModel.getProperty(_ctx.sPath +'/Timeend');
											oStamp.lunch1 = _ctx.oModel.getProperty(_ctx.sPath +'/Lunchstr');
											oStamp.lunch2 = _ctx.oModel.getProperty(_ctx.sPath +'/Lunchend');
											oStamp.add = false;
											oStamp.sPath = _ctx.sPath;
											oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
											oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');

											mTempo.changeDercoStamp({"Data" :this.getView().getModel('derco').oData})
											.done(function(oData, oResponse){
												mTempo.get().refresh(true);												
												console.log('updated.');
											})

										},
										addTimeStampLine : function(oEvent) {
											var _self = this;
											var _ctx = oEvent.oSource.getBindingContext();

											var oStamp = this.getView().getModel('derco').oData;											
											oStamp.time1 = "-";
											oStamp.time2 = "-";
											oStamp.lunch1 = "-";
											oStamp.lunch2 = "-";
											oStamp.add = false;
											oStamp.sPath = _ctx.sPath;
											oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
											
											mTempo.addDercoStamp({"Data" :oStamp})
											.done(function(oData, oResponse){
												//mTempo.get().refresh(true);	
												_ctx.oModel.refresh(true);
												console.log('updated.');
											})
										},


										
									});
				});