define([
      "esri/layers/FeatureLayer",
      "app/modules/symbologyTool"
], function(FeatureLayer, symbologyTool) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    var graphics = null;
    var fields = [{
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
      }];



    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance){
        app = appInstance;
    };


    /**
     * Adds the layer of observation's data for a given float.
     * @param  {[type]} objectRef The float's reference
     * @param  {[type]} dataType  For later use, the desired variable. Ignore for now.
     */
    self.displaySensorsOceanSITES = function(objectRef){
        var layerInfo = app.config.operationalLayers.find(x => x.theme === "oceansites" && x.type === "oceansitesSensors");
        var existingLayer = null;
        var layerId = null;
        var layerName = null;

        layerId = layerInfo.id + "_" + objectRef;
        existingLayer = app.controllers.map.mapView.map.findLayerById(layerId);
        layerName = objectRef + " sensors";


        if(!existingLayer){
          var layer = null;
          var elevationInfo = layerInfo.elevationInfo;
          elevationInfo.featureExpressionInfo.expression = elevationInfo.featureExpressionInfo.expression.replace("{COEFF}", app.controllers.map.exaggerationCoef);
          

            layer = new FeatureLayer({
              id: layerId,
              hasZ: true,
              returnZ: true,
              title: layerName,
              url: layerInfo.url,
              outFields: ["*"],
              popupTemplate: {title: layerInfo.popupTitle, content: layerInfo.popupContent},
              elevationInfo: elevationInfo,
              definitionExpression: layerInfo.idField + " = '" + objectRef + "'"
            });

            if(layerInfo.symbologyFields && layerInfo.symbologyFields.length > 0){
                var filename = layerInfo.theme + "-" + layerInfo.id + "-" + layerInfo.symbologyFields[0] + ".json";
                symbologyTool.loadJsonSymbology(filename, layer, app);
            }
            app.controllers.map.addLayerWithElevationInfoID(layer.id, layerInfo.id);
            app.controllers.map.addToWorkLayerList(layer);
          
        }
        return layerId;
    };

    return self;
});