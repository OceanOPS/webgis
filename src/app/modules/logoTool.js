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
        var url = document.getElementById("logoUrl").value;
        app.controllers.map.addLogo(url);
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
        var toolResultPanelContent = {"title": "Logo URL", "htmlContent": "<form class='form-horizontal'><input id='logoUrl' placeholder='URL' type='url'/><input class='btn btn-block btn-default' type='button' value='Add' id='logoUrlConfirm'/></form>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        document.getElementById('logoUrlConfirm').addEventListener("click", listener);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
    }

    return self;
});
