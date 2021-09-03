sap.ui
		.define(
				[ "z_tpo_timecard/controller/common/timesheet",
				  "z_tpo_timecard/model/model-app",
				  "z_tpo_timecard/model/model-tempo",
				  "z_tpo_timecard/model/model-timecard",
				  "z_tpo_timecard/model/model-timecarddetails"
				  ],
				function(Controller, mApp, mTempo, mTimecard, mTcDetails) {
					"use strict";
					return Controller
							.extend(
									"z_tpo_timecard.controller.timesheetDetails",
									{
										grid: null,
										onInit : function() {

											var _view = this.getView();

											mTcDetails.create().done(function(oModel) {
												mTcDetails.set(oModel,_view);
											});
											
										//    var oMetaModel = mTempo.get().getMetaModel();
										//    oMetaModel.loaded().then($.proxy(function () { 
										//		var _tCard = mTimecard.get().oData.TimesheetDetails;
										//   	mTcDetails.loadData(oMetaModel, _tCard);
										//    }));

											this.getView().addStyleClass(
													"sapUiSizeCompact");
											

											sap.ui.getCore().getEventBus().subscribe("framework", "renderDetails", this.evOnRenderDetails, this);
											sap.ui.getCore().getEventBus().subscribe("framework", "refreshChild", this.evOnRenderDetails, this);
											
										},

										evOnRenderDetails : function(channel, event, data) {
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
											sap.ui.getCore().getEventBus().unsubscribe("framework", "renderDetails", this.evOnRenderDetails, this);
											sap.ui.getCore().getEventBus().unsubscribe("framework", "refreshChild", this.evOnRenderDetails, this);
											this.exitFramework();

										},

										renderDetailsGrid : function() {
											var self = this;

										    var oMetaModel = mTempo.get().getMetaModel();
										    oMetaModel.loaded().then($.proxy(function () { 
												var _tCard = mTimecard.get().oData.TimesheetDetails;
												mTempo.getTSDetFlags()
												.done(function(oData, oResponse){
													var _flags = $.grep(oData,
														    function(a) {
																return (a.F);
													    });
													mTcDetails.loadData(oMetaModel, _flags, _tCard);
											    	self.buildDetailsGrid();
												})
										    	
										    }));

										},
										
										buildDetailsGrid : function() {
											var self = this;

											mApp.setSaveVisible(true);
											mApp.get().refresh(true);

											if (!(this.grid instanceof sap.m.Table)) {
											    this.grid = new sap.m.Table(
												    {
													inset : false,
													headerDesign : sap.m.ListHeaderDesign.Standard,
													mode : sap.m.ListMode.None,
													includeItemInSelection : false,
												    });
											} 
											this.grid.removeAllColumns();
											
											this.grid
												.addColumn(new sap.m.Column(
													{
														width : "180px",
														//hAlign: "Right"
													}));

											this.grid
												.addColumn(new sap.m.Column(
													{
														width: '180px',
													//	width : "8px",
													    minScreenWidth : '350px',
													    demandPopin : true,
													    popinDisplay : sap.m.PopinDisplay.WithoutHeade,
													}));

											this.grid
											.addColumn(new sap.m.Column(
												{
												//	width : "8px",
												    minScreenWidth : '350px',
												    demandPopin : true,
												    popinDisplay : sap.m.PopinDisplay.WithoutHeade,
												}));

											this.grid
											.addColumn(new sap.m.Column(
												{
												//	width : "8px",
												    minScreenWidth : '350px',
												    demandPopin : true,
												    popinDisplay : sap.m.PopinDisplay.WithoutHeade,
												}));

											
											var _timerows = new sap.m.ColumnListItem({
												type : "Active",
											});

											
											_timerows.addCell(new sap.m.Text({
												text : "{label}",
												wrapping: true,
												//textAlign: sap.ui.core.TextAlign.Right
											}));

											_timerows.addCell(self.valueLines());											
											_timerows.addCell(self.valueTextLines());
											_timerows.addCell(self.valueDatesLines());

											this.grid.bindAggregation("items", "/", _timerows);
										},
										
										valueLines : function() {
											var _itemLine = new sap.ui.layout.VerticalLayout();

											_itemLine.bindAggregation("content", {
											       path: 'valueTab',
											       template: new sap.m.Label({
											    	   text: "{value}",
											      }),
											      templateShareable:true
											});

											return (_itemLine);
										},
										valueTextLines : function() {
											var _itemLine = new sap.ui.layout.VerticalLayout();
											
											_itemLine.bindAggregation("content", {
											       path: 'valueTab',
											       template: new sap.m.Label({
											    	   text: "{text}",
											      }),
											      templateShareable:true
											});

											return (_itemLine);
										},
										valueDatesLines : function() {
											var _itemLine = new sap.ui.layout.VerticalLayout();
											
											_itemLine.bindAggregation("content", {
											       path: 'valueTab',
											       template: new sap.m.Label({
											    	   text: {
											    		   path : "",
											    		   formatter: function(d) {
											    			   if(d) {
											    				   return (d.begda) ? "{i18n>hdrEff}: "+d.begda +" - " + d.endda : "";
											    			   } else {
											    				   return "";
											    			   }
											    			   
											    		   }
											    	   }
											      }),
											      templateShareable:true
											});

											return (_itemLine);
										},

										resizeGridHeight : function() {
											$("#tBody").height($("#tcCont").height()
													- $("#tHeader--header").height());
										},
										
									});
				});