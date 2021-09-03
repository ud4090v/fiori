sap.ui.define(["" +
		"sap/ui/core/mvc/Controller", 
		"sap/ui/core/routing/History", 
		'tpoUtils/common/base', 
		'tpoUtils/LZString/lza1',
		'tpoUtils/common/ui', 
		"z_tpo_timecard/tempo.utils",
		"z_tpo_timecard/model/model-config", 
		"z_tpo_timecard/model/model-timecard", 
		"z_tpo_timecard/model/model-tempo", 
		"z_tpo_timecard/model/model-nav", 
		"z_tpo_timecard/model/model-instances", 
		"z_tpo_timecard/model/model-app", 
		//"z_tpo_timecard/model/model-texts", 
		], 
		
		function(l, m, _d, lza, _ui, g, mConfig, mTimecard, mTempo, mNav, mInstances, _app) {
  return l.extend("z_tpo_timecard.controller.common.framework", {_resizeTimeout: 0, errorPage:null, toolBar:null, taPanel: null, tcControl:null, page:null, mode:null, employeeDialog:{Model:null, Control:null}, rejectDialog:{Model:null, Control:null}, dateSelectDialog:{Model:null, Control:null}, adjustDialog:{Model:null, Control:null}, errorMessages:[], subHeaderBar:null, getRouter:function() {
    return this.getOwnerComponent().getRouter();
  }, getModel:function(a) {
    return this.getView().getModel(a);
  }, setModel:function(a, c) {
    return this.getView().setModel(a, c);
  }, initFramework:function(a) {
	  var _self = this;
    a = this.getRouter();
	mConfig.setStatusIcons();	
    a.getRoute("employeeTimesheet").attachMatched(this._onLoadEETimesheet, this);
    a.getRoute("timesheet").attachMatched(this._onLoadMyTimesheet, this);
    a.getRoute("weekView").attachMatched(this._onDisplayWeekView, this);
    a.getRoute("approveTimesheet").attachMatched(this._onApproveTimesheet, this);
	if(_ui.isCompact()) sap.ui.Device.orientation.attachHandler(this.evOrientationChange, this);		

    sap.ui.getCore().getEventBus().subscribe("tempoNav", "nextObject", this.handleNavigateNextObject, this);
    sap.ui.getCore().getEventBus().subscribe("tempoNav", "navToCWB", this.handleNavigateCWB, this);
    sap.ui.getCore().getEventBus().subscribe("tempoNav", "navToCOWB", this.handleNavigateCOWB, this);
    sap.ui.getCore().getEventBus().subscribe("tempoNav", "goBack", this.evOnGoBack, sap.ushell.Container.getService("CrossApplicationNavigation"));
    sap.ui.getCore().getEventBus().subscribe("framework", "resizeGrid", this.evOnResizeGrid, this);
    this.getView().addStyleClass("tempoDesktop");

    /*
    window.onbeforeunload = function() {
    	if(mTimecard.hasChanges()) {
			sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
			     title: "{i18n>btnLeaveTS}",
			     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
				//	styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {
								return;
							} else {
								_self._navigateToTimeEntry();
								//_self.setTimecardData(mTimecard.get().oData);
							}
						}
				}
			);															
		} else {
			return;
		}
    };
    */
    

  }, evOnGoBack:function(a, c, b) {
    this.toExternal({target: {semanticObject:mNav.getSemObject(), action:mNav.getIntent()}, params:{}});
  },
  onExit:function(a) {

	  this.exitFramework(a);
  }, exitFramework:function(a) {
    sap.ui.Device.orientation.detachHandler(this.evOrientationChange, this);
    // sap.ui.Device.orientation.detachHandler(this.evOrientationTimeReview,
	// this);
    // sap.ui.Device.orientation.detachHandler(this.evOrientationTimeEntry,
	// this);
    sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "nextObject", this.handleNavigateNextObject, this);
    sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "goBack", this.evOnGoBack, sap.ushell.Container.getService("CrossApplicationNavigation"));
    sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "navToCWB", this.handleNavigateCWB, this);
    sap.ui.getCore().getEventBus().unsubscribe("tempoNav", "navToCOWB", this.handleNavigateCOWB, this);
    sap.ui.getCore().getEventBus().unsubscribe("framework", "resizeGrid", this.evOnResizeGrid, this);
    _d.destroyControl("hStatusT");
    _d.destroyControl("hStatusI");
  }, getResourceBundle:function() {
	  
	  return z_tpo_timecard.model.model-texts.get().getResourceBundle();
    // return g.getResourceBundle();
  }, 
  getStatusButton:function(a){
	  this.getStatusButtonDef(a);
  },
  handleNavigateCWB:function(a,c,b){
		var _pernr = mTempo.grid.EmployeeID;
		
		var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");

		oCrossAppNav.toExternal({
			  target : { semanticObject : "ZCAWBSEMOBJ", action : "display" },
			  params : { "workdate": b.workdate, "pernr": b.pernr, caller: lza.compressToEncodedURIComponent(this.getOwnerComponent().sId), "editable": b.editable, "view":"CWB" }
		}); 		
	  
  },
  handleNavigateCOWB:function(a,c,b){
		var _pernr = mTempo.grid.EmployeeID;
		
		var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");

		oCrossAppNav.toExternal({
			  target : { semanticObject : "zworkbreak", action : "change" },
			  params : { "workdate": b.workdate, "pernr": b.pernr, caller: lza.compressToEncodedURIComponent(this.getOwnerComponent().sId), "editable": b.editable, "view":"COWB" }
		}); 		
	  
},
  getStatusButtonDef:function(a) {
	var _status = mTimecard.getStatus();
    sap.ui.getCore().byId(a) && sap.ui.getCore().byId(a).destroy();
    a = new sap.m.Title(a, {titleStyle:sap.ui.core.TitleLevel.H4, text:"{timecard>/StatusText}", visible:"{= ${timecard>/ApprovalMode} === false }"});
    _status && a.addStyleClass(mConfig.getStatusStyle(_status));
    return a;
  }, handleNavPreviousPeriod:function(a, c, b) {
	  var _a = new Date(mTimecard.getPayEnd());
	  _a.setDate(_a.getDate() - 8);
	  this.handlePayEndDateChange(_a);
  }, evOnSwitchUser:function(a, c, b) {
    this.employeeDialog.Control || (this.employeeDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.selectEmployee", this));
    // g.setResize(!1);
    // $(window).off('resize');
    _d.openDialog(this.employeeDialog);
  // this.employeeDialog.Control.open();
  }, evOnResizeGrid: function(a ,b, c){
	  (!0 === _app.isReview()) ? this._hResiseGridReview() : this._hResiseGrid();
  },
  _hResiseGrid : function() {
	  clearTimeout(this._resizeTimeout);
	  this._resizeTimeout = setTimeout(function(hh){
		  hh.rerenderGrid(hh, true);
	  }, 500, this);  
  },
  _hResiseGridReview : function() {
	  clearTimeout(this._resizeTimeout);
	  this._resizeTimeout = setTimeout(function(hh){
		  hh.rerenderGridReview(hh, true);
	  }, 500, this);  
  },  
  handleNavNextPeriod:function(a, c, b) {
	  var _a = new Date(mTimecard.getPayEnd());
	  _a.setDate(_a.getDate() + 1);
	  this.handlePayEndDateChange(_a);
  }, handlePayEndDateChange:function(a, tzo) {
    var c = this;
    var d = $.Deferred();
    mTempo.getData({startDate:a, Promise: d})
    .done(function(_aa, _cc) {
    	c.loadTimecardDef(_aa, _cc);
	})
	.fail(function(oError){
   		var _msg = g.buildMessage(mTempo.getMessages());
   		if (_msg) _d.alert(_msg.action, _msg.header, _msg.details);
    });
    return d.promise();
  }, handleChangeEmployee:function(a) {
    var c = this, b = 6E4 * mTimecard.getPayEnd().getTimezoneOffset(), d = new Date(mTimecard.getPayEnd().getTime() - b), f = $.Deferred();
    g.loadTimeCardData({EmployeeID:a, StartDate:d, Promise:f})
    .done(function(_aa,_cc) {
    	c.loadTimecardDef(_aa, _cc);
	})
	.fail(function(oError) {
	});
    return f;
  }, 
  handleReloadTimesheet: function() {
	    var c = this, b = 6E4 * mTimecard.getPayEnd().getTimezoneOffset(), f = $.Deferred();
	    g.loadTimeCardData({EmployeeID:mTempo.grid.EmployeeID, StartDate:mTempo.grid.payEndDate, Promise:f})
	    .done(function(_aa,_cc) {
	    	//g.refreshTimecard(_aa);
	    	c.loadTimecardDef(_aa, _cc);
		})
		.fail(function(oError) {
		});
	    return f;  
  },
  handleNavigateNextObject:function() {
    var a = this, c = 6E4 * mTimecard.getPayEnd().getTimezoneOffset();
    var b = $.Deferred(), d = mInstances.isValid() ? mInstances.getNext() : !1;
    
  // (d) ? (g.loadTimeCardData({EmployeeID:d.pernr, StartDate:new
	// Date(d.paydate.getTime() - c), Operation:'APPROVE', Promise:b})
    (d) ? (g.loadTimeCardData({EmployeeID:d.pernr, StartDate:d.paydate, Operation:'APPROVE', Promise:b})
        .done(function(_aa,_cc) {
        	g.appIsReviewMode() ? a.setTimeReviewData(_aa, _cc) : a.loadTimecardDef(_aa, _cc);
    	})) : (sap.ui.getCore().getEventBus().publish("tempoNav", "goBack"), b.reject());
    return b;
  }, _onLoadEETimesheet:function(a) {
    var c, b = this, d = null, f = new Date;
    a = a.getParameter("arguments");
    c = a["?query"];
    a && a.EmployeeID && (d = a.EmployeeID);
    if (c && c.keyDate) {
      try {
        f = new Date(c.keyDate);
      } catch (e) {
      }
    }
    var k = this.getView().setBusy(!0);
    
    g.loadTimeCardData({EmployeeID:d,StartDate:f})
    .done(function(a,c) {
    	b.loadTimecardDef(a, c);
    // sap.ui.Device.orientation.attachHandler(b.evOrientationTimeEntry, b);
    	k.setBusy(!1);
	})
    .fail(function(a,c) {
    	console.log("Failed to get InputHelpValues from service!");
 	   	k.setBusy(!1);
	});
  }, _onLoadMyTimesheet:function(a) {


    a = null;
    var self = this;
    var c = new Date("12/31/9999"), b = this, d = this.getView().setBusy(!0);
    var v = 'TimeEntry';  //default view
    var f = this.getOwnerComponent().getComponentData().startupParameters;
    if (f && f.mode) {
      try {
        switch(this.mode = f.mode[0], f.mode[0]) {
          case "APPROVE":
            g.appSetReviewMode(!0);
            this.getOwnerComponent().getRouter().navTo("approveTimesheet");
            return;
        }
      } catch (k) {
      }
    }
    
    // if (g._gC('$td')=='X')
	// this.getOwnerComponent().getRouter().navTo("_timesheet");

    if (f.employeeid) {
      a = f.employeeid;
      if (f.keydate) {
        try {
          c = new Date(f.keydate);
        } catch (k) {
          c = new Date;
        }
      }
      v = (f.view) || 'TimeEntry';
    }
    g.loadTimeCardData({EmployeeID:a,StartDate:c})
    .done(function(a,c) {
    	var _f = '_navigateTo'+v;
    	b.loadTimecardDef(a, c);
    	//g.refreshTimecard(a);
    	//b.setTimecardData(a, c);
    	(typeof b[_f] === 'function') ? b[_f]() : false;
    	//b.setTimecardData(a, c, v);
    	// sap.ui.Device.orientation.attachHandler(self.evOrientationTimeEntry,
		// self);
    	d.setBusy(!1);
	})
    .fail(function(a,c) {
    	console.log("Failed to get InputHelpValues from service!");
 	   	d.setBusy(!1);
	});
 
    /*
    this.getRouter().stop();
    this.m_strHref = window.location.href;
    
    $(window).off('hashchange').on('hashchange', function (e) {
        if (self.m_bSelfURLSetting) {
            self.m_bSelfURLSetting = false;
            setTimeout(function(handler) {
            	self.setTimecardData(mTimecard.get().oData);
  	  		},0, this); 
        
            return;
        }

        if (mTimecard.hasChanges()) {
            var leave = confirm('There are unsaved changes.\r\n\r\nDo you really want to leave the page?');
            if (!leave) {
                // re-set the URL
                self.m_bSelfURLSetting = true;
                window.location.href = self.m_strHref;
                
                //self._navigateToTimeEntry();
                //self.setTimecardData(mTimecard.get().oData);
              //  window.location.href = self.m_strHref;
            }
            else {
                self.getRouter().initialize(false); 
                //oModel.resetChanges();
            }
        } else {
            self.getRouter().initialize(false);
        }
    });
	*/

  }, _onApproveTimesheet:function(a) {
    var c = new Date, b = this, d = this.getView().setBusy(!0);
    if (a = mInstances.isValid() ? mInstances.getNext() : !1) {
      c = new Date(a.paydate);
    }

    g.loadTimeCardData({EmployeeID:a.pernr, StartDate:c, Operation:'APPROVE'})
    .done(function(a,c) {
        b.setTimeReviewData(a, c);
        // sap.ui.Device.orientation.attachHandler(b.evOrientationTimeReview,
		// b);
    	d.setBusy(!1);
	})
    .fail(function(a,c) {
 	   	d.setBusy(!1);
	});
  }, _onDisplayWeekView:function(a) {
    this.rerenderGrid(this, !0);
  }, resetStatusIcon:function(a) {
	(sap.ui.getCore().byId("hStatusI"))?  
    sap.ui.getCore().byId("hStatusI")
    .removeStyleClass("blueIcon")
    .removeStyleClass("greenIcon")
    .removeStyleClass("redIcon")
    .removeStyleClass("yellowIcon")
    .addStyleClass(mConfig.getStatusStyle(a)):false;
    
    (sap.ui.getCore().byId("hStatusT"))?
    sap.ui.getCore().byId("hStatusT")
    .removeStyleClass("blueIcon")
    .removeStyleClass("greenIcon")
    .removeStyleClass("redIcon")
    .removeStyleClass("yellowIcon")
    .addStyleClass(mConfig.getStatusStyle(a)):false;
    
  }, setTimecardButtons:function(a, c) {
    this.setFrameworkButtons(a, c);
  }, setTimeReviewButtons:function(a, c) {
    this.setFrameworkReviewButtons(a, c);
  }, setFrameworkButtons:function(a, c) {
    var b = this;
    b.toolBar instanceof sap.m.Bar || (b.toolBar = new sap.m.Bar);
    b.toolBar.removeAllContentRight();
    b.toolBar.removeAllContentLeft();
    b.toolBar.removeAllContentMiddle();
    
    var _evOnSave = {
    		onclick : function(oEvent) {
    			oEvent.srcControl.removeEventDelegate(_evOnSave);
    	    	b.getView().setBusy(!0);
    	          g.postTimeData({Operation:'SAVE'})
    	          .done(function(a,c) {
    	            b.loadTimecardDef(a, c);
    	            b.getView().setBusy(!1);    	  
    	          })
    	          .fail(function(a,c){
    	            b.getView().setBusy(!1);  
    	            oEvent.srcControl.addEventDelegate(_evOnSave);
    	         });   	
    		}
    	    };
    
    var _evOnPost = {
    		onclick : function(oEvent) {
    			oEvent.srcControl.removeEventDelegate(_evOnPost);
    	    	b.getView().setBusy(!0);
    	          g.postTimeData({Operation:'POST'})
    	          .done(function(a,c) {
    	            b.loadTimecardDef(a, c);
    	            b.getView().setBusy(!1);    	  
    	          })
    	          .fail(function(a,c){
    	            b.getView().setBusy(!1);  
    	            oEvent.srcControl.addEventDelegate(_evOnPost);
    	         });   	
    		}
    	    };
    
//    var _adjButton = new sap.m.Button({type:sap.m.ButtonType.Emphasized, enabled:"{timecard>/EnableTimesheetChanges}", text:"{i18n>btnCorrect}", press:function(a) {
//      b.requestAdjustTimesheet(b);
//    }});

    var _adjButton = new sap.m.Button({type:sap.m.ButtonType.Emphasized, enabled:"{timecard>/EnableTimesheetChanges}", text:"{i18n>btnCorrect}", press:function(a) {
    	(mTimecard.getAdjStatus()) ? b.requestAdjustTimesheet(b): g.showSimpleMessage('I',mTimecard.getAdjStatusText());
      }});
    
    var _tbarClass = (_ui.isCompact()) ? "OverflowToolbar" : "Toolbar";
    
    1 == c && 0 == a ? b.toolBar.addContentRight(_adjButton) : (b.toolBar.addContentRight(new sap.m.Button({type:sap.m.ButtonType.Emphasized, text:"{i18n>btnSave}", visible: "{app>/btnSaveVisible}", enabled:"{timecard>/EnableTimesheetChanges}"})
    .addEventDelegate(_evOnSave)
    ), b.toolBar.addContentRight(new sap.m.Button({type:sap.m.ButtonType.Emphasized, text:"{i18n>btnPost}", visible: "{app>/btnSaveVisible}", enabled:"{timecard>/EnableTimesheetChanges}"})
    .addEventDelegate(_evOnPost)
    ));
    
//	if (b.mode != 'APPROVE') {

		b.toolBar
				.addContentLeft(new sap.m[_tbarClass]({
					design : sap.m.ToolbarDesign.Auto,
					content : [
							new sap.m.Button({
								// type :
								// sap.m.ButtonType.Emphasized,
								icon : "sap-icon://time-entry-request",
								tooltip: "{i18n>ttDispEnterTime}",
								//text : "Enter Time",
								// "{app>/messageLength}",
								visible : true,
								press : function(oEvent) {
									b._navigateToTimeEntry();
								}
							}),
							//.addStyleClass("sapUiSizeCozy"),
							new sap.m.Button({
								// type :
								// sap.m.ButtonType.Emphasized,
								icon : "sap-icon://detail-view",
								tooltip: "{i18n>ttDispDetails}",
								//text : "Timesheet Details",
								// "{app>/messageLength}",
								visible : "{timecard>/DisplayDetails}",
								press : function(oEvent) {
									b._navigateToDetail();
								}
							}),
							//.addStyleClass("sapUiSizeCozy"),
							new sap.m.Button({
								// type :
								// sap.m.ButtonType.Emphasized,
								icon : "sap-icon://fob-watch",
								tooltip: "{i18n>ttDispFob}",
								//text : "Timesheet Details",
								// "{app>/messageLength}",
								visible : "{timecard>/ShowTimeclock}",
								press : function(oEvent) {
									if (sap.ui
											.getCore()
											.byId("time_stamp")) {
									} else {
										if(mTimecard.get().oData.EnableTimesheetChanges) {
											if(mTimecard.hasChanges()) {
												sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
												     title: "{i18n>btnLeaveTS}",
												     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
													//	styleClass: bCompact ? "sapUiSizeCompact" : "",
															onClose: function(oAction) {
																if (oAction === sap.m.MessageBox.Action.YES) {
																	b._navigateToTimeStamps();
																}
															}
													}
												);															
											} else {
												b._navigateToTimeStamps();
											}
											
										}


									}
								}
							}).addStyleClass("sapUiSizeCozy"),
							new sap.m.Button({
								// type :
								// sap.m.ButtonType.Emphasized,
								icon : "sap-icon://fob-watch",
								tooltip: "{i18n>ttDispFob}",
								//text : "Timesheet Details",
								// "{app>/messageLength}",
								visible : "{timecard>/ShowDerco}",
								press : function(oEvent) {
									if (sap.ui
											.getCore()
											.byId("time_stamp")) {
									} else {
										if(mTimecard.get().oData.EnableTimesheetChanges) {
											if(mTimecard.hasChanges()) {
												sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
												     title: "{i18n>btnLeaveTS}",
												     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
													//	styleClass: bCompact ? "sapUiSizeCompact" : "",
															onClose: function(oAction) {
																if (oAction === sap.m.MessageBox.Action.YES) {
																	b._navigateToDercoStamps();
																}
															}
													}
												);															
											} else {
												b._navigateToDercoStamps();
											}
											
										}


									}
								}
							}).addStyleClass("sapUiSizeCozy"),
							new sap.m.Button({
								icon : "sap-icon://meal",
								type : {
									path : "timecard>/CWBErrors",
									formatter : function(d) {
										return (d) ? "Reject" : 'Transparent';
									}
								},											
								tooltip: "CA work Breaks",
								visible : "{timecard>/CWB}",
								press : function(oEvent) {
									if (sap.ui
											.getCore()
											.byId("cwb")) {
									} else {
										if(mTimecard.get().oData.EnableTimesheetChanges) {
											if(mTimecard.hasChanges()) {
												sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
												     title: "{i18n>btnLeaveTS}",
												     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
													//	styleClass: bCompact ? "sapUiSizeCompact" : "",
															onClose: function(oAction) {
																if (oAction === sap.m.MessageBox.Action.YES) {
																	b._navigateToCWB();
																}
															}
													}
												);															
											} else {
												b._navigateToCWB();
											}
											
										}


									}
								}
							}).addStyleClass("sapUiSizeCozy"),
							
							new sap.m.Button({
								icon : "sap-icon://meal",
								tooltip: "CO work Breaks",
								type : {
									path : "timecard>/COWBErrors",
									formatter : function(d) {
										return (d) ? "Reject" : 'Transparent';
									}
								},											
								visible : "{timecard>/COWB}",
								press : function(oEvent) {
									if (sap.ui
											.getCore()
											.byId("cowb")) {
									} else {
										if(mTimecard.get().oData.EnableTimesheetChanges) {
											if(mTimecard.hasChanges()) {
												sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
												     title: "{i18n>btnLeaveTS}",
												     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
													//	styleClass: bCompact ? "sapUiSizeCompact" : "",
															onClose: function(oAction) {
																if (oAction === sap.m.MessageBox.Action.YES) {
																	b._navigateToCOWB();
																}
															}
													}
												);															
											} else {
												b._navigateToCOWB();
											}
											
										}


									}
								}
							}).addStyleClass("sapUiSizeCozy"),


							
]
				}));
    
  }, 
  _navigateToDetail: function(){
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
			} else if (sap.ui
					.getCore()
					.byId("time_stamp")) {
				sap.ui
						.getCore()
						.byId("time_stamp")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("derco_stamp")) {
				sap.ui
						.getCore()
						.byId("derco_stamp")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("cwb")) {
				sap.ui
						.getCore()
						.byId("cwb")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("cowb")) {
				sap.ui
						.getCore()
						.byId("cowb")
						.destroy();											
			}
			this.tcControl
					.destroyContent();
			this.tcControl
					.addContent(new sap.ui.core.mvc.JSView("time_details", {
						viewName : "z_tpo_timecard.view.timesheetDetails"
					}));
			sap.ui
					.getCore()
					.getEventBus()
					.publish("framework", "renderDetails");

		}  
  },
  _navigateToTimeEntry: function(){
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
			} else if (sap.ui
					.getCore()
					.byId("time_stamp")) {
				sap.ui
						.getCore()
						.byId("time_stamp")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("derco_stamp")) {
				sap.ui
						.getCore()
						.byId("derco_stamp")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("cwb")) {
				sap.ui
						.getCore()
						.byId("cwb")
						.destroy();											
			} else if (sap.ui
					.getCore()
					.byId("cowb")) {
				sap.ui
						.getCore()
						.byId("cowb")
						.destroy();											
			}
			this.tcControl
					.destroyContent();
			(!0 === _ui.isCompact()) ? this.tcControl
					.addContent(new sap.ui.core.mvc.JSView("time_weekview", {
						viewName : "z_tpo_timecard.view.mobile.timesheet"
					})) : this.tcControl
					.addContent(new sap.ui.core.mvc.JSView("time_weekview", {
						viewName : "z_tpo_timecard.view.timesheet"
					}));	
			
			sap.ui
					.getCore()
					.getEventBus()
					.publish("framework", "renderTimesheet");
			// sap.ui.getCore().byId("time_weekview").getController().renderTimeGrid(_self.getOwnerComponent());
		}
  
  },
  _navigateToTimeStamps: function(){
		if (sap.ui
				.getCore()
				.byId("time_weekview")) {
			sap.ui
					.getCore()
					.byId("time_weekview")
					.destroy();
		} else if (sap.ui
				.getCore()
				.byId("time_details")) {
			sap.ui
					.getCore()
					.byId("time_details")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("derco_stamp")) {
			sap.ui
					.getCore()
					.byId("derco_stamp")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("cwb")) {
			sap.ui
					.getCore()
					.byId("cwb")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("cowb")) {
			sap.ui
					.getCore()
					.byId("cowb")
					.destroy();											
		}		
		this.tcControl
				.destroyContent();
		this.tcControl
				.addContent(new sap.ui.core.mvc.JSView("time_stamp", {
					viewName : "z_tpo_timecard.view.timesheetStamps"
				}));
		sap.ui
				.getCore()
				.getEventBus()
				.publish("framework", "renderStamps");
	  
  },
  _navigateToDercoStamps: function(){
		if (sap.ui
				.getCore()
				.byId("time_weekview")) {
			sap.ui
					.getCore()
					.byId("time_weekview")
					.destroy();
		} else if (sap.ui
				.getCore()
				.byId("time_details")) {
			sap.ui
					.getCore()
					.byId("time_details")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("time_stamp")) {
			sap.ui
					.getCore()
					.byId("time_stamp")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("cwb")) {
			sap.ui
					.getCore()
					.byId("cwb")
					.destroy();											
		} else if (sap.ui
				.getCore()
				.byId("cowb")) {
			sap.ui
					.getCore()
					.byId("cowb")
					.destroy();											
		}
		this.tcControl
				.destroyContent();
		this.tcControl
				.addContent(new sap.ui.core.mvc.JSView("derco_stamp", {
					viewName : "z_tpo_timecard.view.timesheetDerco"
				}));
		sap.ui
				.getCore()
				.getEventBus()
				.publish("framework", "renderDerco");
	  
},
_navigateToCWB: function(){
	if (sap.ui
			.getCore()
			.byId("time_weekview")) {
		sap.ui
				.getCore()
				.byId("time_weekview")
				.destroy();
	} else if (sap.ui
			.getCore()
			.byId("time_details")) {
		sap.ui
				.getCore()
				.byId("time_details")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("time_stamp")) {
		sap.ui
				.getCore()
				.byId("time_stamp")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("derco_stamp")) {
		sap.ui
				.getCore()
				.byId("derco_stamp")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("cowb")) {
		sap.ui
				.getCore()
				.byId("cowb")
				.destroy();											
	}
	this.tcControl
			.destroyContent();
	this.tcControl
			.addContent(new sap.ui.core.mvc.JSView("cwb", {
				viewName : "z_tpo_timecard.view.timesheetCWB"
			}));
	sap.ui
			.getCore()
			.getEventBus()
			.publish("framework", "renderCWB");
  
},

_navigateToCOWB: function(){
	if (sap.ui
			.getCore()
			.byId("time_weekview")) {
		sap.ui
				.getCore()
				.byId("time_weekview")
				.destroy();
	} else if (sap.ui
			.getCore()
			.byId("time_details")) {
		sap.ui
				.getCore()
				.byId("time_details")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("time_stamp")) {
		sap.ui
				.getCore()
				.byId("time_stamp")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("derco_stamp")) {
		sap.ui
				.getCore()
				.byId("derco_stamp")
				.destroy();											
	} else if (sap.ui
			.getCore()
			.byId("cwb")) {
		sap.ui
				.getCore()
				.byId("cwb")
				.destroy();											
	}
	this.tcControl
			.destroyContent();
	this.tcControl
			.addContent(new sap.ui.core.mvc.JSView("cowb", {
				viewName : "z_tpo_timecard.view.timesheetCOWB"
			}));
	sap.ui
			.getCore()
			.getEventBus()
			.publish("framework", "renderCOWB");
  
},

setFrameworkReviewButtons:function(a, c) {
    var b = this;
    
    var _evOnApprove = {
    		onclick : function(oEvent) {
    			oEvent.srcControl.removeEventDelegate(_evOnApprove);
    	        b.getView().setBusy(!0);
    	        g.postTimeData({Operation:'APPROVE'})
    	        .done(function(a,c) {
    	        	var _msgDuration = 1000;
    	          b.getView().setBusy(!1);
    	          g.showSimpleMessage('S',g.getResourceText("fMsg5"), '', _msgDuration);
    	          setTimeout(function(handler) {
    	          	sap.ui.getCore().getEventBus().publish("tempoNav", "nextObject");
    	  		}, _msgDuration, this); 
    	        })
    	        .fail(function(a,c){
    	          b.getView().setBusy(!1);
    	          oEvent.srcControl.addEventDelegate(_evOnApprove);
    	          g.showErrorMessagesInPopup();
    	        });
    		}
    };

    var _evOnReject = {
    		onclick : function(oEvent) {
    			oEvent.srcControl.removeEventDelegate(_evOnReject);
    	        b.rejectDialog.Control || (b.rejectDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.rejectionDialog", b));
    	        _d.openDialog(b.rejectDialog);
	            oEvent.srcControl.addEventDelegate(_evOnReject);
    		}
    };

    var _evOnBypass = {
    		onclick : function(oEvent) {
    			oEvent.srcControl.removeEventDelegate(_evOnBypass);
   		      	b.bypassTimeCard(b);
    		}
    };

    var _tbarClass = (_ui.isCompact()) ? "OverflowToolbar" : "Toolbar";

    b.toolBar instanceof sap.m.Bar || (b.toolBar = new sap.m.Bar);
    b.toolBar.removeAllContentRight();
    b.toolBar.removeAllContentLeft();
    b.toolBar.removeAllContentMiddle();
    
	b.toolBar
	.addContentLeft(new sap.m[_tbarClass]({
		design : sap.m.ToolbarDesign.Auto,
		content : [
				new sap.m.Button({
					// type :
					// sap.m.ButtonType.Emphasized,
					icon : "sap-icon://time-entry-request",
					tooltip: "{i18n>ttDispEnterTime}",
					//text : "Enter Time",
					// "{app>/messageLength}",
					visible : true,
					press : function(oEvent) {
						b._navigateToTimeEntry();
					}
				}).addStyleClass("sapUiSizeCozy"),
				new sap.m.Button({
					// type :
					// sap.m.ButtonType.Emphasized,
					icon : "sap-icon://detail-view",
					tooltip: "{i18n>ttDispDetails}",
					//text : "Timesheet Details",
					// "{app>/messageLength}",
					visible : "{timecard>/DisplayDetails}",
					press : function(oEvent) {
						b._navigateToDetail();
					}
				}).addStyleClass("sapUiSizeCozy"),
				new sap.m.Button({
					// type :
					// sap.m.ButtonType.Emphasized,
					icon : "sap-icon://fob-watch",
					tooltip: "{i18n>ttDispFob}",
					//text : "Timesheet Details",
					// "{app>/messageLength}",
					visible : "{timecard>/ShowTimeclock}",
					press : function(oEvent) {
						if (sap.ui
								.getCore()
								.byId("time_stamp")) {
						} else {
							if(mTimecard.get().oData.EnableTimesheetChanges) {
								if(mTimecard.hasChanges()) {
									sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
									     title: "{i18n>btnLeaveTS}",
									     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
										//	styleClass: bCompact ? "sapUiSizeCompact" : "",
												onClose: function(oAction) {
													if (oAction === sap.m.MessageBox.Action.YES) {
														b._navigateToTimeStamps();
													}
												}
										}
									);															
								} else {
									b._navigateToTimeStamps();
								}
								
							}


						}
					}
				}).addStyleClass("sapUiSizeCozy"),
				new sap.m.Button({
					// type :
					// sap.m.ButtonType.Emphasized,
					icon : "sap-icon://fob-watch",
					tooltip: "{i18n>ttDispFob}",
					//text : "Timesheet Details",
					// "{app>/messageLength}",
					visible : "{timecard>/ShowDerco}",
					press : function(oEvent) {
						if (sap.ui
								.getCore()
								.byId("time_stamp")) {
						} else {
							if(mTimecard.get().oData.EnableTimesheetChanges) {
								if(mTimecard.hasChanges()) {
									sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
									     title: "{i18n>btnLeaveTS}",
									     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
										//	styleClass: bCompact ? "sapUiSizeCompact" : "",
												onClose: function(oAction) {
													if (oAction === sap.m.MessageBox.Action.YES) {
														b._navigateToDercoStamps();
													}
												}
										}
									);															
								} else {
									b._navigateToDercoStamps();
								}
								
							}


						}
					}
				}).addStyleClass("sapUiSizeCozy"),
//				new sap.ui.core.Icon({
//					src : "sap-icon://meal",
//					backgroundColor : {
//						path : "timecard>/CWBErrors",
//						formatter : function(d) {
//							return (d) ? "red" : 'transparent';
//						}
//					},						
//					visible: "{timecard>/CWB}",
//					press : function(oEvent) {
//						if (sap.ui
//								.getCore()
//								.byId("cwb")) {
//						} else {
//							if(mTimecard.get().oData.EnableTimesheetChanges) {
//								if(mTimecard.hasChanges()) {
//									sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
//									     title: "{i18n>btnLeaveTS}",
//									     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
//										//	styleClass: bCompact ? "sapUiSizeCompact" : "",
//												onClose: function(oAction) {
//													if (oAction === sap.m.MessageBox.Action.YES) {
//														b._navigateToCWB();
//													}
//												}
//										}
//									);															
//								} else {
//									b._navigateToCWB();
//								}
//								
//							}
//
//
//						}
//					}				
//				})				
				new sap.m.Button({
					icon : "sap-icon://meal",
					tooltip: "CA work Breaks",
					type : {
						path : "timecard>/CWBErrors",
						formatter : function(d) {
							return (d) ? "Reject" : 'Transparent';
						}
					},											
					visible : "{timecard>/CWB}",
					press : function(oEvent) {
						if (sap.ui
								.getCore()
								.byId("cwb")) {
						} else {
							if(mTimecard.get().oData.EnableTimesheetChanges) {
								if(mTimecard.hasChanges()) {
									sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
									     title: "{i18n>btnLeaveTS}",
									     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
										//	styleClass: bCompact ? "sapUiSizeCompact" : "",
												onClose: function(oAction) {
													if (oAction === sap.m.MessageBox.Action.YES) {
														b._navigateToCWB();
													}
												}
										}
									);															
								} else {
									b._navigateToCWB();
								}
								
							}


						}
					}
				}).addStyleClass("sapUiSizeCozy"),
				
				new sap.m.Button({
					icon : "sap-icon://meal",
					tooltip: "CO work Breaks",
					type : {
						path : "timecard>/COWBErrors",
						formatter : function(d) {
							return (d) ? "Reject" : 'Transparent';
						}
					},											
					visible : "{timecard>/COWB}",
					press : function(oEvent) {
						if (sap.ui
								.getCore()
								.byId("cwb")) {
						} else {
							if(mTimecard.get().oData.EnableTimesheetChanges) {
								if(mTimecard.hasChanges()) {
									sap.m.MessageBox.confirm(g.getResourceText("prTSSave"), {
									     title: "{i18n>btnLeaveTS}",
									     actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
										//	styleClass: bCompact ? "sapUiSizeCompact" : "",
												onClose: function(oAction) {
													if (oAction === sap.m.MessageBox.Action.YES) {
														b._navigateToCOWB();
													}
												}
										}
									);															
								} else {
									b._navigateToCOWB();
								}
								
							}


						}
					}
				}).addStyleClass("sapUiSizeCozy"),

				
]
	}));
    
    b.toolBar.addContentRight(new sap.m.Button({type:sap.m.ButtonType.Accept, text:g.getResourceText("btnApprove")})
    	.addEventDelegate(_evOnApprove)
    );
    b.toolBar.addContentRight(new sap.m.Button({type:sap.m.ButtonType.Reject, text:g.getResourceText("btnReject")})
		.addEventDelegate(_evOnReject)
    );
    b.toolBar.addContentRight(new sap.m.Button({type:sap.m.ButtonType.Emphasized, text:g.getResourceText("btnBypass")})
    	.addEventDelegate(_evOnBypass)
    );
  }, onSelectEmployee:function(a) {
    var c = this;
    c.getView().setBusy(!0);
    $.when(c.handleChangeEmployee(a.getParameter("selectedItem").getProperty("title"))).then(function(a) {
      c.getView().setBusy(!1);
    });
	// g.setResize(!0);
    _d.destroyDialog(this.employeeDialog);
    // $(window).resize(function(){sap.ui.getCore().getEventBus().publish("framework",
	// "resizeGrid");});
;
  }, 
  rerenderGrid:function(a, c) {
	  //INC2713990 - uncomment setTimeGrid
    a.setTimeGrid();
    mTimecard.refreshModel(c);
    sap.ui.getCore().getEventBus().publish("framework", "refreshChild");
    a.setTimecardButtons(mTempo.isEditable(), mTimecard.isComplete());
  }, rerenderGridReview:function(a, c) {
    a.setTimeReviewGrid();
    mTimecard.refreshModel(c);
    sap.ui.getCore().getEventBus().publish("framework", "refreshChild");
    a.setTimeReviewButtons(mTempo.isEditable(), mTimecard.isComplete());
  }, switchEmployee:function(a) {
    sap.ui.getCore().getEventBus().publish("tempoNav", "switchUser");
  }, handleTimesheetAdjustment:function(a, c, b) {
    $.when(this.validateTimesheetAdjustment(a, c, b)).then(function(a) {
      sap.ui.getCore().getEventBus().publish("framework", "refreshChild");
    });
	// g.setResize(!0);
    _d.destroyDialog(this.adjustDialog);
  }, validateTimesheetAdjustment:function(a, c, b) {
	mTempo.validateAdjustment({ 
			AdjustmentReasonCode:_d.normalize(c), 
			AdjustmentReasonText:_d.normalize(b), 
			startDate: _d.getLocalDate(mTimecard.getPayEnd())
	})  
    // g.tempoValidateAdjustment({AdjustmentReasonCode:c,
	// AdjustmentReasonText:b})
    .done(function(oData, oResponse){
    	mTempo.setEditable(!0);
    	mTimecard.setAdjustment({Code:c, Text:b, Editable: !0, data:oData});
    	a.rerenderGrid(a, !0);
    })
    .fail(function(oError,oResponse){
    	g.showErrorMessagesInPopup();
    });
  }, onPayendDateChange:function(a) {
    try {
    	d = new Date(a.getParameter("value"));
      } catch (f) {
        return;
      }
    var c = a.oSource;
    var _self = c.getParent().getParent().getParent().getController();
      a.getParameter("valid") ? (a.oSource.setValueState(sap.ui.core.ValueState.None), c.setBusy(!0), $.when(_self.handlePayEndDateChange(_d.getUTCDate(d))).then(function(a) {
    	c.setBusy(!1);
    },function(a) {
      if (d===mTempo.getPayendDate().toISOString().substring(0,10)) {
    	  // get earliest periiod
      }	else {
          c.setValue(mTempo.getPayendDate().formatUS());
          c.setBusy(!1);    	  
      }
    })) : a.oSource.setValueState(sap.ui.core.ValueState.Error);
  }, 
  setTimecardData:function(a, c) {
    this.rerenderGrid(this, !0);
    this.resetStatusIcon(a.Status);
    (mTimecard.hasMessages()) ? g.displayMessage() : false;
    //g.displayMessage("R");
// sap.ui.Device.orientation.attachHandler(this.evOrientationTimeEntry, this);
    
  }, 
  evOrientationChange: function(oEvent){
  	(!0 === _app.isReview()) ? this.evOrientationTimeReview(oEvent) : this.evOrientationTimeEntry(oEvent);	
  },
  evOrientationTimeReview:function(oEvent){
	  if(_app.isReview())
	  this.rerenderGridReview(this, true);
  },
  evOrientationTimeEntry:function(oEvent){
	  if(!_app.isReview())
	  this.rerenderGrid(this, true);
  },
  setTimeReviewData:function(a, c) {
    g.refreshTimecard(a);
    this.rerenderGridReview(this, !0);
    this.resetStatusIcon(a.Status);
    (mTimecard.hasMessages()) ? g.displayMessage() : false;

// sap.ui.Device.orientation.attachHandler(this.evOrientationTimeReview, this);
  }, onCalDateSelectCancel:function(a) {
	// g.setResize(!0);
	this.dateSelectDialog.Control.close();
    //_d.destroyDialog(this.dateSelectDialog);
  }, onSelectEmployeeCancel:function(a) {
	  var c=this;
    _d.destroyDialog(this.employeeDialog);
   // g.setResize(!0);
    // $(window).resize(function(){sap.ui.getCore().getEventBus().publish("framework",
	// "resizeGrid");});
  }, 
  setTimeGridDefault:function() {
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
					viewName : "z_tpo_timecard.view.timesheet"
			}));			
  },	  
  setTimeGrid:function() {
    this.setTimeGridDefault();
  }, 
  setTimeReviewGrid:function() {
	this.setTimeReviewGridDefault();  
  },
  
  setTimeReviewGridDefault:function() {
    this.tcControl instanceof sap.m.ScrollContainer || (this.tcControl = new sap.m.ScrollContainer);
    sap.ui.getCore().byId("time_weekview") && sap.ui.getCore().byId("time_weekview").destroy();
    this.tcControl.destroyContent();
    this.tcControl.addContent(new sap.ui.core.mvc.JSView("time_weekview", {viewName:"z_tpo_timecard.view.timesheet"}));
    this.setReviewSubtitleContent(this.page.getSubHeader());
  }, requestAdjustTimesheet:function(a) {
    this.adjustDialog.Control || (this.adjustDialog.Control = sap.ui.jsfragment("z_tpo_timecard.fragment.selectAdjReason", this));
    // g.setResize(!1);
    _d.openDialog(this.adjustDialog);
    // this.adjustDialog.Control.open();
  }, onCloseAdjustDialog:function() {
	 // g.setResize(!0);
    _d.destroyDialog(this.adjustDialog);
  }, bypassTimeCard:function(a) {
    sap.ui.getCore().getEventBus().publish("tempoNav", "nextObject");
  }, onRejectTimesheet:function(a) {
    var c = this, b = a.srcControl.getModel('dialog').oData;
    g.postTimeData({Operation:'REJECT', Form:b})
    .done(function(_aa, _cc) {
    	c.handleRejectSuccess(b, _cc);
    })
    .fail(function(_aa, _cc){
    	g.showErrorMessagesInPopup();
    });
  }, onCancelReject:function(a) {
		// g.setResize(!0);
    _d.destroyDialog(this.rejectDialog);
  }, handleRejectSuccess:function(a, c) {
    var b = this, d = a.EmailBody + "\n\n" + a.ApproverText, d = {EmpId:a.EmpId, ToEmail:a.ToEmail, EmailSubject:a.EmailSubject, FromEmail:a.FromEmail, CcEmail:a.CcEmail, EmailBody:d};
    mTempo.sendEmail({EmployeeID: a.EmpId, Message:d } )
    // g.sendEmail({EmployeeID:a.EmpId, Message:d})
    .done(function(_aa, _cc) {
        g.showSimpleMessage('S',g.getResourceText("fMsg6"), 1000);
        setTimeout(function(handler) {
        	// g.setResize(!0);
        	_d.destroyDialog(b.rejectDialog);
            sap.ui.getCore().getEventBus().publish("tempoNav", "nextObject");
		}, 1000, this);   // 3000 is the default duration for the message
    })
    .fail(function(_aa, _cc){
        g.showErrorMessagesInPopup();
    });
  },
  isDeviceModeSupported : function() {	
	  return mConfig.getAvailability(_ui.getUISystemType(), _ui.mobileOrientationMode());
	  // return g.isDeviceModeSupported();
  },
  
  setReviewSubtitleContent : function(control) {
	  this.taPanel.setVisible(false);
		control.removeAllContentMiddle();
		control.addContentMiddle(this.getApprovalInfo());
  },
  loadTimecardDef: function (a,c){
	g.refreshTimecard(a);
    this.setTimecardData(a,c);
  },
  getApprovalInfo : function() {
	  return new sap.ui.layout.VerticalLayout({
										width : "100%",
										// height : "100%",
										content : [
										           new sap.m.HBox({
										        	   //class: "sapUiContentPadding",
										        	   visible : {
															path : "timecard>/",
															formatter : function(a) {
																if (a) {
																	var b = ((a.ApprovalMode || !1) && !_ui.isCompact());
																	return 0 < (a.TimesheetDetails ? a.TimesheetDetails.ReasonCodeText
																			|| ""
																			: "").length
																			&& b
																}
																return !1
															}
														},
										        	   items : [
										        	              new sap.m.Label({
										        	            	  design : "Bold",
										        	            	  text : "{i18n>hAdjReasonTxt}"
										        	              }),
										        	              new sap.m.Text({
										        	            	  text : "{timecard>/TimesheetDetails/ReasonCodeText}"
										        	              }),
										        	              new sap.m.Text({
										        	            	  text : " / {timecard>/TimesheetDetails/GenericInfo}",
										        	            	  visible : {
																			path : "timecard>/",
																			formatter : function(a) {
																				if (a) {
																					var b = (a.ApprovalMode || !1);
																					return 0 < (a.TimesheetDetails ? a.TimesheetDetails.GenericInfo
																							|| ""
																							: "").length
																							&& b
																				}
																				return !1
																			}
																		}
										        	              }),
										        	              
										        	              ]
										           }),
		]
	  })
  },
  describeState: function() {
	  g.showSimpleMessage('I',mTimecard.getAdjStatusText());
  }
// resizeHandler: function(handler) {
// clearTimeout(handler._resizeTimeout);
// handler._resizeTimeout = setTimeout(function(hh){
// hh.rerenderGrid(hh, true);
// }, 500, handler);
//
// }
  });
});