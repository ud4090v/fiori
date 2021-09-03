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
									"z_tpo_timecard.controller.timesheetStamps",
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
												type:null,
												seqnr:null,
												time1: null,
												time2: null,
												date:null,
												ccode: null,
												ccsel:false,
												dateFrom : null,
												dateTo : null,
												add:false,
												sPath:null,
												minDate: mTempo.grid.StartDate,
												maxDate: mTempo.grid.payEndDate
											}),'stamps');
											

											this.getView().addStyleClass(
													"sapUiSizeCompact");

											sap.ui.getCore().getEventBus().subscribe("framework", "renderStamps", this.evOnRenderStamps, this);
											sap.ui.getCore().getEventBus().subscribe("framework", "refreshChild", this.evOnRenderStamps, this);
											
										},

										evOnRenderStamps : function(channel, event, data) {
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
											sap.ui.getCore().getEventBus().unsubscribe("framework", "renderStamps", this.evOnRenderStamps, this);
											sap.ui.getCore().getEventBus().unsubscribe("framework", "refreshChild", this.evOnRenderStamps, this);
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
									                	text : "{i18n>hdrDate}"
													}),
													width: "",
												//	demandPopin : true,
												//	popinDisplay : "Inline",
												}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "",
													header :  new sap.m.Label({
									                	text : "{i18n>hdrType}"
													}),
													//demandPopin : true,
													//popinDisplay : sap.m.PopinDisplay.WithoutHeade
												}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrRealTime}"
														}),
														width: "",
//														demandPopin : true,
//														popinDisplay : "Inline",
													}));

											this.grid
											.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : "{i18n>hdrAdjTime}"
														}),
														minScreenWidth : '1000px',
														width: "",
														demandPopin : true,
														popinDisplay : "Inline",
													}));


											this.grid
												.addColumn(new sap.m.Column(
													{
														minScreenWidth : '1000px',
														header :  new sap.m.Label({
										                	text : "{i18n>hdrChargeCode}"
														}),
														demandPopin : true,
														popinDisplay : "Inline",
												}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "2rem",
													visible: "{= ${tcard>/TimeManager} === true && ${tcard>/Editable} === true }",
											}));

											this.grid
											.addColumn(new sap.m.Column(
												{
													width: "2rem",
													visible: "{= ${tcard>/TimeManager} === true && ${tcard>/Editable} === true }",
											}));

											
											var _timerows = new sap.m.ColumnListItem({
												type : "Active",
											});


											_timerows.addCell(new sap.m.Text({
												text : "{Workdate}"
											}));

											_timerows.addCell(new sap.m.Text({
												text : "{Typetext}"
											}));

											_timerows.addCell(new sap.m.Text({
												text : "{Timestr}"
											}));

											_timerows.addCell(new sap.m.Text({
												text : "{Timeadj}"
											}));


											_timerows.addCell(new sap.m.Text({
												text : "{Ccode}"
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src: "sap-icon://delete",
												hoverColor: "red",
												activeColor: "white",
												activeBackgroundColor: "red",
												press: function(oEvent){
													self.deleteTimeStampLine(oEvent);
												},
												visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/TimeManager} === true && ${tcard>/Editable} === true && ${Enabled} === true}",
												enabled: "{= ${tcard>/ApprovalMode} === false && ${tcard>/TimeManager} === true && ${tcard>/Editable} === true && ${Enabled} === true}"
											
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src: "sap-icon://edit",
												hoverColor: "blue",
												activeColor: "white",
												activeBackgroundColor: "blue",
												press: function(oEvent){
													self.editTimeStampLine(oEvent);
												},
												visible: "{= ${tcard>/ApprovalMode} === false && ${tcard>/TimeManager} === true && ${tcard>/Editable} === true && ${Enabled} === true}",
												enabled: "{= ${tcard>/ApprovalMode} === false && ${tcard>/TimeManager} === true && ${tcard>/Editable} === true && ${Enabled} === true}"
											
											}));

											this.grid.bindAggregation("items", {
										    	path: "/TimestampSet", 
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
												sap.m.MessageBox.confirm( _ctx.oModel.getProperty(_ctx.sPath +'/Typetext')+" : "+_ctx.oModel.getProperty(_ctx.sPath +'/Workdate')+" at "+_ctx.oModel.getProperty(_ctx.sPath +'/Timestr'), {
													     title:  mTexts.getText('prDelTS'),
													     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
																onClose: function(oAction) {
																	if (oAction === sap.m.MessageBox.Action.YES) {																		
																		mTempo.deleteTimeStamp({sPath:_ctx.sPath, Data: _ctx.oModel.getProperty(_ctx.sPath)})
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
											var oStamp = this.getView().getModel('stamps').oData;											
											oStamp.type = _ctx.oModel.getProperty(_ctx.sPath +'/Type');
											oStamp.time1 = _ctx.oModel.getProperty(_ctx.sPath +'/Timestr');
											oStamp.add = false;
											oStamp.sPath = _ctx.sPath;
											oStamp.date = new Date(_ctx.oModel.getProperty(_ctx.sPath +'/Workdate'));
											oStamp.ccode = _ctx.oModel.getProperty(_ctx.sPath +'/Ccode');
											oStamp.seqnr = _ctx.oModel.getProperty(_ctx.sPath +'/Seqnr');
											
											if (!self.enterTimeDialog.Control) {												
												self.enterTimeDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.editTS", self);
											}
											
											_d.openDialog(self.enterTimeDialog);

										},	
										
										
//										setDateValues: function(oEvent){
//											var _vm = this.getView().getModel('stamps');
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
											this.getView().getModel('stamps').oData.add = true;
											if (!self.enterTimeDialog.Control) {												
												self.enterTimeDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.addTS", self);
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
											
											_a = (this.getView().getModel('stamps').oData.add) ? "addTimeStamp" : "changeTimeStamp";
											
											mTempo[_a]({"Data" :this.getView().getModel('stamps').oData})
											.done(function(oData, oResponse){
												console.log('updated.');
											})
											return _promise;
										},
										clearStampEntry: function() {
											var oStamp = this.getView().getModel('stamps').oData;
											
											oStamp.type = null;
											oStamp.time1 = null;
											oStamp.time2 = null;
											oStamp.date = null;
											oStamp.ccode = null;
										}

										
									});
				});