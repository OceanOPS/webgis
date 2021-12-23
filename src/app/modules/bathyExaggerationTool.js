define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Current layer being processed
    var layer = null;

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        var val = event.target.value;
        app.controllers.map.changeBathyExaggerationCoef(val);
    };

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance, layerInstance){
        app = appInstance;
        layer = layerInstance;

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Change bathymetry exaggeration", "htmlContent": "<input id='exaggerationCoef' type='number' min='1' max='100' value='" + 
        app.controllers.map.exaggerationCoef + "' step='1'/>&nbsp;<label for='exaggerationCoef'>times actual depth</label>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        document.getElementById('exaggerationCoef').addEventListener("change", listener);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        var element = document.getElementById('exaggerationCoef');
        if(element){
            element.removeEventListener("change", listener);
        }
    }

    return self;
});
