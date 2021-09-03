jQuery.sap.registerModulePath("tpoUtils", '/sap/bc/ui5_ui5/sap/ztpoUtils');

jQuery.sap.declare("z_tpo_timecard.Component");
sap.ui
		.define([ 
		        "sap/ui/core/UIComponent", 
		        "z_tpo_timecard/model/models", 
		        ], 

				/** Tempo Component controller. 
				 * 
				 * --by_Serge_Breslaw(n88977),@//www.linkedin.com/in/sergebreslaw
				 * 
				* @memberOf z_tpo_timecard.Component
				*/ 
			function(UIComponent, modelController) {
			"use strict";

				
			return UIComponent
					.extend("z_tpo_timecard.Component", {
						metadata : {
							manifest : "json"
						},
						
						exit: function() {
							sap.ui.getCore().getEventBus().destroy();
						},
				
						init : function() {														
							var self = this;
							UIComponent.prototype.init.apply(this, arguments);
							$.when(modelController.initializeModels(this))
									.then(function(response) {
										self.getRouter().initialize();
									});							
						},						
					});
		});
