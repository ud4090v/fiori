sap.ui
		.define([ 
			"z_tpo_timecard/controller/common/framework",
			'sap/ui/core/Fragment',
			"z_tpo_timecard/model/model-config",
			"z_tpo_timecard/model/model-texts", 
			"z_tpo_timecard/model/formatters",
			"z_tpo_timecard/model/model-timecard",
			"z_tpo_timecard/model/model-nav", 
			'tpoUtils/common/base',
			'tpoUtils/common/ui'
			],

		function(Controller, Fragment, mConfig, mTexts, formatters, mTimecard, mNav, _d, _ui) {

			"use strict";

			return Controller
					.extend("z_tpo_timecard.controller.timecard", {

						onInit : function(oEvent) {

							this.initFramework(oEvent);
							
							var self = oEvent.oSource.getController();
						
							if (_ui.isCompact()) {
								this.getView().removeStyleClass("tempoDesktop");
								this.getView().addStyleClass("tempoMobile");	
								if(sap.ui.Device.os.ios || sap.ui.Device.browser.safari) this.getView().addStyleClass("sf");  //darker color for .sapMInputBaseDisabledInner on Safari
							} else {
								(sap.ui.getCore().byId("aSubHeader"))?sap.ui.getCore().byId("aSubHeader").addStyleClass("sapMTitleStyleAuto"):false;
							}


							sap.ui.getCore().getEventBus().subscribe("tempoNav", "previousPeriod", this.handleNavPreviousPeriod, this);
							sap.ui.getCore().getEventBus().subscribe("tempoNav", "nextPeriod", this.handleNavNextPeriod, this);
							sap.ui.getCore().getEventBus().subscribe("tempoNav", "switchUser", this.evOnSwitchUser, this);
							sap.ui.getCore().getEventBus().subscribe("tempoNav", "switchPayDate", this.handleSwitchPaydate, this);
							sap.ui.getCore().getEventBus().subscribe("tempoNav", "reloadTimedata", this.handleReloadTimesheet, this);
						},
						
						onExit : function() {
							sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "previousPeriod", this.handleNavPreviousPeriod, this);
							sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "nextPeriod", this.handleNavNextPeriod, this);
							sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "switchUser", this.evOnSwitchUser, this);
							sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "switchPayDate", this.handleSwitchPaydate, this);
							sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "reloadTimedata", this.handleReloadTimesheet, this);
							this.exitFramework();
						},


						handleSwitchPaydate : function(channel, event, data) {
							if (!this.dateSelectDialog.Control) {
								this.dateSelectDialog.Control = sap.ui
										.jsfragment("z_tpo_timecard.fragment.selectCalDate", this);
							}
							this.dateSelectDialog.Control
									.getAggregation("content")[0]
									.destroySelectedDates();
							this.dateSelectDialog.Control
									.getAggregation("content")[0]
									.addSelectedDate(new sap.ui.unified.DateRange({
										startDate : mTimecard.getPayEnd()
									}));
							_d.openDialog(this.dateSelectDialog);
							//this.dateSelectDialog.Control.open()
						},

						/**
						 * Similar to onAfterRendering, but this hook is invoked
						 * before the controller's View is re-rendered (NOT
						 * before the first rendering! onInit() is used for that
						 * one!).
						 * 
						 * @memberOf lm_app1.app
						 */
						onBeforeRendering : function() {
						},

						/**
						 * Called when the View has been rendered (so its HTML
						 * is part of the document). Post-rendering
						 * manipulations of the HTML could be done here. This
						 * hook is the same one that SAPUI5 controls get after
						 * being rendered.
						 * 
						 * @memberOf lm_app1.app
						 */
						onAfterRendering : function() {
							var self = this;
//							sap.ui.Device.orientation
//							.attachHandler(function(oEvent) {
//								this.rerenderGrid(this, true);
//							}, this);
							$(window).resize(function(){sap.ui.getCore().getEventBus().publish("framework", "resizeGrid");});

						},
						/**
						 * Called when the Controller is destroyed. Use this one
						 * to free resources and finalize activities.
						 * 
						 * @memberOf lm_app1.app
						 */

						setTimeGrid : function() {
							this.renderPage();
							(!0 === (_ui.isCompact()) ? this.setTimeGridMobile() : this.setTimeGridDefault());							
						},

						setTimeReviewGrid : function() {
							this.renderPage();
							(!0 === (_ui.isCompact()) ? this.setTimeReviewGridMobile() : this.setTimeReviewGridDefault());							
						},

						getStatusButton : function(id) {
							return (_ui.isCompact()) ? this.getStatusButtonMobile(id) : this.getStatusButtonDef(id);							
						},

						setTimecardButtons : function(editable, completeStatus) {
							this.setFrameworkButtons(editable, completeStatus);
							//(!0 === (_ui.isCompact()) ? this.setTimecardButtonsMobile(editable, completeStatus) : this.setFrameworkButtons(editable, completeStatus));							
						},

//						setTimeReviewButtons : function(editable, completeStatus) {
//							this.setFrameworkReviewButtons(editable, completeStatus);
//							//(!0 === (_ui.isCompact()) ? this.setTimeReviewButtonsMobile(editable, completeStatus) : this.setFrameworkReviewButtons(editable, completeStatus));							
//						},

						setTimeReviewGridMobile : function() {
							this.renderPage();
							this.errorPage.setVisible(!this.isDeviceModeSupported());
							this.errorPage.setText(mConfig.getAvailabilityTitle(_ui.getUISystemType(), _ui.mobileOrientationMode()));
							this.errorPage.setDescription(mConfig.getAvailabilityDescription(_ui.getUISystemType(), _ui.mobileOrientationMode()));
							this.page.setVisible(this.isDeviceModeSupported());
							if (this.isDeviceModeSupported()){
								//this.setLeftContent(this.page.getSubHeader());

								if (!(this.tcControl instanceof sap.m.ScrollContainer)) {
									this.tcControl = new sap.m.ScrollContainer();
								}
								if (sap.ui.getCore().byId("time_weekview")) {
									sap.ui.getCore().byId("time_weekview") 
										.destroy();
								}
								if (sap.ui.getCore().byId("time_details")) {
									sap.ui.getCore().byId("time_details").destroy();
								}
								this.tcControl.destroyContent();
								this.tcControl
									.addContent(new sap.ui.core.mvc.JSView("time_weekview", {
										viewName : "z_tpo_timecard.view.mobile.timesheet"
									}));
							}
						},

						setTimeGridMobile:function() {
							    this.renderPage();
								this.errorPage.setVisible(!this.isDeviceModeSupported());
								this.errorPage.setText(mConfig.getAvailabilityTitle(_ui.getUISystemType(), _ui.mobileOrientationMode()));
								this.errorPage.setDescription(mConfig.getAvailabilityDescription(_ui.getUISystemType(), _ui.mobileOrientationMode()));
								this.page.setVisible(this.isDeviceModeSupported());
								if (this.isDeviceModeSupported()) {
								//	this.setLeftContent(this.page.getSubHeader());
									if (!(this.tcControl instanceof sap.m.ScrollContainer)) {
										this.tcControl = new sap.m.ScrollContainer();
									}
									if (sap.ui.getCore().byId("time_weekview")) {
										sap.ui.getCore().byId("time_weekview")
												.destroy();
									}
									if (sap.ui.getCore().byId("time_details")) {
										sap.ui.getCore().byId("time_details").destroy();
									}
									this.tcControl.destroyContent();
									this.tcControl
											.addContent(new sap.ui.core.mvc.JSView("time_weekview", {
												viewName : "z_tpo_timecard.view.mobile.timesheet"
											}));
									
								}
						  },

						onMobilePayendDateChange : function(oEvent) {
							sap.ui.getCore().getEventBus()
									.publish("tempoNav", "switchPayDate");
						},

						onPayendDateSelected : function(oEvent) {
							// handler for calendar date select - mobile pay end
							// change
							var self = this;
							var _sel = oEvent.oSource.getSelectedDates();
							var _date;
							if (_sel) {
								_date = _sel[0].getProperty("startDate");
							} else {
								_date = mTimecard.getPayEnd();
							}

							self.getView().setBusy(true);
							$.when(self.handlePayEndDateChange(_date
									.toLocaleDateString()))
									.then(function(data) {
										self.getView().setBusy(false);
									});
							
							this.dateSelectDialog.Control.close();

							//_d.destroyDialog(this.dateSelectDialog);

						},
						dateDialogDestroy: function(oEvent){
							_d.destroyDialog(this.dateSelectDialog);
						},
						getStatusButtonMobile : function(id) {
							// var _self = this;

							if (sap.ui.getCore().byId(id)) {
								sap.ui.getCore().byId(id).destroy();
							}
							var _butt = new sap.ui.core.Icon(id, {
								src :
								// "sap-icon://process",
								{
									path : "timecard>/Status",
									formatter : function(d) {
										return mConfig.getStatusIcon(d)
									}
								},
								tooltip : "{timecard>/StatusText}",
								customData : [ new sap.ui.core.CustomData({
									key : "status",
									value : "{timecard>/Status}"
								}), new sap.ui.core.CustomData({
									key : "statusText",
									value : "{timecard>/StatusText}"
								}), ],
								press : function(oEvent) {
									var _status = _d.getCustomData(oEvent.oSource
													.getCustomData(), "status")
									var _statusText = _d.getCustomData(oEvent.oSource
													.getCustomData(), "statusText")
									sap.m.MessageBox[mConfig.statusSeverity(_status)]
											(_statusText, {
												title : '{i18n>hStatusTitle}'
											});
								}
							}).addStyleClass("tempoMobileSubheader");

							if (mTimecard.getStatus()) {
								_butt
										.addStyleClass(mConfig.getStatusStyle(mTimecard.getStatus()));
							}
							return _butt;

						},

						
						setTimecardButtonsMobile : function(editable, completeStatus) {

							var _self = this;

							this.setFrameworkButtons(editable, completeStatus);

							_self.toolBar.removeAllContentLeft();

							if (_self.mode != 'APPROVE') {

								_self.toolBar
										.addContentLeft(new sap.m.OverflowToolbar({
											design : sap.m.ToolbarDesign.Transparent,
											content : [
													new sap.m.Button({
														// type :
														// sap.m.ButtonType.Emphasized,
														icon : "sap-icon://time-entry-request",
														//text : "Enter Time",
														// "{app>/messageLength}",
														visible : true,
														press : function(oEvent) {
															if (sap.ui
																	.getCore()
																	.byId("time_weekview")) {
															} else {
																if (sap.ui
																		.getCore()
																		.byId("time_details")) {
																	sap.ui
																			.getCore()
																			.byId("time_details")
																			.destroy();
																}
																_self.tcControl
																		.destroyContent();
																_self.tcControl
																		.addContent(new sap.ui.core.mvc.JSView("time_weekview", {
																			viewName : "z_tpo_timecard.view.mobile.timesheet"
																		}));
																sap.ui
																		.getCore()
																		.getEventBus()
																		.publish("framework", "renderTimesheet");
																// sap.ui.getCore().byId("time_weekview").getController().renderTimeGrid(_self.getOwnerComponent());
															}
														}
													}),
													new sap.m.Button({
														// type :
														// sap.m.ButtonType.Emphasized,
														icon : "sap-icon://detail-view",
														//text : "Timesheet Details",
														// "{app>/messageLength}",
														visible : "{timecard>/DisplayDetails}",
														press : function(oEvent) {
															if (sap.ui
																	.getCore()
																	.byId("time_details")) {
															} else {
																if (sap.ui
																		.getCore()
																		.byId("time_weekview")) {
																	sap.ui
																			.getCore()
																			.byId("time_weekview")
																			.destroy();
																}
																_self.tcControl
																		.destroyContent();
																_self.tcControl
																		.addContent(new sap.ui.core.mvc.JSView("time_details", {
																			viewName : "z_tpo_timecard.view.mobile.timesheetDetails"
																		}));
																sap.ui
																		.getCore()
																		.getEventBus()
																		.publish("framework", "renderDetails");

															}
														}
													}),
													
 ]
										}));


							}
						},
						
						renderPage: function(){
							
							var b = this;
							
							(sap.ui.getCore().byId("aHeader"))?sap.ui.getCore().byId("aHeader").destroy():false;
							(sap.ui.getCore().byId("hStatusT"))?sap.ui.getCore().byId("hStatusT").destroy():false;
							(sap.ui.getCore().byId("hStatusI"))?sap.ui.getCore().byId("hStatusI").destroy():false;
							
							var _header = new sap.m.Bar("aHeader", {
								contentLeft : new sap.m.Button({
									icon : "sap-icon://nav-back",
									press : function(a) {
										sap.ushell.Container
												.getService("CrossApplicationNavigation")
												.toExternal({
													target : {semanticObject: mNav.getSemObject(), action: mNav.getIntent()},
													params : {}
												})
									},
									visible : "{xnav>/navEnabled}",
									tooltip : "{i18n>btnBack}"
								})
							});
							
							
							(sap.ui.getCore().byId("aSubHeader"))?sap.ui.getCore().byId("aSubHeader").destroy():false;
							
							var _subHeader = new sap.m.Bar("aSubHeader");
							if (!_ui.isCompact())
								_subHeader.addStyleClass("sapMTitleStyleAuto");
							
							
							if (_ui.isCompact() && _ui.mobileOrientationMode() === 'landscape') {
								_header.addContentRight(
									new sap.m.Button({
									type : sap.m.ButtonType.Standard,
									text : "{timecard>/EmployeeName} ({timecard>/EmployeeID})",
									enabled : {
										path : "timecard>/",
										formatter : function(a) {
											if (a)
												return a.TimeManager
														&& !a.ApprovalMode
										}
									},
									press : b.switchEmployee,
								})
								.addEventDelegate({
								     "onAfterRendering": function (oEvent) {
//								    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", 15);
								    	 $('#'+oEvent.srcControl.sId).attr("tabindex", 15);
								    	 $('#'+oEvent.srcControl.sId).attr("aria-label", "Switch employees");
								     }
								})
								.addStyleClass("empIdButton")
								);
								
								_header.addContentLeft(
									new sap.m.DatePicker({
										displayFormat : {
											path : "timecard>/",
											formatter : function(d) {
												return(_d.getLocaleDateString());
											}
										},
											//"{i18n>dateFormat}", //sap.ui.getCore().getConfiguration().getFormatLocale(),
										dateValue : "{timecard>/PayendDate}",
										valueFormat : "yyyy-MM-dd",
										width : "8rem",
										change : b.onPayendDateChange,
										placeholder:{
											path: "timecard>/",
											formatter: function(d) {
												var _l = (d) ? d.LayoutUK || d.LayoutAUS : false;
												return (_l) ? mTexts.get().getResourceBundle().getText('hWEPlaceHolderShort') : mTexts.get().getResourceBundle().getText('hWEPlaceHolder');
											}
										},
										enabled : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d));
											}
										},
										visible : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d) );
											}
										}
									})
									.addEventDelegate({
									     "onAfterRendering": function (oEvent) {
									    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", 1);
									     }
									})
								);
								_header.addContentMiddle(
											new sap.ui.core.Icon("hStatusI",{
												src :
												{
													path : "timecard>/Status",
													formatter : function(d) {
														return mConfig.getStatusIcon(d)
													}
												},
												tooltip : "{timecard>/StatusText}",
												customData : [ new sap.ui.core.CustomData({
													key : "status",
													value : "{timecard>/Status}"
												}), new sap.ui.core.CustomData({
													key : "statusText",
													value : "{timecard>/StatusText}"
												}), ],
												visible : {
													path: "timecard>/",
													formatter: function(d) {
														return (!d.ApprovalMode);
													}
												},
												press : function(oEvent) {
													var _status = _d.getCustomData(oEvent.oSource
															.getCustomData(), "status")
													var _statusText = _d.getCustomData(oEvent.oSource
															.getCustomData(), "statusText")
													sap.m.MessageBox[mConfig.statusSeverity(_status)]
													(_statusText, {
														title : "{i18n>hStatusTitle}"
													});															
												}
											})
							               .addStyleClass("tempoMobileSubheader")
							               .addStyleClass(mConfig.getStatusStyle(mTimecard.getStatus()))									              
									);

							} else {
								_header.addContentMiddle(
									new sap.m.Title({
										text : {
											path: "timecard>/",
											formatter: function(d) {
												return d.EmployeeName || '............................................';
											}
										},
										//visible : "{timecard>/ApprovalMode}",
										titleStyle : sap.ui.core.TitleLevel.H1
									})
								);
								_subHeader.addContentLeft(
									new sap.m.Label({
										text : {
											path: "timecard>/",
											formatter: function(d) {
												var _l = (d) ? d.LayoutUK || d.LayoutAUS : false;
												return (_l) ? mTexts.get().getResourceBundle().getText('hWETitleShort') : mTexts.get().getResourceBundle().getText('hWETitleLong');
											}
										},
										visible : {
											path: "timecard>/",
											formatter: function(d) {
												return (!_ui.isCompact());
											}
										}
									}));
								
								_subHeader.addContentLeft(
									new sap.m.DatePicker({
										displayFormat : {
											path : "timecard>/",
											formatter : function(d) {
												return(_d.getLocaleDateString());
											}
										},
											//"{i18n>dateFormat}", //sap.ui.getCore().getConfiguration().getFormatLocale(),
										dateValue : "{timecard>/PayendDate}",
										valueFormat : "yyyy-MM-dd",
										width : "8rem",
										change : b.onPayendDateChange,
										placeholder:{
											path: "timecard>/",
											formatter: function(d) {
												var _l = (d) ? d.LayoutUK || d.LayoutAUS : false;
												return (_l) ? mTexts.get().getResourceBundle().getText('hWEPlaceHolderShort') : mTexts.get().getResourceBundle().getText('hWEPlaceHolder');
											}
										},
										enabled : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d));
											}
										},
										visible : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d) && !_ui.isCompact());
											}
										}
									})
									.addEventDelegate({
									     "onAfterRendering": function (oEvent) {
									    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", 1);
									     }
									})
									);
								
								_subHeader.addContentLeft(
									new sap.m.Label({
										text : {
											path : "timecard>/PayendDate",
											formatter : function(d) {
												//return ((d instanceof Date) ? d.formatUS() : "n/a");
												return ((d instanceof Date) ? d.toLocaleDateString() : "n/a");
											}
										},
										visible : {
											path : "timecard>/",
											formatter : function(d) {
												return(!formatters.timeNavAllowed(d));
											}
										} 
									})
								);
								
								_subHeader.addContentLeft(
									new sap.m.Button({
										type : sap.m.ButtonType.Standard,
										text : {
											path : "timecard>/PayendDate",
											formatter : function(d) {
												return mTexts.get().getResourceBundle().getText('hWETitleShort')
												//return mTexts.getText('hWETitleShort')
														//.concat((d instanceof Date) ? d.formatUS() : "n/a");
														.concat((d instanceof Date) ? d.toLocaleDateString() : "n/a");
											}
										},
										enabled : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d));
											}
										},
										press : b.onMobilePayendDateChange,
										visible : {
											path : "timecard>/",
											formatter : function(d) {
												return(formatters.timeNavAllowed(d) && _ui.isCompact());
											}
										},
									})
									.addStyleClass("empIdButton")
									.addStyleClass("tempoMobileSubheader")
								);
																
								_subHeader.addContentRight(
									new sap.ui.layout.VerticalLayout({
										width : "100%",
										//heigth : "100%",
										content : [
											(new sap.m.Button({
												type : sap.m.ButtonType.Standard,
												text : "{timecard>/EmployeeName} ({timecard>/EmployeeID})",
												enabled : {
													path : "timecard>/",
													formatter : function(a) {
														if (a)
															return a.TimeManager
																	&& !a.ApprovalMode
													}
												},
												press : b.switchEmployee,
												visible : {
													path: "timecard>/",
													formatter: function(d) {
														return (!_ui.isCompact());
													}
												}
											})
											.addEventDelegate({
											     "onAfterRendering": function (oEvent) {
//											    	 $('#'+oEvent.srcControl.sId+'-inner').attr("tabindex", 15);
											    	 $('#'+oEvent.srcControl.sId).attr("tabindex", 15);
											    	 $('#'+oEvent.srcControl.sId).attr("aria-label", "Switch employees");
											     }
											})
											.addStyleClass("empIdButton")),
											(new sap.m.Button({
												type : sap.m.ButtonType.Standard,
												text : "{timecard>/EmployeeID}",
												enabled : {
													path : "timecard>/",
													formatter : function(a) {
														if (a)
															return a.TimeManager
																	&& !a.ApprovalMode
													}
												},
												press : b.switchEmployee,
												visible : {
													path: "timecard>/",
													formatter: function(d) {
														return (_ui.isCompact());
													}
												}
											}))
													.addStyleClass("empIdButton")
													.addStyleClass("tempoMobileSubheader")
										]
									}) 

								);
								
								_subHeader.addContentMiddle(
									new sap.m.Title("hStatusT",{
						            	   titleStyle:sap.ui.core.TitleLevel.H4, 
						            	   text:"{timecard>/StatusText}", 
						            	   visible : {
												path: "timecard>/",
												formatter: function(d) {
													return (!d.ApprovalMode && !_ui.isCompact());
												}
											},
						               }).addStyleClass(mConfig.getStatusStyle(mTimecard.getStatus()))
						         );
						               
								_subHeader.addContentMiddle(
										new sap.ui.core.Icon("hStatusI",{
											src :
											{
												path : "timecard>/Status",
												formatter : function(d) {
													return mConfig.getStatusIcon(d)
												}
											},
											tooltip : "{timecard>/StatusText}",
											customData : [ new sap.ui.core.CustomData({
												key : "status",
												value : "{timecard>/Status}"
											}), new sap.ui.core.CustomData({
												key : "statusText",
												value : "{timecard>/StatusText}"
											}), ],
											visible : {
												path: "timecard>/",
												formatter: function(d) {
													return (!d.ApprovalMode && _ui.isCompact());
												}
											},
											press : function(oEvent) {
												var _status = _d.getCustomData(oEvent.oSource
														.getCustomData(), "status")
												var _statusText = _d.getCustomData(oEvent.oSource
														.getCustomData(), "statusText")
												sap.m.MessageBox[mConfig.statusSeverity(_status)]
												(_statusText, {
													title : "{i18n>hStatusTitle}"
												});															
											}
										})
						               .addStyleClass("tempoMobileSubheader")
						               .addStyleClass(mConfig.getStatusStyle(mTimecard.getStatus()))									              
								);

							}
							
							if (!this.page instanceof sap.m.Page) {
								this.page = new sap.m.Page({
									enableScrolling : !1,
								});
							}
							
							this.page.setCustomHeader(_header);
							if(_ui.isCompact() && _ui.mobileOrientationMode() === 'landscape') {
								this.page.setShowSubHeader(false);
							} else {
								this.page.setSubHeader(_subHeader);
								this.page.setShowSubHeader(true);
							}
							


							

						},
						

						
//						setTimeReviewButtonsMobile : function(editable, completeStatus) {
//
//							this.setFrameworkReviewButtons(editable, completeStatus);
//
//							this.toolBar.removeAllContentLeft();
//
//						},

					});
		});