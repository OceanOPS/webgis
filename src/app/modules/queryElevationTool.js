define([
    "esri/geometry/SpatialReference",
    "esri/geometry/support/webMercatorUtils",
    "esri/rest/support/ProjectParameters"
], function(SpatialReference, webMercatorUtils, ProjectParameters) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the map module
    var map = null;
    /**
    *   Error function, displays an error message in the result panel.
    */
    var error = function(){
        document.getElementsByClassName("result-panel-result")[0].innerHTML = "Error";
    };
    /*
    *   Query the bathymetry layer for the elevation.
    */
    var queryElevation = function(position){
        document.getElementById("result-panel-result-loader").style.visibility = 'visible';
        map.bathymetryLayer.queryElevation(position, {demResolution: "finest-contiguous"}).then(function(result){
            document.getElementsByClassName("result-panel-result")[0].innerHTML = result.geometry.z.toFixed(2) + " m";
            document.getElementById("result-panel-result-loader").style.visibility = 'hidden';
        }).catch(function(error) {
            console.error(error);
        });
    };
    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        var position = event.mapPoint;
        // Testing if ready to process
        if(!(position.spatialReference.isWebMercator || position.spatialReference.isWGS84)){
            // Need to project
            // Testing if can project client-side
            if(webMercatorUtils.canProject(position.spatialReference, SpatialReference.WGS84)){
                // Can project client-side
                position = webMercatorUtils.project(position, SpatialReference.WGS84);
                queryElevation(position);
            }
            else{
                // Need server assistance for projection
                var params = new ProjectParameters();
                params.geometries = [position];
                params.outSR = SpatialReference.WGS84;
                map.geometryService.project(params).then(function(results){
                    queryElevation(results[0]);
                }).otherwise(function(result){
                    error();
                });
            }
        }
        else{
            queryElevation(position);
        }
    };
    var listenerHandler = null;

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance){
        map = appInstance.controllers.map;

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {title: "Query Elevation", text: "<p>Click on the globe to query elevation.</p>Elevation: "};

        map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        document.getElementById("mapViewDiv").style.cursor = "crosshair";

        listenerHandler = map.mapView.on("click", listener);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        document.getElementById("mapViewDiv").style.cursor = "auto";
        if(listenerHandler){
            listenerHandler.remove();
            listenerHandler = null;
        }
    }

    return self;
});
