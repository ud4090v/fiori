sap.ui
		.define([ 
			"sap/ui/core/mvc/Controller", 
			'tpoUtils/common/base', 
			"z_tpo_timecard/tempo.utils", 
			"z_tpo_timecard/model/model-texts", 
			"z_tpo_timecard/model/model-timecard", 
			"z_tpo_timecard/model/model-tempo", 
			], 
			function(f, _d, b, mTexts,mTimecard, mTempo) {
			return f
					.extend("z_tpo_timecard.controller.common.timesheet", {
						searchDialog : {
							Type : null,
							NoCommit: false,
							CID : null,
							Data : {
								Title : "{i18n>tiSelCI}"
							},
							Model : null,
							Control : null
						},
						getModel : function(a) {
							return this.getView().getModel(a)
						},
						setModel : function(a, b) {
							return this.getView().setModel(a, b)
						},
						getResourceText : function(tt) {
							return mTexts.get().getResourceBundle().getText(tt);
						},
					//	onExit : function(a) {
					//		this.exitFramework(a)
					//	},
						exitFramework : function(a) {
							sap.ui
									.getCore()
									.getEventBus()
									.unsubscribe("tempoGrid", "changeLine", this.evOnChangeLine, this);
							sap.ui
									.getCore()
									.getEventBus()
									.unsubscribe("tempoGrid", "deleteLine", this.evOnDeleteLine, this);
							sap.ui
									.getCore()
									.getEventBus()
									.unsubscribe("tempoGrid", "triggerFavorite", this.evOnTriggerFavorite, this)
						},
						initTimegrid : function() {
							//b.injectToggleStylesFromConfig();
							//this.getView().addStyleClass("sapUiSizeCompact");
							sap.ui
									.getCore()
									.getEventBus()
									.subscribe("tempoGrid", "changeLine", this.evOnChangeLine, this);
							sap.ui
									.getCore()
									.getEventBus()
									.subscribe("tempoGrid", "deleteLine", this.evOnDeleteLine, this);
							sap.ui
									.getCore()
									.getEventBus()
									.subscribe("tempoGrid", "triggerFavorite", this.evOnTriggerFavorite, this)
						},
						evOnChangeLine : function(a, b, c) {
							this.changeLineDialog(c)
						},
						evOnDeleteLine : function(a, b, c) {
							this.deleteTask(c);
						},
						evOnTriggerFavorite : function(a, b, c) {
							this.triggerFavorite(c);
						},
						setSearchList : function(a, handler) {
							var e = a.mParameters.list;
							a.oSource.setTitle(this.getResourceText(e));
							var c = "history" == e ? mTimecard.getPayEnd() : mTempo.getStartDate();
							handler.searchDialog.Type = e;
							a.oSource
									.getBinding("items")
									.filter([
											new sap.ui.model.Filter("UserID", sap.ui.model.FilterOperator.EQ, mTempo.getEID()),
											new sap.ui.model.Filter("ChargeCodeType", sap.ui.model.FilterOperator.EQ, e),
											new sap.ui.model.Filter("KeyDate", sap.ui.model.FilterOperator.EQ, c) ])
						},
						setSearchMode : function(oSrc, a, handler) {
							var e = a || 'favorites';
							oSrc.setTitle(this.getResourceText(e));
							var c = "history" == e ? mTimecard.getPayEnd() : mTempo.getStartDate();
							handler.searchDialog.Type = e;
							oSrc.getBinding("items")
									.filter([
											new sap.ui.model.Filter("UserID", sap.ui.model.FilterOperator.EQ, mTempo.getEID()),
											new sap.ui.model.Filter("ChargeCodeType", sap.ui.model.FilterOperator.EQ, e),
											new sap.ui.model.Filter("KeyDate", sap.ui.model.FilterOperator.EQ, c) ])
						},
						
						changeTask : function(a) {
							$
									.when(b.tempoChangeTask(a.mParameters.selectedItem, this.searchDialog.CID))
									.then(function(a) {
										sap.ui
												.getCore()
												.getEventBus()
												.publish("tempoNav", "gridRefreshed")
									});
							_d.destroyDialog(this.searchDialog, this.searchDialog.NoCommit);
						},
						addLineBlank : function(a) {
							$
									.when(b.tempoAddTask())
									.then(function(a) {
										sap.ui
												.getCore()
												.getEventBus()
												.publish("tempoNav", "gridRefreshed", { 'row' : mTimecard.get().oData.TimesheetRecords.length-1 } )
									})
						},
						addNewTask : function(a) {
							$
									.when(b.tempoAddTask(a.mParameters.selectedItem))
									.then(function(a) {
										sap.ui
												.getCore()
												.getEventBus()
												.publish("tempoNav", "gridRefreshed")
									});
							_d.destroyDialog(this.searchDialog, this.searchDialog.NoCommit);
						},
						addLineDialog : function(a) {
							this.searchDialog.Control
									|| (this.searchDialog.Control = sap.ui
											.jsfragment("z_tpo_timecard.fragment.addLine", this));
							this.searchDialog.Type = "favorites";
							this.searchDialog.NoCommit = !1;
							this.searchDialog.Data = {
								Title : this.getResourceText(this.searchDialog.Type)
							};
							this.searchDialog.Control
									.getBinding("items")
									.filter([
											new sap.ui.model.Filter("UserID", sap.ui.model.FilterOperator.EQ, mTempo.getEID()),
											new sap.ui.model.Filter("ChargeCodeType", sap.ui.model.FilterOperator.EQ, this.searchDialog.Type),
											new sap.ui.model.Filter("KeyDate", sap.ui.model.FilterOperator.EQ, mTempo.getStartDate()) ]);
							this.searchDialog.Control.setTitle(this.searchDialog.Data.Title);
							_d.openDialog(this.searchDialog, this.searchDialog.NoCommit);
						},
						deleteTask : function(a) {
							a = a.getBindingContext("timecard").getObject();
							b.tempoDeleteRow(a)
							.done(function() {
								sap.ui.getCore().getEventBus().publish("tempoNav", "gridRefreshed")
							});
						},
						triggerFavorite : function(a) {
							var _item = a.getBindingContext("timecard").getProperty("");
							b.tempoHandleFavorites(_item)
							.fail(function(oError) {
								var _error = JSON.parse(oError.responseText).error.innererror.errordetails[0];
								b.showSimpleMessage(_error.severity, _error.message);
							})
						},
						cancelSearch : function(a) {
							_d.destroyDialog(this.searchDialog, this.searchDialog.NoCommit);
						},
						changeLineDialog : function(a) {
							this.searchDialog.Control
									|| (this.searchDialog.Control = sap.ui
											.jsfragment("z_tpo_timecard.fragment.changeLine", this));
							this.searchDialog.CID = a.getBindingContext("timecard").getObject().CID;
							this.searchDialog.Type = "favorites";
							this.searchDialog.NoCommit = !1;
							this.searchDialog.Data = {
								Title : this.getResourceText(this.searchDialog.Type)
							};
							this.searchDialog.Control
									.getBinding("items")
									.filter([
											new sap.ui.model.Filter("UserID", sap.ui.model.FilterOperator.EQ, mTempo.getEID()),
											new sap.ui.model.Filter("ChargeCodeType", sap.ui.model.FilterOperator.EQ, this.searchDialog.Type),
											new sap.ui.model.Filter("KeyDate", sap.ui.model.FilterOperator.EQ, mTempo.getStartDate()) ]);
							this.searchDialog.Control.setTitle(this.searchDialog.Data.Title);
							_d.openDialog(this.searchDialog, this.searchDialog.NoCommit);
						},
						doAfterRendering : function() {
						},

					})
		});