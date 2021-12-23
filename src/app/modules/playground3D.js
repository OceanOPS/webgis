define([
], function() {
    var self = {"id": "playground3DTool"};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app module
    var app = null;


    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
   self.init = function(appInstance){
    app = appInstance;

    
    // Adding info panel to the UI
    var infoPanelContent = null;
    var toolResultPanelContent = null;

    app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
    // Disable loader
    app.setLoadingEnabled(false);
    // Activate UI auto hide
    app.settings.activateAutoHide(true);
};

/*
*   Deactivates the tool
*/
self.deactivate = function(){
    app.setLoadingEnabled(true);
    app.settings.activateAutoHide(false);
}

return self;
});