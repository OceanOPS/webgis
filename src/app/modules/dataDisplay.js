define([
      "esri/layers/FeatureLayer",
      "dojo/request/script",
      "esri/geometry/Point",
      "app/modules/symbologyTool"
], function(FeatureLayer, script, Point, symbologyTool) {
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


    var createGraphicsFromGeoJson = function(geoJsonData){
        // raw GeoJSON data
        var geoJson = geoJsonData;
        var currentX = null, currentY = null, currentZ = null;

        // Create fields and attribute objects
        for(var i in geoJson.propertyNames){
          var type;
          if(geoJson.propertyUnits[i] == "degree_Celsius" || geoJson.propertyUnits[i] == "PSU"){
            type = "double";
          }
          else{
            type = "string";
          }
          fields.push({
            name: geoJson.propertyNames[i],
            alias: geoJson.propertyNames[i],
            type: type
          });
        }

        // Create an array of Graphics from each GeoJSON feature
        return geoJson.features.map(function(feature, i) {
          var attributes = {ObjectID: i};
          geoJson.propertyNames.forEach(function(property){
            if(fields.find(x => x.name == property).type === "string"){
              attributes[property] = feature.properties[property].toString();
            }
            else{
              attributes[property] = feature.properties[property];
            }
            if(property == "pres"){
              currentZ = (-1)*attributes[property];
            }
          });
          if(!currentX || (Math.round(currentX * 100) / 100) != (Math.round(feature.geometry.coordinates[0] * 100) / 100)){
            currentX = feature.geometry.coordinates[0];
            currentY = feature.geometry.coordinates[1];
          }

          return {
            geometry: new Point({
              x: currentX,
              y: currentY,
              z: currentZ,
              hasZ: true
            }),
            // select only the attributes you care about
            attributes: attributes
          };
        });
    };

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
    self.displayDataArgo = function(objectRef, dataType, cycleNb){
        var layerInfo = app.config.operationalLayers.find(x => x.theme === "argo" && x.type === "argoData");
        var url = layerInfo.url.replace("{PTF_REF}", objectRef);
        var existingLayer = null;
        var layerId = null;
        var layerName = null;

        if(cycleNb){
          layerId = layerInfo.id + "_" + objectRef + "_" + cycleNb;
          existingLayer = app.controllers.map.mapView.map.findLayerById(layerId);
          url += "&cycle_number=" + cycleNb;
          layerName = objectRef + " cycle " + cycleNb + " data";
        }
        else{
          layerId = layerInfo.id + "_" + objectRef;
          existingLayer = app.controllers.map.mapView.map.findLayerById(layerId);
          layerName = objectRef + " data";
        }


        if(!existingLayer){
          var layer = null;
          var elevationInfo = layerInfo.elevationInfo;
          elevationInfo.featureExpressionInfo.expression = "$feature." + layerInfo.elevationField + " * -" + app.controllers.map.exaggerationCoef;

          script.get(url, {
            jsonp: ".jsonp"
          }).then(function(response){
            var graphics = createGraphicsFromGeoJson(response);
            layer = new FeatureLayer({
              id: layerId,
              title: layerName,
              source: graphics, // autocast as an array of esri/Graphic
              // create an instance of esri/layers/support/Field for each field object
              fields: fields, // This is required when creating a layer from Graphics
              outFields: ["*"],
              hasZ: true,
              objectIdField: "ObjectID", // This must be defined when creating a layer from Graphics
              spatialReference: {
                wkid: 4326
              },
              geometryType: "point", // Must be set when creating a layer from Graphics
              popupTemplate: {title: layerInfo.popupTitle, content: layerInfo.popupContent},
              elevationInfo: elevationInfo
            });

            if(layerInfo.symbologyFields && layerInfo.symbologyFields.length > 0){
                var filename = layerInfo.theme + "-" + layerInfo.id + "-" + layerInfo.symbologyFields[0] + ".json";
                symbologyTool.loadJsonSymbology(filename, layer, app);
            }

            app.controllers.map.addLayerWithElevationInfoID(layer.id, layerInfo.id);
            app.controllers.map.addToWorkLayerList(layer);
          });
          
        }
        return layerId;
    };

    return self;
});