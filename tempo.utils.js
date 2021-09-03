jQuery.sap.declare("z_tpo_timecard.tempo.utils");
sap.ui.define([
	"tpoUtils/common/base",
	"z_tpo_timecard/model/models", 
	"tpoUtils/common/ui"
	], function(_d, modelController, _ui) {
  return {
  clearEvent:function(a, b) {
	  return _d.clearEvent(a,b);
    //sap.ui.getCore().getEventBus()._mChannels[a] && _channel[a].mEventRegistry && _channel[a].mEventRegistry[b] && (_channel[a].mEventRegistry[b] = []);
  }, 
  generateUUID : function() {
	  return _d.generateUUID();
  },
  tempoHandleOverride : function(item) {
		if (item.ChargeCodeInvalid) {
			return modelController.getTimecard().toggleOverrideChargeCode({cid:item.CID});
		} else {
			return $.Deferred.reject();
		}
		
		return deferred.promise();
	},
	tempoHandleFavorites : function(item) {
		var _ind = modelController.getContext().checkFavorite(item);

		if (_ind < 0) {
			return (this.tempoAddFavorite(item));
		} else {
			return (this.tempoDeleteFavorite(_ind));
		}
		;
	},
	
	tempoAddFavorite : function(item) {
		if (item.ChargeCode == "") {
			this.showSimpleMessage('S',this.getResourceText('fMsg1'), '', 3000);
			return false;
		} else {
			return modelController.getTempo().addFavorite({
				ChargeCode: _d.normalize(item.ChargeCode), 
				Ext: _d.normalize(item.Extension), 
				Title:this.defaultTitle(item)})
				.done(function(oData,oResponse){
					modelController.getContext().setData(oData.results);
					modelController.getTimecard()['get']().refresh(true);  //<-- remove
				})
		}

	},
	tempoDeleteFavorite : function(_ind) {
		var _fid = modelController.getContext().getUserFavoritesListId(_ind);
		return modelController.getTempo().deleteFavorite({Fid:_fid})
		.done(function(oData,oResponse){
			modelController.getContext().setData(oData.results);
			modelController.getTimecard().get().refresh(true);  //<-- remove
		})
	},

	tempoAddTask : function(item) {
		var _item = item || new sap.m.StandardListItem();
		var _customData = (_item) ? _item.getCustomData() : [];
		var _timecard = modelController.getTimecard();
		var _date = _d.getLocalDate(_timecard.getPayEnd());

		if (item) {
			var _chargeCode = (_item.isSelected()) ? _d.normalize(_d.getCustomData(_customData, "ChargeCode")) : _d.normalize(_item.getProperty("title"));
			var _chargeCodeType = (_item.isSelected()) ? _d.normalize(_d.getCustomData(_customData, "Type")) : _d.normalize("");
			var _ext = (_item.isSelected()) ? _d.normalize(_d.getCustomData(_customData, "Extension")) : _d.normalize("");
			return modelController.getTempo().addChargeCode({ 
				ChargeCode: _chargeCode, 
				ChargeCodeType: _chargeCodeType, 
				Ext: _ext, 
				startDate: _date
				})
				.done(function(oData,oResponse){
					_timecard.insertRecord(oData);
				})
		} else {
			return modelController.getTempo().addBlankLine({startDate:_date})
			.done(function(oData, oResponse) {
				_timecard.insertRecord(oData);
			})
		}	
	},

	tempoChangeTask : function(item, cid) {
		var _cid = cid || 0;
		var _timecard = modelController.getTimecard();
		var _date = _d.getLocalDate(_timecard.getPayEnd());
		
		var _customData = (item) ? item.getCustomData() : [];

		if (_customData.length > 0) {
			return modelController.getTempo().addChargeCode({
				ChargeCode: _d.normalize(_d.getCustomData(_customData, "ChargeCode")), 
				ChargeCodeType: _d.normalize(""), 
				Ext: _d.normalize(_d.getCustomData(_customData, "Extension")), 
				startDate: _date
				})
			.done(function(oData,oResponse){
				_timecard.updateRecord(_cid, oData);
			})
		} else {
			return $.Deferred().reject();
		};
	},

	tempoValidateRecord : function(item) {
		var _timecard = modelController.getTimecard();
		var _date = _d.getLocalDate(_timecard.getPayEnd());
		var _promise = $.Deferred();
		modelController.getTempo().validateRecord({startDate:_date, Item:item, Promise:_promise})
		.done(function(oData, oResponse){
			_timecard.updateRecord(item.CID,oData);
			//setTimeout(function(handler) {
			//	handler.resolve(oData, response);
			//}, 0, _promise);
		})
		return _promise;
	},

	tempoValidateAdjustment : function(parameters) {
		var _date =  _d.getLocalDate(modelController.getTimecard().getPayEnd());
		return modelController.getTempo().validateAdjustment({ 
			AdjustmentReasonCode:_d.normalize(parameters.AdjustmentReasonCode), 
			AdjustmentReasonText:_d.normalize(parameters.AdjustmentReasonText), 
			startDate: _date,
			Promise: parameters.Promise || $.Deferred()
			});
	},	
	
	defaultTitle : function(oData) {
		return (oData.ChargeCode + ((oData.Extension.length > 0) ? '.'
				+ oData.Extension
				: '')
		);
	},
	tempoGetOdataSrv : function() {
		var oConfig = this.getOwnerComponent().getMetadata().getConfig();
		var _host = window.location.hostname;
		return ((_host == "localhost") ? oConfig.tempoServiceLocal
				: oConfig.tempoServiceRuntime);
	},
	tempoDeleteRow : function(item) {
		var _timecard = modelController.getTimecard();
		var _c = _timecard.deleteRow(item);
		var _date = _d.getLocalDate(_timecard.getPayEnd());

		if (_c <=0) {
			return modelController.getTempo().addBlankLine({startDate:_date})
			.done(function(oData, oResponse) {
				_timecard.insertRecord(oData);
//				_timecard.recalculateTotals();
				//_timecard.get().refresh(true);
				//_promise.resolve(oData, oResponse);
				//if (typeof cb == 'function') cb(oData);
			})
		} else {
//			_timecard.recalculateTotals();
			_timecard.get().refresh(true);
			return $.Deferred().resolve();
		}				
		
	},
	
	buildMessage : function(messages) {
		if (!messages) return false;
		
		var _mArray = messages || [];
		if (_mArray.length <= 0) return false;
		
		var _prop = (_mArray.length > 1) ? 'R' : _mArray[0]["Property"];
		var _retMsg = $.grep(messages, function(a) {
			return a["Property"] == _prop
		});
		var _ridiculouslyLongMessage = "";
		for ( var i in messages) {
			_ridiculouslyLongMessage += (messages[i]["Property"] === _prop) ? ""
			: "-"
					+ messages[i]["Text"]
					+ "\n";
		}

		var _action;
		var _details = (_ridiculouslyLongMessage.length > 0) ? { details : _ridiculouslyLongMessage } : null;

		if (_retMsg[0]) {
			switch (_retMsg[0]["Type"]) {
				case "A":
				case "E":
				case "Error":
					_action = "error";
					break;
				case "S":
				case "Success":
					_action = "success";
					break;
				case "W":
				case "Warning":
					_action = "warning";
					break;
				default:
					_action = "information";
				break;
			}
			return {'action' : _action, 'header' : _retMsg[0].Text, 'details' : _details};
		} else {
			return null;
		}
	},
	
	displayMessage : function(type) {
		var _msg = this.buildMessage(modelController.getTimecard().getMessages(type));
		var _hdr = (_msg.details) ? _msg.header+ this.getResourceText('fMsg2') : _msg.header;
		if (_msg) _d.alert(_msg.action, _hdr, _msg.details);
		
		
//		var _messages = modelController.getTimecard().getMessages(type);
//		
//		var _messages = $.grep(modelController.getTimecard().getMessages(), function(a) {
//			return a.Property != 'R'
//		});
//		
//		var oModel = new sap.ui.model.json.JSONModel(),
//			that = this;
//		
//		oModel.setData(_messages);
//
//		var	oBackButton = new sap.m.Button({
//			icon: sap.ui.core.IconPool.getIconURI("nav-back"),
//			visible: false,
//			press: function () {
//				that.oMessageView.navigateBack();
//				this.setVisible(false);
//			}
//		});
//		
//
//		this.oMessageView = new sap.m.MessageView({
//			showDetailsPageHeader: false,
//			itemSelect: function () {
//				oBackButton.setVisible(true);
//			},
//			items: {
//				path: "/",
//				template: new sap.m.MessageItem({
//					type: '{Type}',
//					title: '{Title}',
//					//description: '{description}',
//					//subtitle: '{subtitle}',
//					//counter: '{counter}',
//					markupDescription: "{markupDescription}",
//					//link: oLink
//				})
//			}
//		});
//		
//		this.oMessageView.setModel(oModel);
//
//		var _oCloseButton =  new sap.m.Button({
//			text: "Close",
//			press: function () {
//				that.oPopover.close();
//			}
//		});
//		
//		var _oPopoverBar = new sap.m.Bar({
//				contentLeft: [oBackButton],
//				contentMiddle: [
//					new sap.ui.core.Icon({
//						color: "#bb0000",
//						src: "sap-icon://message-error"}),
//					new sap.m.Text({
//						text: "Messages"
//					})
//				]
//		});
//
//		this.oPopover = new sap.m.ResponsivePopover({
//			customHeader: oPopoverBar,
//			contentWidth: "440px",
//			contentHeight: "440px",
//			verticalScrolling: false,
//			modal: true,
//			content: [this.oMessageView],
//			endButton: _oCloseButton
//		});
		
		
	},	
	displayApproveMessages : function(messages, cb) {
		var _msg = this.buildMessage(messages);
		if (_msg) {
			if (typeof cb === 'function' ){
				_msg.details['onClose'] = cb;
			}
			_d.alert(_msg.action, _msg.header, _msg.details)
		}
	},
	showSimpleMessage : function(type, message, details, duration) {
		var mStruc = [{
			'Type'		:	type,
			'Property'	:	type,
			'Text'		: 	message,
			'Details'	: 	details	
		}];
		
		var _msg = this.buildMessage(mStruc);
		if (_msg) _d.alert(_msg.action, _msg.header, _msg.details, duration);
	},		
 	loadTimeCardData : function(params){
		var promise = params.Promise || $.Deferred();
		var self = this;
		dd = params.StartDate || new Date();
	    modelController.getTempo().setEID(params.EmployeeID);
	    modelController.getTempo().setStartDate(dd);
	    modelController.getTempo().getContext({
	    	'EID': params.EmployeeID,
	    	'Date': dd
	    })
	    .done(function(oData,response){
			var _ctx = modelController.getContext().get();
			_ctx.setData(oData);
			_ctx.refresh(true);								
	    	self.getTimeData({StartDate:dd, Operation:params.Operation, Promise:promise});
	    })
	    return promise;
	},
	getTimeData : function(params) {
		dd = params.StartDate || new Date();
		var _self = this;
		var _dataRead = modelController.getTempo().getData({startDate:dd, op:params.Operation, Promise: params.Promise || $.Deferred()})
		.fail(function(oError){
    		var _msg = _self.buildMessage(modelController.getTempo().getMessages());
    		if (_msg) _d.alert(_msg.action, _msg.header, _msg.details);
        });

		return _dataRead;
	    //return modelController.getTempo().getData({startDate:dd, op:params.Operation, Promise: params.Promise || $.Deferred()})
		
	},
	postTimeData : function(params) {
		var _data = modelController.getTimecard().getUserInput();		
		var _par = params || {};
		var _form = _par.Form || null;
		if(_form) {
			_data.RejReasonCode = _form.ReasonCode;
			_data.RejReasonText = _form.ApproverText;
		}
	    return modelController.getTempo().postData({Data: _data, Opcode:params.Operation, Promise:params.Promise || $.Deferred()});
	},
	sendEmail : function(params) {
		return modelController.getTempo().sendEmail({EmployeeID: params.EmployeeID, Message:params.Message, Promise:params.Promise || $.Deferred() } );
	},
	//isTimecardValid : function(){
		//  throw "tempoUtils";
	//	return modelController.getInstances().isValid();
	//},
	//getNextTimecard : function(){
	//	return modelController.getInstances().getNext();
	//},
	refreshTimecard : function(oData){
		var _app = modelController.getApp();
		var _tempo = modelController.getTempo();
		var _timecard = modelController.getTimecard();
		
		_app.setStatusIcon(_ui.getStatusIcon(oData['Status']));

		_tempo.grid.StartDate = _d.getUTCDate(oData.StartDate);
		_tempo.grid.EmployeeID = oData.EmployeeID;
		_tempo.grid.editable = oData.Editable;
		_tempo.grid.payEndDate = _d.getUTCDate(oData.PayendDate);

		_timecard.refresh(oData);

//		_timecard.get().refresh(true);
		_app.get().refresh(true);

	},
	appIsReviewMode : function(){
		return modelController.getApp().isReview();
	},
	appSetReviewMode : function(ff){
		modelController.getApp().setReview(ff);
	},
	showErrorMessagesInPopup:function(cb) {
		var _messages = modelController.getTempo().getMessages();
	    0 < _messages.length ? this.displayApproveMessages(_messages, cb) : !1;
	},
	setResize : function(flag){
		return (flag) ? $(window).resize(function(){sap.ui.getCore().getEventBus().publish("framework", "resizeGrid");}) : $(window).off('resize');
	},
    getResourceModel: function(){
    	return sap.ui.getCore().getModel('i18n');
    	//return this.getOwnerComponent().getModel('i18n');
    },
	getResourceText: function(textId){
		return sap.ui.getCore().getModel('i18n').getResourceBundle().getText(textId);
		//return this.getResourceModel().getProperty(textId);
	},
	getValidationGroupMsg: function(){
		return {'Property':'R', 
					'Type':'Error', 
					'Text': this.getResourceText('fMsg2'),
					'Code': ''};
	},
	getTimeSpan : function(timeValue1, timeValue2) {
		var timeDiff;
		var elapsedTime;
		
		
		if (timeValue1 && timeValue2) 
		{
			// Create new dates
			var dateTime1 = new Date(timeValue1);
			var dateTime2 = new Date(timeValue2);
			
			// Create new time values from 1/1/1970
			timeValue1 = new Date("1970", "01", "01", dateTime1.getHours(), dateTime1.getMinutes());
			timeValue2 = new Date("1970", "01", "01", dateTime2.getHours(), dateTime2.getMinutes());
			
//			timeDiff = timeValue2 - timeValue1;
			timeDiff = dateTime2 - dateTime1;
      		
//	        var hours = parseInt((timeDiff/(1000*60*60))%24);
	        var hours = parseInt(timeDiff/(1000*60*60));
	        var minutes = parseInt((timeDiff/(1000*60))%60);
			var seconds = parseInt((timeDiff/1000)%60);
			
      	    hours = (hours < 10) ? "0" + hours : hours;
      	    minutes = (minutes < 10) ? "0" + minutes : minutes;
      	    seconds = (seconds < 10) ? "0" + seconds : seconds;

      	    elapsedTime =  hours + ":" + minutes;
			
      	  	return elapsedTime;
		} 
		else 
		{
			return "00.00";
		}
	},	

  };
});


sap.m.Button.prototype.adjustButtonStyle = function(c) {
  this.adjustToggleStatus(this, c);
};
sap.m.Button.prototype.setHref = function(c) {
  this.$().attr("href", c);
  return this;
};
