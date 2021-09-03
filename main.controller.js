sap.ui.controller("z_tpo_timecard.controller.main",{
	onInit: function () {
		this.getView().addStyleClass(this.getContentDensityClass());
	},
	getContentDensityClass : function () {
		return "sapUiSizeCompact";
//			if (!sap.ui.Device.support.touch) {
//				return "sapUiSizeCompact";
//			} else {
//				return "sapUiSizeCozy";
//			}
	}
});