/**
 * 
 * Known Limitations
 *
 * FeatureLayerView.queryFeatures() and GeoJSONLayerView.queryFeatures() results do not include the z-values when called in 2D MapView even if returnZ is set to true.
 */

define([
    "esri/widgets/Slider",
    "esri/layers/support/FeatureFilter",
    "esri/geometry/Extent",
    "esri/geometry/Polygon"
], function(Slider, FeatureFilter, Extent, Polygon) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    var originalDefinitionExpressions = {};
    var minValue = -6000;
    var maxValue = 50;
    var heightKeepNull = false;
    var currentQuery = null;
    var coeffDepth = 1;

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        if(event.value){            
            if(event.index == 0){
                minValue = event.value;
            }
            if(event.index == 1){
                maxValue = event.value;
            }
        }
        else{
            heightKeepNull = event.target.checked;
        }
        var rings = [[
            [-180,-90, minValue],
            [-180, 90, maxValue],
            [180,90, maxValue],
            [180,-90, minValue],
            [-180,-90, minValue]
        ]];
        var polygon = new Polygon({rings: rings, hasZ: true, spatialReference: { wkid: 4326 }});

        $.each(app.controllers.map.mapView.map.allLayers.items, function(index, layer) {
            var configLayer = app.config.operationalLayers.find(l => l.id == layer.id);
            if(!configLayer && layer.id.startsWith("ARGO_DATA_IFREMER_ERDDAP")){
                configLayer = app.config.operationalLayers.find(l => l.id == "ARGO_DATA_IFREMER_ERDDAP");
                coeffDepth = -1;
            }
            if(configLayer){
                if(configLayer.sensorMaxHeightField && configLayer.sensorMinHeightField){
                    app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                        var where = null;
                        if(minValue){
                            where = configLayer.sensorMinHeightField + " >= " + minValue;
                        }
                        if(maxValue && !minValue){
                            where = configLayer.sensorMaxHeightField + " <= " + maxValue;
                        }
                        else if(maxValue){
                            where = "(" + configLayer.sensorMinHeightField + " <= " + maxValue + ") AND (" + 
                                configLayer.sensorMaxHeightField + " >= " + minValue + ")";
                        }
                        if(heightKeepNull){
                            where += " OR " + configLayer.sensorMinHeightField + " IS NULL OR " + configLayer.sensorMaxHeightField + " IS NULL";
                        }
                        layerView.filter = {
                            where: where
                        };
                    });
                }
                else{
                    if(configLayer.elevationField){
                        var elevationField = configLayer.elevationField * coeffDepth;
                        app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                            var where = null;
                            if(minValue){
                                where = "(" + configLayer.elevationField + " * " + coeffDepth + ") >= " + minValue;
                            }
                            if(maxValue && !minValue){
                                where = "(" + configLayer.elevationField + " * " + coeffDepth + ") <= " + maxValue;
                            }
                            else if(maxValue){
                                where = "((" + configLayer.elevationField + " * " + coeffDepth + ") <= " + maxValue + ") AND ((" + 
                                configLayer.elevationField + " * " + coeffDepth + ") >= " + minValue + ")";
                            }
                            if(heightKeepNull){
                                where += " OR " + configLayer.elevationField + " IS NULL";
                            }
                            layerView.filter = {
                                where: where
                            };
                        });
                    }
                    else{
                        // Looking on Z values
                        if(layer.hasZ){
                            app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                                layerView.filter = new FeatureFilter({
                                    spatialRelationship: "contains",
                                    geometry: polygon.extent
                                });
                            });
                        }
                    }
                }
            }
            else{
                    // Looking on Z values
                    if(layer.hasZ){
                        app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                            layerView.filter = new FeatureFilter({
                                spatialRelationship: "contains",
                                geometry: polygon.extent
                            });
                        });
                    }
            }
        });
    };

    var resetFilter = function(){
        $.each(app.controllers.map.mapView.map.allLayers.items, function(index, layer) {
            var configLayer = app.config.operationalLayers.find(l => l.id == layer.id);
            if(configLayer){
                if(configLayer.sensorMaxHeightField && configLayer.sensorMinHeightField){
                    
                    app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                        var where = null;
                        
                        layerView.filter = {
                            where: where
                        };
                    });
                }
            }
        });
    }

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
        var toolResultPanelContent = {"title": "Change height filter", "htmlContent": "<br><div id='heightSlider'></div><br><input type='checkbox' id='heightKeepNull' name='heightKeepNull'/><label for='heightKeepNull'>Keep unspecified heights</label>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        const slider = new Slider({
            min: -7000,
            max: 100,
            values: [-6000, 50],
            container: "heightSlider",
            visibleElements: {
                labels: true,
                rangeLabels: true
            },
            labelInputsEnabled: true,
            layout: "vertical",
            precision: 1
        });

        slider.on(["thumb-change", "thumb-drag"], listener);
        document.getElementById('heightKeepNull').addEventListener("change", listener);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        resetFilter();
    }

    return self;
});
