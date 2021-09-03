sap.ui
		.define(
				[ "z_tpo_timecard/controller/common/timesheet",
				  "z_tpo_timecard/model/model-app",
				  "z_tpo_timecard/model/model-tempo",
				  "z_tpo_timecard/model/model-texts",
				  "z_tpo_timecard/model/model-timecard",
				  "z_tpo_timecard/model/model-timecarddetails",
				  "z_tpo_timecard/tempo.utils",
				  "tpoUtils/common/ui",
				  "tpoUtils/common/base"
				  ],
				function(Controller, mApp, mTempo, mTexts, mTimecard, mTcDetails, tempoUtils, _ui,_d) {
					"use strict";
					return Controller
							.extend(
									"z_tpo_timecard.controller.timesheetCOWB",
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
											}),'CWB');
											

											this.getView().addStyleClass(
													"sapUiSizeCompact");

											sap.ui.getCore().getEventBus().subscribe("framework", "renderCOWB", this.evOnRenderCWB, this);
											sap.ui.getCore().getEventBus().subscribe("framework", "refreshChild", this.evOnRenderCWB, this);
											
										},

										evOnRenderCWB : function(channel, event, data) {
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
											sap.ui.getCore().getEventBus().unsubscribe("framework", "renderCOWB", this.evOnRenderCWB, this);
											sap.ui.getCore().getEventBus().unsubscribe("framework", "refreshChild", this.evOnRenderCWB, this);
											//sap.ui.getCore().getEventBus().publish("tempoNav", "reloadTimedata");
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
													/*
													headerToolbar: new sap.m.Bar({
														contentLeft: [
															new sap.m.Label({
																text: 'headerToolbar'
															})
														]
														}),
													*/
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
											
											this.grid.addColumn(new sap.m.Column(
												{
													mergeDuplicates: true,
													header :  new sap.m.Label({
									                	text : "{i18n>hdrWkDate}"
													}),
													width: "20%",
													demandPopin : false
												}));

											this.grid.addColumn(new sap.m.Column(
												{
												//	header :  new sap.m.Label({
									             //   	text : "i1"
												//	}),
													width: "1rem",
													hAlign: 'Center',
												}));

											this.grid.addColumn(new sap.m.Column(
												{
												//	header :  new sap.m.Label({
									             //   	text : "i2"
												//	}),
													width: "1rem",
													hAlign: 'Center'
											}));

											
											this.grid.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : ((_ui.isCompact()) ? "Rest" : "Rest Break Conf"),
														}),
														width: "20%",
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : ((_ui.isCompact()) ? "Missed Rest" : "Missed Rest Break")
														}),
														width: "20%",
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : ((_ui.isCompact()) ? "Unp MB Conf" : "Unpaid Meal Break Conf")
														}),
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));

											this.grid.addColumn(new sap.m.Column(
													{
														header :  new sap.m.Label({
										                	text : ((_ui.isCompact()) ? "Paid MB Conf" : "Paid Meal Break Conf")
														}),
														minScreenWidth : '1000px',
														demandPopin : true,
														popinDisplay : "Inline",
													}));


											
											var _timerows = new sap.m.ColumnListItem({
												type : {
													path : "timecard>/ApprovalMode",
													formatter : function(d) {
														return (d) ? 'Inactive' : 'Navigation';
													},
												},
												press: function(oEvent) {
													var _act = mTimecard.get().oData.ApprovalMode;
													(_act) ? false : self.launchCWB(oEvent.oSource.getCells()[0].getText());
												}
											});


											_timerows.addCell(new sap.m.Text({
												text : {
													path : "Workdate",
													formatter : function(d) {
														return _d.timeToEST(d).toLocaleDateString("en-US");
													}
												}
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src : 
												{
													path : "ZzCompletionStatus",
													formatter : function(d) {
														var _d = d || 'X';
														return _ui.getStatusIcon(_d)
													},										
												},
												color: 
												{
													path : "ZzCompletionStatus",
													formatter : function(d) {
														var _d = d || 'X';
														switch(_d){
															case 'C' : return "green"; break;
															case 'I' : return "red"; break;
															case 'X' : return "red"; break;
															default: return "blue"; break;
														}
														return _ui.getStatusIcon(_d)
													}										
												},
												visible: true
											
												})
											);


											_timerows.addCell(new sap.ui.core.Icon({
												src: "sap-icon://general-leave-request",
												color: "blue",
												//visible: true
												visible: {
													path : "ZzAbsenceDay",
													formatter : function(d) {
														return d;
														}
													},
												})
											);

											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://accept",
												color: "green",
												visible: {
													path : "",
													formatter : function(d) {
														return (d) ? (!d.ZzAbsenceDay && (d.ZzRpAcknowledgement==='Y') && d.ZzRpStatus) : false;
														}	
												}
											}));


											_timerows.addCell(new sap.m.Label({
												text: {
													path : "ZzRpMissed",
													formatter : function(d) {
														var _d = (d) ? d : 0;
														return _d;
													}
												},
												visible: {
													path : "",
													formatter : function(d) {
														return (d) ? (!d.ZzAbsenceDay && (d.ZzRpAcknowledgement==='N') && d.ZzRpStatus) : false;
														}	
												}
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://accept",
												color: "green",
												visible: {
													path : "",
													formatter : function(d) {
														return (d) ? (!d.ZzAbsenceDay && (d.ZzMealBreakConfirmation==='U') && d.ZzMbStatus) : false;
														}	
												}
											}));

											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://accept",
												color: "green",
												visible: {
													path : "",
													formatter : function(d) {
														return (d) ? (!d.ZzAbsenceDay && (d.ZzMealBreakConfirmation==='P') && d.ZzMbStatus) : false;
														}	
												}
											}));
											
											

											this.grid.bindAggregation("items", {
										    	path: "/cowbSet", 
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

										formatSpan : function(timeDiff) {
									
										        var hours = parseInt(timeDiff/(1000*60*60));
										        var minutes = parseInt((timeDiff/(1000*60))%60);
												var seconds = parseInt((timeDiff/1000)%60);
												
									      	    hours = (hours < 10) ? "0" + hours : hours;
									      	    minutes = (minutes < 10) ? "0" + minutes : minutes;
									      	    seconds = (seconds < 10) ? "0" + seconds : seconds;
									      	    
									      	    //var _str = (hours>0 && minutes>0) ? hours + ":" + minutes : " ";

									      	    return (hours>0 || minutes>0) ? hours + ":" + minutes : " ";
												
										},	

										resizeGridHeight : function() {
											$("#tBody").height($("#tcCont").height()
													- $("#tHeader--header").height());
										},
										formatDateTime: function(d) {
											var ds = (d) ? d.toLocaleDateString("en-US") + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : " ";
											return ds
										},
										launchCWB: function(workdate){
											sap.ui.getCore().getEventBus().publish("tempoNav", "navToCOWB", { "workdate": workdate, "pernr": mTempo.grid.EmployeeID, 'editable':mTempo.grid.editable});

								//			var appObject = this;
								//			var _pernr = mTempo.grid.EmployeeID;
								//			
								//			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");/

//											oCrossAppNav.toExternal({
//												  target : { semanticObject : "ZCAWBSEMOBJ", action : "display" },
//												  params : { "workdate": workdate, "pernr": mTempo.grid.EmployeeID, caller: lza.compressToEncodedURIComponent('dadsas') }
//											}); 		
										},
										setDateValues: function(oEvent){
											
										}



										
									});
				});