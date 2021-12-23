define([
    "esri/widgets/smartMapping/ColorSlider", "esri/smartMapping/statistics/histogram", 
    "esri/smartMapping/statistics/summaryStatistics", "esri/Color",
    "dojo/request", "esri/renderers/support/jsonUtils",
    "esri/smartMapping/renderers/color", "esri/smartMapping/symbology/color",
    "esri/renderers/visualVariables/support/ColorStop", "esri/renderers/visualVariables/ColorVariable"
], function(ColorSlider, histogram, summaryStatistics, Color, request, rendererJsonUtils, 
    colorRendererCreator, colorSymbology, ColorStop, ColorVariable) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Current layer being processed
    var layer = null;
    var uiEnabled = null;
    var id = null;
    var widgetDivId = null;
    var colorSlider = null;
    var histogramBins = 30;

    var getColorFromValue = function(stops, value) {
      let minStop = stops[0];
      let maxStop = stops[stops.length - 1];

      const minStopValue = minStop.value;
      const maxStopValue = maxStop.value;

      if (value < minStopValue) {
        return minStop.color;
      }

      if (value > maxStopValue) {
        return maxStop.color;
      }

      const exactMatches = stops.filter(function (stop) {
        return stop.value === value;
      });

      if (exactMatches.length > 0) {
        return exactMatches[0].color;
      }

      minStop = null;
      maxStop = null;
      stops.forEach(function (stop, i) {
        if (!minStop && !maxStop && stop.value >= value) {
          minStop = stops[i - 1];
          maxStop = stop;
        }
      });

      const weightedPosition =
        (value - minStop.value) / (maxStop.value - minStop.value);

      return Color.blendColors(
        minStop.color,
        maxStop.color,
        weightedPosition
      );
    }

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        var field = event.target.value;
        // Getting theme for this layer
        var theme = app.config.operationalLayers.find(x => x.id === id).theme;
        var filename = theme + "-" + id + "-" + field + ".json";
        self.loadJsonSymbology(filename);
    };

    var getVisualVariableByType = function(renderer, type) {
        var visualVariables = renderer.visualVariables;
        return visualVariables && visualVariables.filter(function(vv) {
            return vv.type === type;
        })[0];
    }

    var removeColorSlider = function(){
        //app.controllers.map.mapView.ui.remove(colorSlider);
        // Removing HTML node
        if(colorSlider && colorSlider.domNode){    
            colorSlider.domNode.removeChild(Array.from(colorSlider.domNode.children).filter(x => Array.from(x.classList).includes("esri-color-slider__slider-container"))[0]);
        }
        // Nullifying the property
        colorSlider = null;
    }


    var createColorSlider = function(histogramR, rendererR, stats) {
        const bars = [];
        var vv = null;
        // Removing current slider   
        removeColorSlider();
        if(rendererR){
            vv = rendererR.visualVariable;
            colorSlider = ColorSlider.fromRendererResult(rendererR, histogramR);
        }
        else{   
            vv = getVisualVariableByType(layer.renderer,"color")
            var histogramConfig = {
                average: stats.avg,
                standardDeviation: stats.stddev,
                bins: histogramR.bins
            };
            colorSlider = new ColorSlider({
                stops: getVisualVariableByType(layer.renderer,"color").stops,
                min: histogramR.minValue,
                max: histogramR.maxValue,
                histogramConfig: histogramConfig
            });
        }
        colorSlider.set({
            primaryHandleEnabled: true,
            handlesSyncedToPrimary: false,
            visibleElements: {
                interactiveTrack: true
            },
            syncedSegmentsEnabled: true,
            container: widgetDivId
        });
        colorSlider.viewModel.precision = 2;

        // update the histogram bars to match renderer values
        colorSlider.histogramConfig.barCreatedFunction = function (index, element) {
            const bin = histogramR.bins[index];
            const midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
            const color = getColorFromValue(vv.stops, midValue);
            element.setAttribute("fill", color.toHex());
            bars.push(element);
        };
        
        // update the renderer and the histogram when sliding
        colorSlider.on(["thumb-change", "thumb-drag", "min-change", 
            "max-change", "segment-drag"], function(event) {
                let renderer = layer.renderer.clone();
                let colorVariable = renderer.visualVariables[0].clone();
                colorVariable.stops = colorSlider.stops;
                renderer.visualVariables = [ colorVariable ];
                layer.renderer = renderer.clone();
    
                // update the color of each histogram bar based on the values of the slider thumbs
                bars.forEach(function (bar, index) {
                    const bin = colorSlider.histogramConfig.bins[index];
                    const midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
                    const color = getColorFromValue(colorSlider.stops, midValue);
                    bar.setAttribute("fill", color.toHex());
                });
        });
        //app.controllers.map.mapView.ui.add(colorSlider, "bottom-right");
    }

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance, layerInstance){
        app = appInstance;
        self.initLayer(layerInstance);
        self.initInterface();
    };

    /**
     * Initializes the layer information
     * @param {*} layer 
     */
    self.initLayer = function(layerInstance){
        layer = layerInstance;
        id = layer.id;
        // Filtering special cases here, for derived layers
        if(id.startsWith("ARGO_DATA_IFREMER_ERDDAP")){
            id = "ARGO_DATA_IFREMER_ERDDAP";
        }
        else if(id.startsWith("ARGO_TRACKLINE")){
            id = "ARGO_TRACKLINE";
        }
        else if(id.startsWith("ARGO_OBS_PTF")){
            id = "ARGO_OBS_PTF";
        }
        else if(id.startsWith("ARGO_OBS")){
            id = "ARGO_OBS";
        }
        else if(id.startsWith("SOT_OBS")){
            id = "SOT_OBS";
        }
    };

    /**
     * Initializes the interface of the widget
     */
    self.initInterface = function(){
        uiEnabled = true;
        var symbologyList = "";
        var symbologyFields = app.config.operationalLayers.find(x => x.id === id).symbologyFields;
        if(symbologyFields && symbologyFields.length > 0){
            // Symbologies available
            symbologyList += "<option value='' disabled selected>-</option>";
            for(var i = 0; i < symbologyFields.length; i++){
                if((symbologyFields[i].startsWith("3D") && (app.controllers.map.is3D || app.controllers.map.is3DFlat)) || !symbologyFields[i].startsWith("3D")){
                    symbologyList += "<option value='" + symbologyFields[i] + "'>" + symbologyFields[i] + "</option>";
                }
            }

            // Adding info panel to the UI
            var infoPanelContent = null;
            var toolResultPanelContent = {
                "title": "Select a symbology - " + layer.title, 
                "htmlContent": "<form class='form-group'><select class='form-control' id='symbologySelect'>" + symbologyList + "</select></form>",
                "position": "top-right"
            };

            widgetDivId = app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

            document.getElementById('symbologySelect').addEventListener("change", listener);

            if(layer.renderer.visualVariables){
                histogram({
                    layer: layer,
                    field: getVisualVariableByType(layer.renderer,"color").field,
                    numBins: histogramBins
                }).then(function(histogramResult){
                    summaryStatistics({
                        layer: layer,
                        field: getVisualVariableByType(layer.renderer,"color").field
                    }).then(function(stats){
                        createColorSlider(histogramResult, null, stats);
                    });
                });
            }
        }
        else{
            // No symbology available
            // Adding info panel to the UI
            var infoPanelContent = null;
            var toolResultPanelContent = {
                "title": "Select a symbology - " + layer.title, 
                "htmlContent": "<form class='form-group'><select class='form-control' id='symbologySelect'><option value='' disabled>no symbology available</option></select></form>",
                "position": "top-right"
            };

            app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        }
    }

    /**
     * Loads a symbology based on its filename. Tool must be initialized beforehand.
     * @param {*} fileName 
     */
    self.loadJsonSymbology = function(fileName, featureLayerExt, appExt){
        if(appExt){
            app = appExt;
        }
        if(featureLayerExt){
            layer = featureLayerExt;
        }
        fileName = fileName.replace(/ /g, '_');
        request.get("app/symbologies/" + fileName).then(function(data){
            // Folder containing new symbologies, using auto cast ESRI values 
            var renderer = JSON.parse(data);
            if(renderer.type == "smartContinuousRenderer"){
                var colorScheme = null;
                if(!renderer.colorScheme || (renderer.colorScheme == "auto")){
                    var initScheme = colorSymbology.getSchemes({
                        basemap: app.controllers.map.mapView.map.basemap,
                        view: app.controllers.map.mapView,
                        geometryType: "point",
                        theme: "above-and-below"
                    });
                    colorScheme = colorSymbology.flipColors(initScheme.primaryScheme);
                }
                else{
                    var initScheme = colorSymbology.getSchemeByName({
                        basemap: app.controllers.map.mapView.map.basemap,
                        geometryType: "point",
                        theme: "above-and-below",
                        name: renderer.colorScheme
                    });
                    if(renderer.flipped){
                        colorScheme = colorSymbology.flipColors(initScheme);
                    }
                    else{
                        colorScheme = initScheme;
                    }
                }
                
                const colorParams = {
                    layer: layer,
                    view: app.controllers.map.mapView,
                    field: renderer.field,
                    symbolType: "3d-flat",
                    theme: "above-and-below",
                    colorScheme: colorScheme
                };

                var rendererResult = null;
                colorRendererCreator.createContinuousRenderer(colorParams).then(function(response) {
                    rendererResult = response;
                    layer.renderer = response.renderer;
                    return histogram({
                        layer: colorParams.layer,
                        field: colorParams.field,
                        numBins: histogramBins
                    });
                }).then(function(histogramResult) {
                    if(uiEnabled){
                        createColorSlider(histogramResult, rendererResult, null);
                    }
                });
            }
            else{
                layer.renderer = renderer;
                if(renderer.visualVariables){
                    histogram({
                        layer: layer,
                        field: getVisualVariableByType(renderer,"color").field,
                        numBins: histogramBins
                    }).then(function(histogramResult){
                        summaryStatistics({
                            layer: layer,
                            field: getVisualVariableByType(renderer,"color").field
                        }).then(function(stats){
                            if(uiEnabled){
                                createColorSlider(histogramResult, null, stats);
                            }
                        });
                    });
                }
                else{
                    // Removing current slider   
                    removeColorSlider();           
                }
            }
        }, 
        function(err){
            request.get(app.config.JSON_DIRECTORY + fileName).then(function(data){
                // Old symbology files, server JSON based
                var data = JSON.parse(data);
                var renderer = rendererJsonUtils.fromJSON(data);
                layer.renderer = renderer;
                removeColorSlider();
            }, function(error){
                console.error(error)
            });
        });
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        var element = document.getElementById('symbologySelect');
        if(element){
            element.removeEventListener("change", listener);
        }

        if(colorSlider){
            //app.controllers.map.mapView.ui.remove(colorSlider);  
        }
    }

    return self;
});
