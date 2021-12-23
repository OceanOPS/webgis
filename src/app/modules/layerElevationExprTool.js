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
    var currentElevationInfo = {
        mode: "relative-to-ground",
        offset: 0,
        featureExpressionInfo: {
            expression: "0"
        },
        unit: "meters"
    };

    /*
    *   Listener when clicking on the map.
    */
    var expressionChanged = function(event){
        var val = event.target.value;
        currentElevationInfo.featureExpressionInfo.expression = val;
        layer.elevationInfo = currentElevationInfo;
    };
    var modeChanged = function(event){
        var select = event.target;
        var val = select.options[select.selectedIndex].value;
        currentElevationInfo.mode = val;
        layer.elevationInfo = currentElevationInfo;
    };

    var offsetChanged = function(event){
        var val = event.target.value;
        currentElevationInfo.offset = val;
        layer.elevationInfo = currentElevationInfo;
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
        currentElevationInfo.mode = layer.elevationInfo.mode;
        currentElevationInfo.featureExpressionInfo.expression = layer.elevationInfo.featureExpressionInfo.expression;
        currentElevationInfo.offset = layer.elevationInfo.offset;
        var mode = layer.elevationInfo.mode;

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"position": "top-right", "title": "Change layer's elevation information", "htmlContent": 
            "<label>mode</label>&nbsp;<select id='elevationMode'><option " + (mode == "on-the-ground" ? "selected": "") + " value=on-the-ground'>on-the-ground</option>" + 
            "<option " + (mode == "relative-to-ground" ? "selected": "") + " value='relative-to-ground'>relative-to-ground</option>" + 
            "<option " + (mode == "relative-to-scene" ? "selected": "") + " value='relative-to-scene'>relative-to-scene</option>" +
            "<option " + (mode == "absolute-height" ? "selected": "") + " value='absolute-height'>absolute-height</option></select><br>" + 
            "<label>offset</label>&nbsp;<input id='elevationOffset' type='number' value='" + layer.elevationInfo.offset + "' /><br>" +
            "<label>expression</label>&nbsp;<input id='elevationExpr' type='text' value='" + layer.elevationInfo.featureExpressionInfo.expression + "' />"
        };

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        document.getElementById('elevationExpr').addEventListener("change", expressionChanged);
        document.getElementById('elevationMode').addEventListener("change", modeChanged);
        document.getElementById('elevationOffset').addEventListener("change", offsetChanged);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        var elevationExpr = document.getElementById('elevationExpr');
        var elevationMode = document.getElementById('elevationMode');
        var elevationOffset = document.getElementById('elevationOffset');

        if(elevationExpr){
            elevationExpr.removeEventListener("change", expressionChanged);
        }
        if(elevationMode){
            elevationMode.removeEventListener("change", modeChanged);
        }
        if(elevationOffset){
            elevationOffset.removeEventListener("change", offsetChanged);
        }
    }

    return self;
});
