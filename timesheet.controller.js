/* Timesheet Controller
 * --by_Serge_Breslaw(n88977),@//www.linkedin.com/in/sergebreslaw
 * 
 * @memberOf z_tpo_timecard.controller.timesheet
 */
	
sap.ui
		.define(
				[ "z_tpo_timecard/controller/common/timesheet",
				  "sap/ui/model/Filter",
				  "z_tpo_timecard/model/model-app",
				  "z_tpo_timecard/control/tempoInputFloat",
				  "z_tpo_timecard/control/tempoDayToggle",
				  "z_tpo_timecard/model/model-tempo", 
				  "z_tpo_timecard/model/model-timecard", 
				  "z_tpo_timecard/model/model-config", 
				  "z_tpo_timecard/model/model-context", 
				  'z_tpo_timecard/model/formatters',
				  "z_tpo_timecard/tempo.utils",
				 // "sap/ui/core/TooltipBase",
				  // changed on 3/27
				  ],
				function(Controller, Filter, mApp, tempoInputFloat, tempoToggle, mTempo, mTimecard, mConfig, mContext, formatters, tempoUtils) {
					"use strict";
					return Controller
							.extend(
									"z_tpo_timecard.controller.timesheet",
									{
										gridHeader : null,
										grid: null,
										tempoMsg: null,
										_dialog:null,
										_notesModel: null,
										onInit : function() {
											
											this.initTimegrid();
											
											sap.ui.getCore().getEventBus().subscribe("framework", "renderTimesheet", this.evOnRenderGrid, this);
											sap.ui.getCore().getEventBus().subscribe("framework", "refreshChild", this.evOnRenderGrid, this);											
											sap.ui.getCore().getEventBus().subscribe("tempoNav", "gridRefreshed", this.evOnRefreshGrid, this);
											
											
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
												setTimeout(function(handler) {
													handler.doAfterRendering();
												}, 0, this);

												
										 },
										/**
										 * Called when the Controller is
										 * destroyed. Use this one to free
										 * resources and finalize activities.
										 * 
										 * @memberOf lm_app1.app
										 */
										onExit : function() {
											sap.ui.getCore().getEventBus().unsubscribe("framework", "renderTimesheet", this.evOnRenderGrid, this);
											sap.ui.getCore().getEventBus().unsubscribe("framework", "refreshChild", this.evOnRenderGrid, this);											
											sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "gridRefreshed", this.evOnRefreshGrid, this);
											this.exitFramework();
										},
										
										doAfterRendering : function() {
											$('#tBodyD').css("overflow-y","scroll");
											var self = this;
											$(".sapUiVltCell:has('.tempoNavPrev')").css("text-align", "right");
											$(".sapUiVltCell:has('.tempoNavNext')").css("text-align", "left");	
										//	this.resizeGridHeight();
											this.resizeGridHeight();
											
											//var _tags =  $.grep($(":focusable"), function(a) {
											//	return a["tabIndex"] > 0
											//}).sort(function(a, b) {
											//    return parseInt(a.tabIndex) - parseInt(b.tabIndex);
											//});
												
											$('.sapMInputBaseInner, .tempoToggle, .sapUiIcon, .sapMBarChild, .sapMBtn').keydown(function(param){
									    		 var _ii = parseInt($(this).attr('tabindex'));
									    		 var _tags =  $.grep($(":focusable"), function(a) {
														return a["tabIndex"] > 0
													}).sort(function(a, b) {
													    return parseInt(a.tabIndex) - parseInt(b.tabIndex);
													});
									    		 var _ind = 0;
									    		 
									    		 if (_ii > 0) {
										    		 switch (param.key) {
										    		 	case 'ArrowDown': 
										    		 		_ind = _tags.length-1; 
										    		 		for(var i=0; i<_tags.length; i++) {
										    		 			if(parseInt(_tags[i].tabIndex)-100-_ii == 0) {
										    		 				_ind = i;
										    		 				//$('[tabindex='+(parseInt(_tags[i].tabIndex)).toFixed(0)+']').focus();
										    		 				break;
										    		 			} else if(parseInt(_tags[i].tabIndex)-100-_ii > 0) {
										    		 				_ind = i+1;
										    		 				//$('[tabindex='+(parseInt(_tags[i-1].tabIndex)).toFixed(0)+']').focus();
										    		 				break;
										    		 			} 
	 									    		 		}
										    		 		$('[tabindex='+(parseInt(_tags[_ind].tabIndex)).toFixed(0)+']').focus();
										    		 		//$('[tabindex='+(_ii+100).toFixed(0)+']').focus();		
										    		 		break;
										    		 	case 'ArrowUp' :
										    		 		if (_ii > 100){
										    		 			for(var i=0; i<_tags.length; i++) {
										    		 			if(parseInt(_tags[i].tabIndex)+100-_ii == 0) {
										    		 				_ind = i;
										    		 				//$('[tabindex='+(parseInt(_tags[i].tabIndex)).toFixed(0)+']').focus();
										    		 				break;
										    		 			} else if(parseInt(_tags[i].tabIndex)+100-_ii > 0) {
										    		 				_ind = i-1;
										    		 				//$('[tabindex='+(parseInt(_tags[i].tabIndex)).toFixed(0)+']').focus();
										    		 				break; 
										    		 			} 
										    		 			}
										    		 		}
										    		 		$('[tabindex='+(parseInt(_tags[_ind].tabIndex)).toFixed(0)+']').focus();
										    		 		//$('[tabindex='+(_ii-100).toFixed(0)+']').focus();		
										    		 		break;											    		 				
										    		 }									    			 
									    		 }
									    	 });
											
											window.onresize = function(e) {
												e.preventDefault();
												//e.stopPropagation();
												//$(this).off('resize');
												self.resizeGridHeight();
											}


										},

										evOnRenderGrid : function(channel, event, data) {
											this.renderTimeGrid();		
										},

										evOnRefreshGrid : function(channel, event, data) {
											setTimeout(function(handler) {
												handler.doAfterRendering();
													sap.ui.getCore().byId('tBodyD').scrollTo(0,$('#'+handler.grid.getId()).height(),500);
													var _row = data.row || 0;
												//	document.getElementById("ccode-" + handler.grid.getId() + "-" + parseInt(_row)+'-inner').focus();
											}, 0, this);
										},

										renderTimeGrid : function() {

											(mTimecard.get().oData.ShowTimeclock) ? sap.ui.getCore().byId('tBodyD').addStyleClass("tempoCTI") : false;
											(mTimecard.get().oData.PZL) ? sap.ui.getCore().byId('tBodyD').addStyleClass("tempoPZL") : false;
											
											this.addGridHeaders();
											this.addGridContent();
											this.addTempoMessages();
											mApp.setSaveVisible(true);
											mApp.get().refresh(true);

										},
										
										resizeGridHeight : function() {
											$("#tBodyD").height($("#tcCont").height()
													- $("#tHeaderD").height() - $("#tHeader--header").height());
											$("#tBodyD-scroll").width($("#tBodyD").width());
										},
										addGridHeaders : function() {
											var self = this;
										    var _oData = mTimecard.get().oData;
										//	var days = _oData.DaysVisible;

											if (!(self.gridHeader instanceof sap.m.Table)) {
											    self.gridHeader = new sap.m.Table(
												    {
													inset : false,
													mode : sap.m.ListMode.None,
													includeItemInSelection : false,
												    });
											} 

											this.gridHeader.getColumns()
											.forEach(function(column) {
												column.destroy()
											});

											self.gridHeader.removeAllColumns();

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    visible: {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														width : "8px"
													   
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    visible : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														width : "8px",
													    
													}));

											self.gridHeader.addColumn(new sap.m.Column(
												{
												    visible : "{timecard>/Editable}",
													width : "8px",
												   // minScreenWidth : '1000px',
												   // demandPopin : true,
												}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    width : "8rem",
													  //  minScreenWidth : '1000px',
													   // popinDisplay : "Inline",
													   // demandPopin : true,
													    styleClass:"vAlignBottom",
													 //   hAlign: "Right",
													    header :  new sap.m.Label({
													                	text : "{i18n>hdrChargeCode}"
													    		  }),
													})
												);

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    visible : "{timecard>/CNotesAllowed}",
														width : "16px",
													   // minScreenWidth : '1000px',
													   // demandPopin : true,
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    //width : "30px",
													    width : "3rem",
													  //  minScreenWidth : '1000px',
													    minScreenWidth : '900px',
													    demandPopin : true,
													  //  popinDisplay : "Inline",
													    styleClass:"vAlignBottom",
													  //  demandPopin : true,
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrExtension}"
														    })
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    width: "1.5rem",
													    hAlign: "Left",
													    styleClass:"vAlignBottom",
													    minScreenWidth : '900px',
													    demandPopin : true,
													  //  popinDisplay : "Inline",
														visible: "{timecard>/CFWDAllowed}", 												    
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrCFWD}"
														    })
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													   // width : "50px",
													    width: "5rem",
													 //   minScreenWidth : '1000px',
													    minScreenWidth : '900px',
													    demandPopin : true,
													 //   popinDisplay : "Inline",
//													    visible: false,
														visible: "{timecard>/WPMAllowed}",
														styleClass:"vAlignBottom",
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrWPM}"
														    })
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													   // width : "50px",
													    width: "3rem",
													 //   minScreenWidth : '1000px',
													    minScreenWidth : '900px',
													    demandPopin : true,
													 //   popinDisplay : "Inline",
														visible: "{timecard>/SCACodeAllowed}",
														styleClass:"vAlignBottom",
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrSCA}"
														    })
													}));


											self.gridHeader.addColumn(new sap.m.Column(
													{
													//    width : "50px",
													    width : "4rem",
//													    minScreenWidth : '1000px',
													    minScreenWidth : '900px',
													    demandPopin : true,
													//    popinDisplay : "Inline",
													    styleClass:"vAlignBottom",
														visible: "{timecard>/WDCodeAllowed}",
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrWDC}"
														    })
													}));


											self.gridHeader.addColumn(new sap.m.Column(
												{
												    //width : "40px",
												    width: "5rem",
//												    minScreenWidth : '1000px',
												    minScreenWidth : '900px',
												    demandPopin : true,
												 //   popinDisplay : "Inline",
													visible: "{timecard>/PremiumsAllowed}",
													styleClass:"vAlignBottom",
												    header : new sap.m.Label(
													    {
														text : "{i18n>hdrPremium}"
													    })
												}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    width: "1.5rem",
													    hAlign: "Left",
													    styleClass:"vAlignBottom",
													    minScreenWidth : '900px',
													    demandPopin : true,
													//    popinDisplay : "Inline",
														visible: "{timecard>/ShiftAllowed}", 												    
													    header : new sap.m.Label(
														    {
															text : "{i18n>hdrShift}"
														    })
													}));

											self.gridHeader.addColumn(new sap.m.Column(
													{
													    width: "1rem",
													    hAlign: "Left",
													    styleClass:"vAlignBottom",
													    minScreenWidth : '900px',
													    demandPopin : true,
													//    popinDisplay : "Inline",
														visible: "{timecard>/TravelAllowed}", 												    
													    header : new sap.m.Label(
														    {
															text : "{i18n>i18n>hdrTVL}"
														    })
													}));

											self.gridHeader.addColumn(new sap.m.Column(
												{
												    //width: "1.5rem",
												    width: "1.5rem",
												    hAlign: "Left",
												    styleClass:"vAlignBottom",
												    header : 
												    	new sap.ui.layout.VerticalLayout({
												    		//textAlign : "Right",
												    		width: "100%",
												    		content : [
														          new sap.ui.layout.HorizontalLayout({
														        	  //width: "100%",
														        	  content : [
														        	             new sap.ui.core.Icon({
														        	            	 src : "sap-icon://navigation-left-arrow",
														        	            	 tooltip : "{i18n>ttPrevPer}",
														        	            	 visible:  "{= ${timecard>/ApprovalMode} === false }",
														        	            	 press : function(oEvent) {
														        	            		 sap.ui.getCore().getEventBus().publish("tempoNav", "previousPeriod");
														        	            	 }
														        	             })
																				.addEventDelegate({
																				     "onAfterRendering": function (oEvent) {
																				    	 var _id = $('#'+oEvent.srcControl.sId).closest("th").attr('id');
																				    	 //var _ind = 4*100+20+parseInt(_id.substring(_id.lastIndexOf("-")+8));
																				    	 var _ind = 4*100+40;
																				    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
																				    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
																				     }
																				})
														        	             .addStyleClass("tempoNavPrev")
														        	             ]
														          }),
														           new sap.m.Label(),
														           new sap.m.Label(
														        		   {
														        			   text : 	"{i18n>hdrPMOT}",
														        			   visible: "{= ${timecard>/PMOTAllowed} === true }",	   
														        		   }),
												        		   new sap.m.Label(
														        		   {
														        			   text : 	" ",
														        			   visible: "{= ${timecard>/PMOTAllowed} === false }",	   
														        		   })
											        		   ]
												    	})
												}));


											for (var iDay = 0; iDay < _oData.Workdays.length; iDay++) {
											    self.gridHeader.addColumn(new sap.m.Column(
													    {
													   // width:"20px",
													    width: "1.5rem",
														header : 
															new sap.ui.layout.VerticalLayout({
																content : [
																		new sap.m.Label({
																			text : {
																				path : "timecard>/Workdays/"
																						+ iDay
																						+ "/Workdate",
																				formatter : function(d) {
																					return (d instanceof Date) ? 
																							d.getDayName(3)
																							//d.toLocaleDateString('us-US', { weekday: 'short'})
																							: "?";
																				}
																			},
																			textAlign : "Center"
																		}),
																		new sap.m.Label({
																			text : {
																				path : "timecard>/Workdays/"
																						+ iDay
																						+ "/Workdate",
																				formatter : function(d) {
																					return (d instanceof Date) ? d
																							.getDate()
																							: "?";
																				}
																			},
																			textAlign : "Center"
																		}),
																		new tempoToggle({
																			width : "100%",
																			tooltip: {
																				path : "timecard>/Workdays/"
																					+ iDay
																					+ "/Workdate",
																					formatter : function(d) {
																						return (d instanceof Date) ? 
																						d.getDayName(3)
																						//d.toLocaleDateString('us-US', { weekday: 'short'})
																						: "?";
																					}
																			},
																			visible : "{timecard>/ShowToggle}",
																			enabled : {
																				path: "timecard>/",
																				formatter: formatters.enableDayToggle
																			},
																			status : "{timecard>/Workdays/"
																					+ iDay
																					+ "/ToggleStatus}",
																			path : "{timecard>/Workdays/"
																					+ iDay
																					+ "/ToggleStatusSequence}",
																			seq: iDay		
																		})
																		.addEventDelegate({
																		     "onAfterRendering": function (oEvent) {
																		    	 var _e = oEvent.srcControl;
																		    	 //var _id = $($('#'+_e.getParent().sId).html())[0].id;
																		    	 var _id = $('#'+oEvent.srcControl.sId).closest("th").attr('id');
																		    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+8);
																		    	 //var _ind = 4*100+20+parseInt(_cellInd);
																		    	 var _ind = 4*100+41+_e.getProperty("seq");
																		    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
																		    	// $('#'+oEvent.srcControl.sId).attr("aria-label", "Delete Line");
																		     }
																		})
																		.addStyleClass('tempoToggle') ]
															}),

															hAlign : "Center",
//														styleClass : "tempoAlRight vAlignBottom",
														styleClass : "tempoAlRight",
														
															
															
															
													    })
											    		//.addStyleClass("vAlignBottom")
											    );
											}

											self.gridHeader.addColumn(new sap.m.Column(
													{
													  //  width : "45px",
													    width : "2rem",
													    styleClass : "vAlignBottom",
													    header: new sap.ui.layout.VerticalLayout({
													    //	textAlign : "Left",
													    	width: "100%",
												    		content : [
														          new sap.ui.core.Icon({
																		src : "sap-icon://navigation-right-arrow",
																		tooltip : "{i18n>ttNextPer}",
																		visible :  "{= ${timecard>/ApprovalMode} === false }",
																		press : function(oEvent) {
																			sap.ui.getCore().getEventBus().publish("tempoNav", "nextPeriod");
																		}
																	})
																	.addEventDelegate({
																	     "onAfterRendering": function (oEvent) {
																	    	 var _id = $('#'+oEvent.srcControl.sId).closest("th").attr('id');
																	    	 //var _ind = 4*100+20+parseInt(_id.substring(_id.lastIndexOf("-")+8));
																	    	 var _ind = 4*100+41+_oData.Workdays.length+1;
																	    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
																	    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
																	     }
																	})
														          .addStyleClass("tempoNavNext"),
															           new sap.m.Label(),
															           new sap.m.Label(),

														        		   ]
												    	}),
												    	
													    	

													}));
											
											
										},
										
										addGridContent : function() {
											var self = this;
										    var _oData = mTimecard.get().oData;
									//		var days = _oData.DaysVisible;

											if (!(self.grid instanceof sap.m.Table)) {
											    self.grid = new sap.m.Table(
												    {
													inset : false,
													mode : sap.m.ListMode.None,
													includeItemInSelection : false,
												    });
											} 
											this.clearGrid();

											self.grid.addStyleClass("tempoTimeGrid");
											self.grid
												.addColumn(new sap.m.Column(
													{
													    visible: {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														width : "8px",
														hAlign: sap.ui.core.TextAlign.Center,
													    footer: 
													    	new sap.ui.core.Icon({
													    		src : "sap-icon://sys-add",
																visible : {
																	path: "timecard>/",
																	formatter: formatters.timeEntryAllowed
																},
													    		//enabled: "{timecard>/Editable}",
													    		tooltip: "{i18n>ttAddLine}",
													    		//press: self.timesheetAddLine,
													    	})
														.addEventDelegate({
																onclick : function(oEvent) {
																	this.addLineBlank(oEvent);
																	
																},
																 "onAfterRendering": function (oEvent) {
															    	 $('#'+oEvent.srcControl.sId).attr("tabindex", "99991");
															    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
															    	 $('#'+oEvent.srcControl.sId).attr("role", "button");
														     }
															}, self)
															.addStyleClass("greenIconAnimate")
													}));

											self.grid
												.addColumn(new sap.m.Column(
													{
													    visible : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														width : "8px",
													    footer : 
													    	new sap.ui.core.Icon({
													    		src : "sap-icon://add-favorite",
													    		visible: {
																	path: "timecard>/",
																	formatter: formatters.timeEntryAllowed
																},
													    		//enabled: "{timecard>/Editable}",
													    		tooltip: "{i18n>ttInsertFav}",
													    	}).addEventDelegate({
																onclick : function(oEvent) {
																	this.addLineDialog(oEvent);
																},
																 "onAfterRendering": function (oEvent) {
															    	 $('#'+oEvent.srcControl.sId).attr("tabindex", "99992");
															    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
															    	 $('#'+oEvent.srcControl.sId).attr("role", "button");
															     }
															}, self)
															.addStyleClass("greenIconAnimate")

													}));

											self.grid
											.addColumn(new sap.m.Column(
												{
												    visible : "{timecard>/Editable}",
													width : "8px",
												}));

											self.grid
												.addColumn(new sap.m.Column(
													{
													    width : "8rem",
													    styleClass:"vAlignBottom",
													})
												);

											self.grid
											.addColumn(new sap.m.Column(
												{
												    width : "16px",
												    visible:"{timecard>/CNotesAllowed}"
												})
											);
											
											
											self.grid
												.addColumn(new sap.m.Column(
													{
													    width : "3rem",
													    minScreenWidth : '900px',
													    demandPopin : true,
													 //   popinDisplay : "Inline",
													    styleClass:"vAlignBottom",
													}));

											self.grid
											.addColumn(new sap.m.Column(
												{
												    width : "1rem", 
												    minScreenWidth : '900px',
												    demandPopin : true,
												//    popinDisplay : "Inline",
												    visible: "{timecard>/CFWDAllowed}",
												    styleClass:"vAlignBottom"
												}));

											self.grid
											.addColumn(new sap.m.Column(
												{
												    width : "5rem",
												    minScreenWidth : '900px',
												    demandPopin : true,
												//    popinDisplay : "Inline",
													visible: "{timecard>/WPMAllowed}",
												    styleClass:"vAlignBottom",
												})
											);

											self.grid
												.addColumn(new sap.m.Column(
													{
													    width: "3rem",
													    minScreenWidth : '900px',
													    demandPopin : true,
													//    popinDisplay : "Inline",
														visible: "{timecard>/SCACodeAllowed}",
														styleClass:"vAlignBottom",
													}));

											self.grid
												.addColumn(new sap.m.Column(
													{
													//    width : "50px",
													    width : "4rem",
//													    minScreenWidth : '1000px',
													    minScreenWidth : '900px',
													    demandPopin : true,
													//    popinDisplay : "Inline",
													    styleClass:"vAlignBottom",
														visible: "{timecard>/WDCodeAllowed}",
													}));


											self.grid
											.addColumn(new sap.m.Column(
												{
												    //width : "40px",
												    width: "5rem",
//												    minScreenWidth : '1000px',
												    minScreenWidth : '900px',
												    demandPopin : true,
											//	    popinDisplay : "Inline",
													visible: "{timecard>/PremiumsAllowed}",
													styleClass:"vAlignBottom",
												}));

											self.grid       //Shift
											.addColumn(new sap.m.Column(
												{
												   // width : "15px",
												    width: "1.5rem",
												    minScreenWidth : '900px',
												    demandPopin : true,
											//	    popinDisplay : "Inline",
												    hAlign: "Left",
													visible: "{timecard>/ShiftAllowed}", 												    
												    styleClass:"vAlignBottom",
												}));

											self.grid        //Travel 
											.addColumn(new sap.m.Column(
												{
												   // width : "15px",
												    width: "1rem",
												    minScreenWidth : '900px',
												    demandPopin : true,
												//    popinDisplay : "Inline",
												    hAlign: "Left",
													visible: "{timecard>/TravelAllowed}", 												    												    
												    styleClass:"vAlignBottom",
												}));

											self.grid        //PM OT - Always visible because it also contains left nav arrow
											.addColumn(new sap.m.Column(
												{
												   // width : "15px",
												    width: "1.5rem",
												    hAlign: "Left",
												    styleClass:"vAlignBottom",
												}));


											for (var iDay = 0; iDay < _oData.Workdays.length; iDay++) {
											    self.grid
												    .addColumn(new sap.m.Column( 'cDay'+iDay,
													    {
													    width: "1.5rem",

															hAlign : "Center",
//														styleClass : "tempoAlRight vAlignBottom", 
														styleClass : "tempoAlRight", 
														footer : new sap.ui.layout.VerticalLayout(
																{
																	
																    content : [
																	    new sap.m.Input(
																				{
																				    value : "{timecard>/Workdays/"
																					    + iDay
																					    + "/Total}",																					    
																					width:"48px",
																					//class : "sapUiSmallMarginBottom",
																				    //design : sap.m.LabelDesign.Bold,
																				    textAlign : sap.ui.core.TextAlign.Right,
																				    enabled : false,
																				    editable : false
																				}).addStyleClass("tempoAlRight") ]
																})
															
															
															
													    })
										    		//.addStyleClass("vAlignBottom")
												    );
											}

											self.grid
												.addColumn(new sap.m.Column(
													{
													  //  width : "45px",
													    width : "2rem",
													  //  styleClass : "vAlignBottom, tempoRightTotal",
													    styleClass : "tempoRightTotal",
												    	footer : new sap.ui.layout.VerticalLayout(
																{
																    content : [
																	    new sap.m.Input(
																				{
																				    value : "{timecard>/Total}",
																				    //class : "sapUiSmallMarginBottom",																	
																				    //design : sap.m.LabelDesign.Bold,
																				    width: "100%",
																				    textAlign : sap.ui.core.TextAlign.Left,
																				    enabled : false,
																				    editable : false
																				}).addStyleClass("tempoAlRight")
																				.addStyleClass("tempoBottomRightTotal")
																				]
																})
													    	

													})
									    		//.addStyleClass("vAlignBottom")
												);
											var oMetaModel = mTempo.get().getMetaModel();
											
											oMetaModel.loaded().then($.proxy(function () { 
												var oType = oMetaModel.getODataEntityType("Z_TEMPO_TIMEREC_SRV.TimeRecord");
												var _properties = $.grep(oType.property,
												    function(a) {
													for (var j in oType.key.propertyRef) {
														if(oType.key.propertyRef[j].name === a.name) return false;
													}
													return true;
												    });
											var _timeout = null;
											var _timerows = new sap.m.ColumnListItem({
												type : {
													path: "timecard>/",
													formatter: function(d) {
														return(formatters.timeEntryAllowed(d)) ? "Active" : "Inactive";
													}
												},
												vAlign:"Middle",
//												press: function(oEvent) {
//													if(oEvent.oSource.getBindingContext("timecard").getModel().getData().Editable && 
//															!oEvent.oSource.getBindingContext("timecard").getModel().getData().ApprovalMode) {
//														sap.ui.getCore().getEventBus().publish("tempoGrid", "changeLine", oEvent.oSource)
//													}
//												}
											});
//											.addEventDelegate({
//												onmouseover : function(oEvent) {
//													_timeout=setTimeout(function(handler) {
//													//	if(typeof handler._eventHandledByControl==="boolean" && handler._eventHandledByControl===false) {
//															if(handler.getBindingContext("timecard").getModel().getData().Editable && 
//																	!handler.getBindingContext("timecard").getModel().getData().ApprovalMode) {
//																sap.ui.getCore().getEventBus().publish("tempoGrid", "changeLine", handler)
//															}														
//													//	}
//													}, 1000, oEvent.srcControl);
//													
//												},
//											})
//											.addEventDelegate({
//												onmouseout : function(oEvent) {
//													clearTimeout(_timeout);													
//												},
//											});	


											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://sys-minus",
												tooltip: "{i18n>ttDelLine}",
												visible: {
													path: "timecard>/",
													formatter: formatters.timeEntryAllowed
												},
												//enabled: {
												//	path: "timecard>/",
												//	formatter: formatters.timeEntryAllowed
												//},
												press: function(oEvent) {
													if(oEvent.oSource.getBindingContext("timecard").getModel().getData().Editable) {
														sap.ui.getCore().getEventBus().publish("tempoGrid", "deleteLine", oEvent.oSource)
													}
												}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
											    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
											    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
											    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
											    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
											    	// $('#'+oEvent.srcControl.sId).attr("aria-label", "Delete Line");
											    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
											     }
											})
											.addStyleClass("redIcon"));


											_timerows.addCell(new sap.ui.core.Icon({
												src : 
												{
													path : "timecard>",
													formatter : function(d) {
														var _icon = "sap-icon://unfavorite";
														if (mContext.checkFavorite(d) >= 0 ) {
															_icon = "sap-icon://favorite";							
														};
														return _icon;
													}
												},
												tooltip: 
												{
													path : "timecard>",
													formatter : function(d) {
														if (mContext.checkFavorite(d) >= 0 ) {
															return sap.ui.getCore().getModel('i18n').getResourceBundle().getText("ttRemFav");							
														} else {
															return sap.ui.getCore().getModel('i18n').getResourceBundle().getText("ttAddFav");
														};
													}
												},
												visible: {
													path: "timecard>/",
													formatter: formatters.timeEntryAllowed
												},	
												press: function(oEvent) {
													var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
													sap.ui.getCore().getEventBus().publish("tempoGrid", "triggerFavorite", oEvent.oSource);
												}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
											    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
											    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
											    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
											    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
											    	// $('#'+oEvent.srcControl.sId).attr("aria-label", "Switch Favorites");
											    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
											     }
											})

											);

											_timerows.addCell( new sap.ui.layout.HorizontalLayout(
											{ content: 
												[ new sap.ui.core.Icon({
													src : "sap-icon://alert",
													tooltip: "{i18n>ttOvrCO}",
													visible: 
													{
														path : "timecard>",
														formatter : function(d) { 
															return (d.ChargeCodeInvalid && !d.ChargeCodeOverride && !mTimecard.get().oData.PZL) 
															}
													},
													press: function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														if (formatters.timeEntryAllowed(mTimecard.get().oData)) {
															tempoUtils.tempoHandleOverride(_item);	
														}
															
													}
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
												    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
												     }
												})
												.addStyleClass("redIcon"),
												
												new sap.ui.core.Icon({
													src : "sap-icon://alert",
													visible: 
													{
														path : "timecard>",
														formatter : function(d) { 
															return (d.ChargeCodeInvalid && !d.ChargeCodeOverride && mTimecard.get().oData.PZL) 
															}
													}
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
												    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
												     }
												})
												.addStyleClass("redIcon"),
												
												new sap.ui.core.Icon({
													src : "sap-icon://message-warning",
													tooltip: "{i18n>ttRemoveOvr}",
													visible: 
													{
														path : "timecard>",
														formatter : function(d) { 
															return (d.ChargeCodeInvalid && d.ChargeCodeOverride && !mTimecard.get().oData.PZL) 
														}
													},
													press: function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														if (formatters.timeEntryAllowed(mTimecard.get().oData)) {
															tempoUtils.tempoHandleOverride(_item);	
														}
													}
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
												    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
												     }
												})
												.addStyleClass("greenIcon"),
												
												new sap.ui.core.Icon({
													src : "sap-icon://message-warning",
													visible: 
													{
														path : "timecard>",
														formatter : function(d) { 
															return (d.ChargeCodeInvalid && d.ChargeCodeOverride && mTimecard.get().oData.PZL) 
														}
													}
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
												    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
												     }
												})
												.addStyleClass("greenIcon")
												
												]												
											}		
											)
											);

											var _props = $.grep(_properties, function(a) { return a.name === "ChargeCode" });
											var _maxS = (_props[0]) ? _props[0]["maxLength"] : null; 
											
											_timerows.addCell(new sap.m.Input({
												type : "Text",
												//class : "sapUiSmallMarginBottom",
												value : "{timecard>ChargeCode}",
												enabled : {
													path: "timecard>/",
													formatter: formatters.timeEntryAllowed
												},
												editable : {
													path: "timecard>/",
													formatter: formatters.timeEntryAllowed
												},
												maxLength : (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('ChargeCode', 'maxLength'),
												width: "85%",
												tooltip : "{timecard>ChargeCodeType}",
												valueState: "{timecard>valueStates/ChargeCode/state}",
												valueStateText: "{timecard>valueStates/ChargeCode/text}",																									
//												suggest: function(oEvent) {
//													var sTerm = oEvent.getParameter("suggestValue");
//													var EmpID = mTempo.getEID();
//													var keyDate = mTempo.getStartDate();
//						
//													var aFilters = [];
//													if (sTerm) {
//														aFilters.push(new Filter({
//															path: "ChargeCode", 
//															operator: sap.ui.model.FilterOperator.StartsWith, 
//															value1 : sTerm}
//															));
//														aFilters.push(new Filter("UserID", sap.ui.model.FilterOperator.EQ, EmpID));
//														aFilters.push(new Filter("KeyDate", sap.ui.model.FilterOperator.EQ, keyDate));
//														aFilters.push(new Filter("Title", sap.ui.model.FilterOperator.StartsWith, sTerm));
//														//oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
//													}
//
//												},
												//startSuggestion : 2,
												showValueHelp: true,
												//filterSuggest: true,
												//showSuggestion: true,
												//suggestionItems : {
												//	   path: "tempo>/Favorites",
												//	   template: new sap.ui.core.Item({text: "{tempo>ChargeCode}", key: "{tempo>Title}"}),
												//	   templateShareable : true
												//	},
												valueHelpRequest : function(oEvent) {
													sap.ui.getCore().getEventBus().publish("tempoGrid", "changeLine", oEvent.oSource)
												},
												change : function(oEvent) {
													sap.ui.getCore().byId("time_weekview").setBusy(true);
													var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
													$.when(tempoUtils.tempoValidateRecord(_item))
													.then(function(response) {
														sap.ui.getCore().byId("time_weekview").setBusy(false)
													});
													
												}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
											    	 var _e = oEvent.srcControl;
											    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
											    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
											    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
											    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
											     }
											})
											.addStyleClass("tempoGridInput")
//											.addEventDelegate({
//												onmouseover : function(oEvent) {
//													_timeout=setTimeout(function(handler) {
//													//	if(typeof handler._eventHandledByControl==="boolean" && handler._eventHandledByControl===false) {
//															if(handler.getBindingContext("timecard").getModel().getData().Editable && 
//																	!handler.getBindingContext("timecard").getModel().getData().ApprovalMode) {
//																sap.ui.getCore().getEventBus().publish("tempoGrid", "changeLine", handler)
//															}														
//													//	}
//													}, 1000, oEvent.srcControl);
//													
//												},
//											})
//											.addEventDelegate({
//												onmouseout : function(oEvent) {
//													clearTimeout(_timeout);													
//												},
//											})
//											.addEventDelegate({
//												onclick : function(oEvent) {
//													clearTimeout(_timeout);													
//												},
//											})	

											);
											
											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://notes",
												tooltip: "{i18b>hdrNotes}",
												visible: "{timecard>fChargeNotes}",
												//visible: {
												//	path: "timecard>/",
												//	formatter: formatters.lineCommentsAllowed
												//},
												color: {
													path: "timecard>ChargeNotes",
													formatter: function(d) { 
														return (d) ? ((d.length > 0) ? "blue" : "grey" ) : "grey"; 
													}
												}, 
												//enabled: {
												//	path: "timecard>/",
												//	formatter: formatters.timeEntryAllowed
												//},
												press: function(oEvent) {
													self.enterNotesDlg(oEvent);
												}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
											    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
											    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
											    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
											    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
											    	// $('#'+oEvent.srcControl.sId).attr("aria-label", "Delete Line");
											    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
											     }
											}));
											
											
											/*
											_timerows.addCell(new sap.ui.core.Icon({
												src : "sap-icon://sys-minus",
												visible : {
													path: "timecard>/",
													formatter: formatters.lineCommentsAllowed
												},
												press: function(oEvent) {
													sap.m.MessageBox.show(
															"Detail Information about the charge code", {
																icon: sap.m.MessageBox.Icon.INFORMATION,
																title: "<<Charge Code>>",
																//actions: [MessageBox.Action.YES, MessageBox.Action.NO],
																//emphasizedAction: MessageBox.Action.YES,
																//onClose: function (oAction) { / * do something * / }
															}
														);
												}
												
												//visible: 
												//{
												//	path : "timecard>",
												//	formatter : function(d) { 
												//		return (d.ChargeCodeInvalid && d.ChargeCodeOverride && mTimecard.get().oData.PZL) 
												//	}
												//}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
											    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
											    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
											    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
											    	 $('#'+oEvent.srcControl.sId).attr("tabindex", _ind);
											    	 $('#'+oEvent.srcControl.sId).attr("aria-hidden", false);
											     }
											})
											.addStyleClass("blueIcon"));
*/
											
											var _props = $.grep(_properties, function(a) { return a.name === "Extension" });
											var _maxS = (_props[0]) ? _props[0]["maxLength"] : null; 

												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													value : "{timecard>Extension}",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													width: "60px",
													//width: "4em",
													maxLength : (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('Extension', 'maxLength'),
													valueState: "{timecard>valueStates/Extension/state}",
													valueStateText: "{timecard>valueStates/Extension/text}",													
													showValueStateMessage: true,
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}								
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput"));

												var _props = $.grep(_properties, function(a) { return a.name === "CFWD" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(
													new sap.m.CheckBox({
														enabled : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														editable : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},													
														selected : "{timecard>CFWD}",
														visible: "{timecard>/CFWDAllowed}", 
													//	width: '32px'
													})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput"));

												
												var _props = $.grep(_properties, function(a) { return a.name === "WPM" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},													
													value : "{timecard>WPM}",
													maxLength : (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('WPM', 'maxLength'),
													//width: "6em",
												//	visible: "{timecard>/WPMAllowed}",
													visible: "{timecard>WPMAllowed}",
											//		placeholder: "{i18n>phSCA}",
													valueState: "{timecard>valueStates/WPM/state}",
													valueStateText: "{timecard>valueStates/WPM/text}",													
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}								
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput")


												);
												
												
												var _props = $.grep(_properties, function(a) { return a.name === "ScaCode" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},													
													value : "{timecard>ScaCode}",
													maxLength : (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('ScaCode', 'maxLength'),
													//width: "6em",
													visible: "{timecard>SCACodeAllowed}",
											//		placeholder: "{i18n>phSCA}",
													valueState: "{timecard>valueStates/ScaCode/state}",
													valueStateText: "{timecard>valueStates/ScaCode/text}",													
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}								
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput")


												);
												
												var _props = $.grep(_properties, function(a) { return a.name === "WDCode" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null; 
												
												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},													
													value : "{timecard>WDCode}",
													maxLength : (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('WDCode', 'maxLength'),
													//width: "10em",
													visible: "{timecard>WDCodeAllowed}",
													valueState: "{timecard>valueStates/WDCode/state}",
													valueStateText: "{timecard>valueStates/WDCode/text}",													
											//		placeholder: "{i18n>phWDC}",
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}								
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput")


												);

												var _props = $.grep(_properties, function(a) { return a.name === "PremiumCode" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													value : "{timecard>PremiumCode}",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},													
													width: "60px",
													//width: "4em",
													maxLength:(_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('PremiumCode', 'maxLength'),
											//		placeholder: "{i18n>phPremiumCode}",
													valueState: "{timecard>valueStates/PremiumCode/state}",
													valueStateText: "{timecard>valueStates/PremiumCode/text}",
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput")


												);
												

												var _props = $.grep(_properties, function(a) { return a.name === "Shift" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													enabled : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},
													editable : {
														path: "timecard>/",
														formatter: formatters.timeEntryAllowed
													},													
													value : "{timecard>Shift}",
													visible: "{timecard>/ShiftAllowed}", 
													width: "27px",
													//width: "2em",
													maxLength: (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('Shift', 'maxLength'),
											//		placeholder: "{i18n>phShift}",
													valueState: "{timecard>valueStates/Shift/state}",
													valueStateText: "{timecard>valueStates/Shift/text}",													
													change : function(oEvent) {
														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
														tempoUtils.tempoValidateRecord(_item);
													}								
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput"));

												var _props = $.grep(_properties, function(a) { return a.name === "Travel" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(
													new sap.m.CheckBox({
														enabled : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														editable : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},													
														selected : "{timecard>Travel}",
														visible: "{timecard>/TravelAllowed}", 
													//	width: '32px'
													})
//														new sap.m.Input({
//													type : "Text",
//													class : "sapUiSmallMarginBottom",
//													enabled : {
//														path: "timecard>/",
//														formatter: formatters.timeEntryAllowed
//													},
//													editable : {
//														path: "timecard>/",
//														formatter: formatters.timeEntryAllowed
//													},													
//													value : "{timecard>Shift}",
//													width: "27px",
//													//width: "2em",
//													maxLength: (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('Shift', 'maxLength'),
//											//		placeholder: "{i18n>phShift}",
//													valueState: "{timecard>valueStates/Shift/state}",
//													valueStateText: "{timecard>valueStates/Shift/text}",													
//													change : function(oEvent) {
//														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
//														tempoUtils.tempoValidateRecord(_item);
//													}								
//												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput"));

												var _props = $.grep(_properties, function(a) { return a.name === "PMOT" });
												var _maxS = (_props[0]) ? _props[0]["maxLength"] : null;
												
												_timerows.addCell(
													new sap.m.CheckBox({
														enabled : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														editable : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},													
														selected : "{timecard>PMOT}",
														visible: "{timecard>/PMOTAllowed}", 
													//	width: '32px'
													})
//														new sap.m.Input({
//													type : "Text",
//													class : "sapUiSmallMarginBottom",
//													enabled : {
//														path: "timecard>/",
//														formatter: formatters.timeEntryAllowed
//													},
//													editable : {
//														path: "timecard>/",
//														formatter: formatters.timeEntryAllowed
//													},													
//													value : "{timecard>Shift}",
//													width: "27px",
//													//width: "2em",
//													maxLength: (_maxS) ? parseInt(_maxS, 10) : mConfig.getDefault('Shift', 'maxLength'),
//											//		placeholder: "{i18n>phShift}",
//													valueState: "{timecard>valueStates/Shift/state}",
//													valueStateText: "{timecard>valueStates/Shift/text}",													
//													change : function(oEvent) {
//														var _item = oEvent.oSource.getBindingContext("timecard").getProperty("");
//														tempoUtils.tempoValidateRecord(_item);
//													}								
//												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
												    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
												    	 var _ind = (parseInt(oEvent.srcControl.sId.substring(oEvent.srcControl.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
												     }
												})
												.addStyleClass("tempoGridInput"));
												
												
												for (var jj = 0; jj <_oData.Workdays.length; jj++) {
													var _val = "{timecard>DailyTimes/"+jj+"/Actual}";
													var _tpl = "timecard>DailyTimes/"+jj+"/Actual";
													var _plh = "{timecard>DailyTimes/"+jj+"/Placeholder}";
													_timerows.addCell(new tempoInputFloat({
														enabled : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},
														editable : {
															path: "timecard>/",
															formatter: formatters.timeEntryAllowed
														},														
														//type : "Number",
													//	maxLength : 4,
														seq: jj,
														width:"48px",
														maxFractionSize: "{timecard>Precision}",
														maxFloorSize: "{timecard>Floor}",
														maxValue: "{timecard>Maxval}",
														minValue: "{timecard>Minval}",
														//class : "sapUiSmallMarginBottom",
														value : {
														        path: "timecard>DailyTimes/"+jj+"/Actual",
														      //  formatter : function(amount) {
												              //      return formatters.floatFormat(amount);
												              //  }
														        	
														},		
														valueState: "{timecard>DailyTimes/"+jj+"/valueStates/Actual/state}",
														valueStateText: "{timecard>DailyTimes/"+jj+"/valueStates/Actual/text}",																											
 														textAlign: sap.ui.core.TextAlign.Right,
													//	placeholder: _plh,
													//	validationError: function(oEvent) {
													//		this.setValueState("Error");
													//		this.setValueStateText("Value must be between 0 and 24");
													//		this.focus(this.getDomRef());
													//	},
														change : function(oEvent) {
															mTimecard.recalculateTotals();
														},
													//	focusOut : function(oEvent) {
													//		var _value = oEvent.oSource.getProperty("value");
													//		var _num = (_value == "") ? 0 : parseFloat(_value);
													//		if (_num > 24 || _num < 0) {
													//			this.fireValidationError();
													//		} else {
													//			this.setValueState("None");
													//		}																				
													//	}
													})
													.addEventDelegate({
													     "onAfterRendering": function (oEvent) {
													    	 var _e = oEvent.srcControl;
													    	 //var _id = $($('#'+_e.getParent().sId).html())[0].id;
													    	 var _id = $('#'+oEvent.srcControl.sId).closest("td").attr('id');
													   // 	 var _id = $($('#'+oEvent.srcControl.sId)[0].parentElement)[0].id
													    	 var _cellInd = _id.substring(_id.lastIndexOf("-")+7);
													    	 //var _ind = (parseInt(_e.sId.substring(_e.sId.lastIndexOf("-")+1))+5)*100+20+parseInt(_cellInd);
													    	 var _ind = (parseInt(_e.sId.substring(_e.sId.lastIndexOf("-")+1))+5)*100+41+_e.getProperty("seq");
													    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", _ind);
													     }
													})
													.addStyleClass("tempoGridInput")
												    .addStyleClass("tempoNumInput"));	
													
												}
												_timerows.addCell(new sap.m.Input({
													value : "{timecard>Total}",
													//class : "sapUiSmallMarginBottom",
													//design: sap.m.LabelDesign.Bold,
												    width: "100%",
												    textAlign : sap.ui.core.TextAlign.Left,
													enabled: false,
													editable: false
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", 0);
												     }
												})

												.addStyleClass("tempoAlRight"));
												
												
										
											var _incpay = new tempoInputFloat({
												enabled: "{timecard>/feIncPay}",
												editable: "{timecard>/feIncPay}",
												visible : "{timecard>/feIncPay}",														
												//type : "Number",
												//width:"45px",
												width: "3rem",
												maxFractionSize: 0,
												maxFloorSize: 1,
												maxValue: 4,
												minValue: 0,
												//class : "sapUiSmallMarginBottom",
												value : {
											        path: "timecard>/IncPay"
											     //   formatter : formatters.floatFormat
												}
											});							

											self.gridHeader.setInfoToolbar(new sap.m.OverflowToolbar({
												content : 
													[ 
											    new sap.m.CheckBox({
													text : "{i18n>lblCompTime}",
													enabled : "{timecard>/CompTimeEdit}",
													editable : "{timecard>/CompTimeEdit}",													
													selected : "{timecard>/CompTime}",
													visible: "{timecard>/CompTimeEdit}",
												})
												.addEventDelegate({
												     "onAfterRendering": function (oEvent) {
												    	 $('#'+oEvent.srcControl.sId).attr("tabindex", 301);
												     }
												})
												.addStyleClass("tempoChkActive"), 
											    new sap.m.CheckBox({
													text : "{i18n>lblCompTime}",
													enabled : "{timecard>/CompTimeEdit}",
													editable : "{timecard>/CompTimeEdit}",													
													selected : "{timecard>/CompTime}",
													visible: "{= ${timecard>/CompTimeAllowed} && !${timecard>/CompTimeEdit} }",
												}).addStyleClass("tempoChkReadonly"),

												new sap.m.Label({
													text : "{i18n>lblCompTime}",
													width : "5rem",
													visible: "{timecard>/CompTimeNumEdit}",
												}).addStyleClass("tempoLblActive"), 
												new sap.m.Label({
													text : "{i18n>lblCompTime}",
													width : "5rem",
													visible: "{= ${timecard>/CompTimeNumAllowed} && !${timecard>/CompTimeNumEdit} }",
												}).addStyleClass("tempoLblReadonly"), 
												
												new tempoInputFloat({
													enabled: "{timecard>/CompTimeNumEdit}",
													editable: "{timecard>/CompTimeNumEdit}",
													visible : "{timecard>/CompTimeNumEdit}",
													width: "3rem",
													maxFractionSize: "{timecard>/Precision}",
													maxFloorSize: "{timecard>/Floor}",
													change: function(oEvent){
														var _num = (oEvent.oSource.getValue() == "") ? 0 : parseFloat(oEvent.oSource.getValue().replace(/,(\d+)$/,'.$1'));
														oEvent.oSource.setValue(_num);
													},
													maxValue: 999,
													minValue: 0,
													value : "{timecard>/CompTimeNum}"		
												}),		
												new tempoInputFloat({
													enabled: false,
													editable: false,
													visible : "{= ${timecard>/CompTimeNumAllowed} && ${timecard>/CompTimeNumEdit} === false }",
													width: "3rem",
													maxFractionSize: "{timecard>/Precision}",
													maxFloorSize: "{timecard>/Floor}",
													maxValue: 999,
													minValue: 0,
													value : "{timecard>/CompTimeNum}"		
												}).addStyleClass("tempoInputReadonly"),		

												new sap.m.ToolbarSeparator({
													visible: "{= ${timecard>/CompTimeNumAllowed} || ${timecard>/CompTimeAllowed} }"
												}), 
												new sap.m.Label({
													text : "Auth:",
													width : "2.1rem",
													visible: {
														path: "timecard>/",
														formatter : function(d) {
															return (d) ? ((d.fOTCap || d.fOTTotal || d.ftOTExc || d.fTrvExc || d.fGWExc) && !(d.feOTCap || d.feOTTotal || d.fetOTExc || d.feTrvExc || d.feGWExc)) : false;
														}
													}
												}).addStyleClass('tempoLblReadonly'),	 
												new sap.m.Label({
													text : "Auth:",
													width : "2.1rem",
													visible: {
														path: "timecard>/",
														formatter : function(d) {
															return (d) ? (d.feOTCap || d.feOTTotal || d.fetOTExc || d.feTrvExc || d.feGWExc) : false;
														}
													}
												}).addStyleClass("tempoLblActive"),	 
												new sap.m.Label({
													text : "{i18n>hdrOT}",
													visible : "{timecard>/feOTTotal}",
												}).addStyleClass("tempoLblActive"),
												new sap.m.Label({
													text : "{i18n>hdrOT}",
													visible : "{= ${timecard>/fOTTotal} && !${timecard>/feOTTotal} }",
												}).addStyleClass("tempoLblReadonly"),

												new tempoInputFloat({
													enabled: "{timecard>/feOTTotal}",
													editable: "{timecard>/feOTTotal}",
													visible : "{timecard>/feOTTotal}",
													//type : "Number",
													//width:"45px",
													width: "3rem",
													maxFractionSize: "{timecard>/Precision}",
													maxFloorSize: "{timecard>/Floor}",
													maxValue: 999,
													minValue: 0,
													change: function(oEvent){
														var _num = (oEvent.oSource.getValue() == "") ? 0 : parseFloat(oEvent.oSource.getValue().replace(/,(\d+)$/,'.$1'));
														oEvent.oSource.setValue(_num);
													},

													value : "{timecard>/Overtime}",		
												}),
												new tempoInputFloat({
													enabled: false,
													editable: false,
													visible : "{= ${timecard>/fOTTotal} && ${timecard>/feOTTotal} === false }",
													width: "3rem",
													maxFractionSize: "{timecard>/Precision}",
													maxFloorSize: "{timecard>/Floor}",
													maxValue: 999,
													minValue: 0,
													value : "{timecard>/Overtime}",		
												}).addStyleClass("tempoInputReadonly"),
												
												new sap.m.CheckBox({
													text : "{i18n>hdrOT}", 
													enabled : "{timecard>/feOTCap}",
													editable : "{timecard>/feOTCap}",
													selected : "{timecard>/OTCap}",
													visible : "{timecard>/feOTCap}",
												}).addStyleClass("tempoChkActive"),
												new sap.m.CheckBox({
													text : "{i18n>hdrOT}", 
													enabled : "{timecard>/feOTCap}",
													editable : "{timecard>/feOTCap}",
													selected : "{timecard>/OTCap}",
													visible : "{= ${timecard>/fOTCap} && !${timecard>/feOTCap} }",
												}).addStyleClass("tempoChkReadonly")
											    ,
												
												new sap.m.CheckBox({
													text : "{i18n>hdrCE}", 
													enabled : "{timecard>/feOTExc}",
													editable : "{timecard>/feOTExc}",
													selected : "{timecard>/OTExc}",
													visible : "{timecard>/feOTExc}",
												}).addStyleClass("tempoChkActive"),
												new sap.m.CheckBox({
													text : "{i18n>hdrCE}", 
													enabled : "{timecard>/feOTExc}",
													editable : "{timecard>/feOTExc}",
													selected : "{timecard>/OTExc}",
													visible : "{= ${timecard>/fOTExc} && !${timecard>/feOTExc} }",
												}).addStyleClass("tempoChkReadonly"),
												
												new sap.m.CheckBox({
													text : "{i18n>hdrTVL}", 
													enabled : "{timecard>/feTrvExc}",
													editable : "{timecard>/feTrvExc}",
													selected : "{timecard>/TrvExc}",
													visible : "{timecard>/feTrvExc}",
												}).addStyleClass("tempoChkActive"),
												new sap.m.CheckBox({
													text : "{i18n>hdrTVL}", 
													enabled : "{timecard>/feTrvExc}",
													editable : "{timecard>/feTrvExc}",
													selected : "{timecard>/TrvExc}",
													visible : "{= ${timecard>/fTrvExc} && !${timecard>/feTrvExc} }",
												}).addStyleClass("tempoChkReadonly"),

												new sap.m.CheckBox({
													text : "{i18n>hdrGW}", 
													enabled : "{timecard>/feGWExc}",
													editable : "{timecard>/feGWExc}",
													selected : "{timecard>/GWExc}",
													visible : "{timecard>/feGWExc}",
													select : function(oEvent) {
														mTimecard.get().oData.IsItemInfra = mTimecard.get().oData.GwExc;
															//oEvent.oSource.getBindingContext("timecard").getModel().getData().GwFlag;
													},
												}).addStyleClass("tempoChkActive"), 
												new sap.m.CheckBox({
													text : "{i18n>hdrGW}", 
													enabled : "{timecard>/feGWExc}",
													editable : "{timecard>/feGWExc}",
													selected : "{timecard>/GWExc}",
													visible : "{= ${timecard>/fGWExc} && !${timecard>/feGWExc} }",
												}).addStyleClass("tempoChkReadonly"), 

												new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													value : "{timecard>/GwReason}",
													placeholder : "{i18n>phGW}",
													enabled : "{= ${timecard>/IsItemInfra} && ${timecard>/feGWExc} }",
													editable : "{= ${timecard>/IsItemInfra} && ${timecard>/feGWExc} }",
													width: "250px",
													tooltip : "Enter Reason",
													visible : "{= ${timecard>/feGWExc} && ${timecard>/GWExc} }",
												}),
												new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													value : "{timecard>/GwReason}",
													placeholder : "{i18n>phGW}",
													enabled : false,
													editable : false,
													width: "250px",
													tooltip : "Enter Reason",
													visible : "{= ${timecard>/fGWExc} && ${timecard>/GWExc} && !${timecard>/feGWExc} }",
												}).addStyleClass("tempoInputReadonly"),

//												new sap.m.CheckBox({
//													text : "GW", 
//													enabled : "{timecard>/ApprovalMode}",
//													editable : "{timecard>/ApprovalMode}",
//													selected : "{timecard>/GWExc}",
//													visible : "{timecard>/fGWExc}",
//												}),
//												new sap.m.Input({
//													value : "{timecard>/Overtime}",
//													class : "sapUiSmallMarginBottom",
//												    width: "3rem",
//												    //textAlign : sap.ui.core.TextAlign.Right,
//													enabled: "{timecard>/OTEligible}",
//													editable: "{timecard>/ApprovalMode}",
//													visible : "{timecard>/ApprovalMode}"														
//												}), 
												new sap.m.ToolbarSeparator({
													visible: {
														path: "timecard>/",
														formatter : function(d) {
															return (d) ? (d.feOTCap || d.feOTTotal || d.fetOTExc || d.feTrvExc || d.feGWExc) && d.fIncPay : false;
														}
													}
												}), 
										
												new sap.m.Label({
													text : "{i18n>hdrIncPayCO}",
													visible : "{timecard>/feIncPay}",
												}).addStyleClass("tempoLblActive"),
												new sap.m.Label({
													text : "{i18n>hdrIncPayCO}",
													visible : "{= ${timecard>/fIncPay} && !${timecard>/feIncPay} }",
												}).addStyleClass("tempoLblReadonly"),

												new tempoInputFloat({
													enabled: "{timecard>/feIncPay}",
													editable: "{timecard>/feIncPay}",
													visible : "{timecard>/feIncPay}",														
													width: "3rem",
													maxFractionSize: 0,
													maxFloorSize: 1,
													maxValue: 4,
													minValue: 0,
													change: function(oEvent){
														var _num = (oEvent.oSource.getValue() == "") ? 0 : parseFloat(oEvent.oSource.getValue().replace(/,(\d+)$/,'.$1'));
														oEvent.oSource.setValue(_num);
													},

													value : "{timecard>/IncPay}"	
												}),
												new tempoInputFloat({
													enabled: false,
													editable: false,
													visible : "{= ${timecard>/fIncPay} && !${timecard>/feIncPay} }",														
													width: "3rem",
													maxFractionSize: 0,
													maxFloorSize: 1,
													maxValue: 4,
													minValue: 0,
													value : "{timecard>/IncPay}"	
												}).addStyleClass("tempoInputReadonly"),
												

												new sap.m.Label({
													text : "-",
													visible : "{= ${timecard>/fIncPay} && !${timecard>/feIncPay} && ${timecard>/IncChargeObj} !== '' }",
												}).addStyleClass("tempoLblReadonly"),
												new sap.m.Label({
													text : "-",
													visible : "{timecard>/feIncPay}",
												}).addStyleClass("tempoLblActive"),	
												
												new sap.m.Input({
													type : "Text",
													enabled: "{timecard>/feIncPay}",
													editable: "{timecard>/feIncPay}",
													value : "{timecard>/IncChargeObj}",
													width: "200px",
													placeholder: "{i18n>phChargeCode}",
													visible : "{timecard>/feIncPay}",
												}),
												new sap.m.Input({
													type : "Text",
													enabled: false,
													editable: false,
													value : "{timecard>/IncChargeObj}",
													width: "200px",
													placeholder: "{i18n>phChargeCode}",
													visible : "{= ${timecard>/fIncPay} && !${timecard>/feIncPay} && ${timecard>/IncChargeObj} !== '' }",
												}).addStyleClass("tempoInputReadonly"),
												
												new sap.m.Label({
													text : ""
												}).addStyleClass("tempoLblActive"),	

												//--- spacer
												new sap.m.ToolbarSpacer({
												//	visible: {
												//		path: "timecard>/",
												//		formatter: formatters.showProjectedHours
												//	}
												}),
												new sap.m.Label({
													text : "CFWD: {timecard>/CFWDHrs}",
													visible: "{timecard>/fCFWD}",
													tooltip: "{timecard>/WeekDesc}"
												}).addStyleClass("tempoLblReadonly"),

												new sap.m.Label({
													width: "3rem",
													text : "Wk: {timecard>/WeekId}",
													visible: "{timecard>/fWeekId}",
													tooltip: "{timecard>/WeekDesc}"
												}).addStyleClass("tempoLblReadonly"),

												new sap.m.Label({
													width: "5rem",
													text : "Min: {timecard>/WeekPlanned}",
													visible: "{timecard>/fWeekPln}",
													tooltip: "{timecard>/WeekDesc}"
												}).addStyleClass("tempoLblReadonly"),
												new sap.m.Label({
													width: "1px",
													text : "",
												}).addStyleClass("tempoLblReadonly"),

												/*
												new sap.m.Input({
													type : "Text",
													//class : "sapUiSmallMarginBottom",
													value : "{timecard>/Planned}",
													enabled : false,
													editable : false,
													tooltip : "Min number of hours to be recorded for this week",
													//visible : "{= (${timecard>/LayoutUK} || && ${timecard>/ApprovalMode} === false) }",
												})
												*/
												]
											}));
											
											self.grid.bindAggregation("items", "timecard>/TimesheetRecords", _timerows);
											
											mTimecard.get().refresh(true);	
											
											}));
											
										},
										clearGrid : function() {
											var _oData = mTimecard.get().oData;

											this.grid.getColumns().forEach(function(column) {
												column.destroy()
											});

											this.grid.removeAllColumns();
										},
										addTempoMessages: function(){
											var self = this;
											if (!(self.tempoMsg instanceof sap.m.MessageStrip)) {
											    self.tempoMsg = new sap.m.MessageStrip({
													text:  "{timecard>/AutoComplText}",
													type: "Success",
													showIcon: false,
													showCloseButton: false,
													visible: "{timecard>/zzAutoComp}",
													class: "sapUiMediumMarginBottom",
													});
											} 
										},
										enterNotesDlg: function(oEvent){
											this.notesModel = new sap.ui.model.json.JSONModel({});
											//oEvent.oSource.getBindingContext('timecard').getObject();
											this.notesModel.setData(oEvent.oSource.getBindingContext('timecard').getObject());
											//this.notesModel.setData(oEvent.oSource.getBindingContext('timecard').getObject());

											this._dialog || (this._dialog = sap.ui.jsfragment("z_tpo_timecard.fragment.chargeNotes", this));
											//this._dialog.setModel(this.getModel('timecard'));
											this._dialog.open();

										},
										onNotesClose: function(oEvent) {
											// _item = this.grid.getBindingInfo('items').binding.getContexts()[0].getObject();
											//_item = this.notesModel.oData;
											var _self = this;
											
											//this._dialog.destroy();											
											//this._dialog = null;
										
											var _item = this.notesModel.oData;

											tempoUtils.tempoValidateRecord(_item).done(function(data) {
												//mTimecard.recalculateTotals(); 
												_self._dialog.destroy();											
												_self._dialog = null;
											});
											

										},
										onNotesCancel: function(oEvent) {
											this._dialog.destroy();											
											this._dialog = null;
											
										}

									
									});
				});