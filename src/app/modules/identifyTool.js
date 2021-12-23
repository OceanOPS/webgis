define([
      "esri/tasks/IdentifyTask",
      "esri/rest/support/IdentifyParameters",
      "dojo/_base/array",
      "dojo/on"
], function(IdentifyTask, IdentifyParameters, arrayUtils, on) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Current layer being processed
    var layer = null;
    // Event reference
    var eventClick = null;

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        var val = event.target.value;
        layer = app.controllers.map.mapView.map.findLayerById(val);
    };

    // Executes each time the view is clicked
    function executeIdentifyTask(event) {
        if(layer){
            // Create identify task for the specified map service
            identifyTask = new IdentifyTask(layer.url);

            // Set the parameters for the Identify
            params = new IdentifyParameters();
            params.tolerance = 3;
            params.returnGeometry = true;
            var visibleLayers = layer.allSublayers.filter(sl => app.utils.isTreeVisible(sl) && !sl.sublayers).items.map(function(item){return item.id});
            params.layerIds = visibleLayers;
            params.layerOption = "all";
            params.width = app.controllers.map.mapView.width;
            params.height = app.controllers.map.mapView.height;
            // Set the geometry to the location of the view click
            params.geometry = event.mapPoint;
            params.mapExtent = app.controllers.map.mapView.extent;

            // This function returns a promise that resolves to an array of features
            // A custom popupTemplate is set for each feature based on the layer it
            // originates from
            identifyTask.execute(params).then(function(response) {

                var results = response.results;

                return arrayUtils.map(results, function(result) {

                    var feature = result.feature;
                    var layerName = result.layerName;

                    var content = "";
                    for (var property in feature.attributes) {
                        if (feature.attributes.hasOwnProperty(property)) {
                            if(property != "SHAPE" && property != "OBJECTID" && property != "OBJECT_ID"){
                                content += property + ": " + feature.attributes[property] + "<br>";
                            }
                        }
                    }
                    feature.popupTemplate = { 
                        title: layerName,
                        content: content
                    };

                    return feature;
                });
            }).then(showPopup); // Send the array of features to showPopup()

            // Shows the results of the Identify in a popup once the promise is resolved
            function showPopup(response) {
                if (response.length > 0) {
                    app.controllers.map.mapView.popup.open({
                        features: response,
                        location: event.mapPoint
                    });
                }
            }
        }
    }

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance){
        app = appInstance;

        var layerList = "";
        var visibleLayers = app.config.dynamicLayers.filter(function(l){
            return app.controllers.map.mapView.map.findLayerById(l.id);
        });
        layerList += "<option disabled selected='selected'>--</option>";
        for(var i = 0; i < visibleLayers.length; i++){
            layerList += "<option value='" + visibleLayers[i].id + "'>" + visibleLayers[i].name + "</option>";
        }

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Identify", "htmlContent": "<form class='form-group'><select class='form-control' id='layerSelect'>" + layerList + "</select></form>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        
        document.getElementById('layerSelect').addEventListener("change", listener);
        eventClick = on(app.controllers.map.mapView, "click", executeIdentifyTask);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        var element = document.getElementById('layerSelect');
        if(element){
            element.removeEventListener("change", listener);
        }
        if(eventClick){
            eventClick.remove();
        }
    }

    return self;
});
