define(function() {
    var self = {};

    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app object
    var app = null;
    // Current basemap layer, if applicable
    var basemapMapImageLayer = null;
    // Current basemap ID
    var basemapID = null;
    // Current tool opened
    var currentTool = null;
    // Current result panel (linked to the tool)
    var currentResultPanel = null;
    // Current custom tool close button (linked to the tool)
    var closeWidgetButton = null;
    // Boolean aiming to not overload the server when projecting coordinates
    var waitCoordinates = false;
    // LayerList
    var layerList = null;
    // Print Widget
    var printer = null;
    var printerDisplayed = false;
    // Time Widget
    var timeSlider = null;
    var timeSliderDisplayed = false;
    // Opacity slider Widget
    var opacitySlider = null;
    var opacitySliderDisplayed = false;
    // Screenshot Widget
    var screenshotTool = null;
    var screenshotToolDisplayed = false;
    // Measurements widget
    var measurementsDisplayed = false;
    var measurementWidget = null, measurementWidgetDistance2D = null, measurementWidgetDistance3D = null, measurementWidgetArea2D = null, measurementWidgetArea3D = null;
    // Coordinates Widget
    var coordinates = null;
    var coordinatesDisplayed = false;
    // Sketch Widget
    var sketchWidget = null;
    var sketchWidgetDisplayed = false;
    // Custom tool
    var customToolDisplayed = false;

    // References to the main group layer
    var groupLayerWork = null;
    var groupLayerOperational = null;
    var groupLayerOthers = null;
    var operationalSubGroupLayerList = {};
    var otherSubGroupLayerList = {};

    var withElevationInfoLayerIDs = [];

    var fullTimeExtent = null;

    var widgetIteration = 0;

    
    /*
    *   Defines a symbology for the given feature layer
    */
    var loadJsonSymbology = function(featureLayer, fileName) {
        fileName = fileName.replace(/ /g, '_');

        // Fast way to load symbology
        require(["dojo/request", "esri/renderers/support/jsonUtils"], function(request, rendererJsonUtils){
            request.get("app/symbologies/" + fileName).then(function(data){
                // Folder containing symbologies, using auto cast ESRI values 
                var renderer = JSON.parse(data);
                featureLayer.renderer = renderer;
            }, 
            function(err){
                console.error(err);
            });
        });
    }

    /*
    * Set the extent of map
    */
    var setExtent = function(extentType){
        require(["esri/geometry/Extent", 
            "esri/geometry/SpatialReference",
            "esri/Viewpoint",
            "esri/rest/support/ProjectParameters"], function(Extent, SpatialReference, Viewpoint, ProjectParameters){
            if(extentType === "data-extent"){
                // Set the extent to the data extent, based on all feature layers
                var extents = [];
                var layers = self.mapView.map.allLayers.filter(x => x.type === "feature" && x.visible);
                var cnt = 0;
                for(var i = 0; i < layers.length; i++){
                    var layer = layers.getItemAt(i);
                    layer.queryExtent({outSpatialReference: self.mapView.spatialReference, where: layer.definitionExpression}).then(function(result){
                        cnt++;
                        if(result.count > 0){
                            extents.push(result.extent);
                        }
                        if(cnt == layers.length){
                            var newExtent = extents[0];
                            for(var j = 1; j < extents.length; j++){
                                newExtent = newExtent.union(extents[j]);
                            }
                            self.mapView.goTo(newExtent);
                        }
                    });
                }
            }
        });
    };

    /*
    *   Defines the actions related to each layer in the layer list
    */
    var defineLayerListActions = function(event){
        var item = event.item;
        var layer = event.item.layer;

        var actions = [];
        if(layer.type == "feature" && layer.parent.id === groupLayerOperational.id){
            actions = [[],[]];
            actions[0].push({
                title: "Remove",
                className: "esri-icon-close",
                id: "remove-operational-layer"
            });
            actions[1].push({
                title: "Pin it!",
                className: "esri-icon-map-pin",
                id: "pin-layer"
            });
            actions[1].push({
                title: "Change symbology",
                className: "esri-icon-edit",
                id: "change-symbology"
            });
            actions[1].push({
                title: "Change opacity",
                className: "esri-icon-visible",
                id: "change-opacity"
            });

            if(!app.settings.isWebsiteVersion){
                actions[1].push({
                    title: "Change query",
                    className: "esri-icon-filter",
                    id: "change-query"
                });
            }
            if((self.is3D || self.is3DFlat) && layer.type == "feature"){
                actions[1].push({
                    title: "Change elevation expression",
                    className: "esri-icon-polygon",
                    id: "change-elevation-expr"
                });
            }
        }
        else if(layer.parent.id === groupLayerOthers.id){
            actions = [[],[]];
            actions[0].push({
                title: "Remove",
                className: "esri-icon-close",
                id: "remove-other-layer"
            });
            actions[1].push({
                title: "Change opacity",
                className: "esri-icon-visible",
                id: "change-opacity"
            });
            actions[1].push({
                title: "Change query",
                className: "esri-icon-filter",
                id: "change-query"
            });
            if((self.is3D || self.is3DFlat) && layer.type == "feature"){
                actions[1].push({
                    title: "Change elevation expression",
                    className: "esri-icon-polygon",
                    id: "change-elevation-expr"
                });
            }
        }
        else if(layer.parent.id === groupLayerWork.id){
            actions = [[],[]];
            actions[0].push({
                title: "Remove",
                className: "esri-icon-close",
                id: "remove-work-layer"
            });
            actions[1].push({
                title: "Change opacity",
                className: "esri-icon-visible",
                id: "change-opacity"
            });
            actions[1].push({
                title: "Change query",
                className: "esri-icon-filter",
                id: "change-query"
            });
            actions[1].push({
                title: "Change symbology",
                className: "esri-icon-edit",
                id: "change-symbology"
            });
        }
        
        item.actionsSections = actions;

        if (item.layer.type != "group"){
            item.panel = {
                content: "legend",
                open: false
            };
        }
    
    }

    /*
    *   Handles the actions link to every layer/group layer in the layer list.
    */
    var layerListActionsHandler = function(event){
        var id = event.action.id;
        var layer = event.item.layer;
        if(id === "change-symbology"){
            require(["app/modules/symbologyTool"], function(symbologyTool){
                symbologyTool.init(app, layer);
            });
        }
        else if(id === "pin-layer"){
            require(["app/modules/pinLayerTool"], function(pinLayerTool){
                pinLayerTool.init(app, layer);
            });
        }
        else if(id === "remove-operational-layer"){
            groupLayerOperational.remove(layer);
            app.settings.removeLayerFromSessionStorage(layer.id, "operationalLayers");
            self.addedLayerIds.splice(self.addedLayerIds.findIndex(l => l === layer.id),1);
        }
        else if(id === "remove-other-layer"){
            groupLayerOthers.remove(layer);
            app.settings.removeLayerFromSessionStorage(layer.id, "otherLayers");
            self.addedLayerIds.splice(self.addedLayerIds.findIndex(l => l === layer.id),1);
        }
        else if(id === "remove-work-layer"){
            self.removeFromElevationLayerIDs(layer.id);
            groupLayerWork.remove(layer);
            app.settings.removeWorkLayerFromLocalStorage(layer.id);
        }
        else if(id === "change-opacity"){
            self.activateOpacityWidget(layer);
        }
        else if(id === "change-query"){
            require(["app/modules/queryTool"], function(queryTool){
                queryTool.init(app, layer);
            });
        }
        else if(id === "change-elevation-expr"){
            require(["app/modules/layerElevationExprTool"], function(layerElevationExprTool){
                layerElevationExprTool.init(app, layer);
            });
        }
    }

    /*
    *   Handles the actions link to every popups.
    */
    var popupActionsHandler = function(event){
        var id = event.action.id;
        var feature = self.mapView.popup.selectedFeature;

        if(id === "ptf-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.PTF_REF;
            if (app.settings.isWebsiteVersion) {
                //Send to Dashboard
                window.parent.displayInspectPtf(objectRef);
            }
            else{
                window.open(app.config.URL_INSPECT_PTF.replace("{PTF_REF}", objectRef));
            }
        }
        else if(id === "cruise-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.ID;
            if (app.settings.isWebsiteVersion){
                //Send to Dashboard
                window.parent.openInspectCruise(objectRef);
            }
            else{
                objectRef = feature.attributes.REF;
                window.open(app.config.URL_INSPECT_CRUISE.replace("{REF}", objectRef));
            }
        }
        else if(id === "line-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.ID;
            if (app.settings.isWebsiteVersion){
                //Send to Dashboard
                window.parent.openInspectLine(objectRef);
            }
            else{
                objectRef = feature.attributes.NAME;
                window.open(app.config.URL_INSPECT_LINE.replace("{NAME}", objectRef));
            }
        }
        else if(id === "ptf-argo-observations"){
            // Show observations Argo PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "argo" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === "argo" && x.type === app.config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-glider-observations"){
            // Show observations Argo PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "gliders" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === "gliders" && x.type === app.config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-argo-data"){
            // Show Argo data
            if(!(self.is3D || self.is3DFlat)){
                app.displayAlert("Limited display functionalities", "You can switch to a 3D projection to benefit from the 'in-depth' experience.");
            }
            var objectRef = feature.attributes.PTF_REF;
            require([
                "app/modules/dataDisplay"
            ], function(dataDisplay){
                dataDisplay.init(app);
                dataDisplay.displayDataArgo(objectRef, "SEA TEMPERATURE", null);                    
            });
        }
        else if(id === "ptf-oceansites-sensors"){
            // Show OceanSITES sensors
            if(self.is3D || self.is3DFlat){
                var objectRef = feature.attributes.PTF_REF;
                require([
                    "app/modules/sensorDisplay"
                ], function(sensorDisplay){
                    sensorDisplay.init(app);
                    sensorDisplay.displaySensorsOceanSITES(objectRef);                    
                });
            }
            else{
                app.displayAlert("Not available", "Please switch to 3D view to enable this functionality.");
            }
        }
        else if(id === "ptf-argo-data-cycle"){
            // Show Argo data
            if(self.is3D || self.is3DFlat){
                var objectRef = feature.attributes.PTF_REF;
                var cycleNb = feature.attributes.CYCLE_NB;
                require([
                    "app/modules/dataDisplay"
                ], function(dataDisplay){
                    dataDisplay.init(app);
                    dataDisplay.displayDataArgo(objectRef, "SEA TEMPERATURE", cycleNb);                    
                });
            }
            else{
                app.displayAlert("Not available", "Please switch to 3D view to enable this functionality.");
            }
        }
        else if(id === "ptf-dbcp-observations"){
            // Show observations DBCP PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "dbcp" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === "dbcp" && x.type === app.config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-sot-observations"){
            // Show observations SOT PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "sot" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                showObservations(fLayerObs, objectRef);
            }
        }
        else if(id === "cruise-geodesic-densify"){
            require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.cruiseGeodesicDensify(feature);                    
            });
        }
        else if(id === "cruise-densify"){
            require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.cruiseDensify(feature);
            });
        }
        else if(id === "cruise-submit"){
            require([
                "esri/geometry/support/webMercatorUtils"
            ], function(webMercatorUtils){
                var geom = webMercatorUtils.webMercatorToGeographic(feature.geometry);      
                app.appInterface.openCruiseForm(app.utils.polylineJsonToWKT(geom));            
            });
        }
        else if(id === "ptf-submit"){
            var lat = document.getElementById("gisLat").value;
            var lon = document.getElementById("gisLon").value;
            var wmo = document.getElementById("gisWmo").value;
            var internalId = document.getElementById("gisInternalId").value;
            var draftId = null;
            if(feature.attributes){
                draftId = feature.attributes["draftId"];
            }
            app.appInterface.openPtfForm(draftId, wmo, lat, lon, internalId);
        }
        else if(id === "edit-graphic"){
            require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.updateGeometryGraphic(feature);
            });
        }
        else if(id === "delete-draft"){
            require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.deleteDraft(feature);
            });
        }
    }


    var showObservations = function(srcLayerInfo, objectRef){
        var layerId = srcLayerInfo.id + "_" + objectRef;
        require(["esri/PopupTemplate",
                "esri/layers/FeatureLayer", 
                "esri/symbols/support/jsonUtils",
                "esri/renderers/SimpleRenderer"], function(PopupTemplate, FeatureLayer, SymbolJsonUtils, SimpleRenderer){
            var layerName = objectRef + " observations";
            var existingLayer = self.mapView.map.findLayerById(layerId);

            if(!existingLayer){
                var whereClause = srcLayerInfo.idField + "='" + objectRef + "'";                
                var renderer = new SimpleRenderer({symbol: app.config.OBSERVATIONS_SYMBOL, label: "Observation"});
                self.addWorkLayer(layerId, srcLayerInfo.id, layerName, renderer, whereClause, true);
            }
            else{
                existingLayer.visible = true;
            }
        });
        return layerId;
    }

    var showTrackline = function(srcLayerInfo, objectRef){
        var layerId = srcLayerInfo.id + "_" + objectRef;
        require(["esri/PopupTemplate",
                "esri/layers/FeatureLayer", 
                "esri/symbols/support/jsonUtils",
                "esri/renderers/SimpleRenderer"], function(PopupTemplate, FeatureLayer, SymbolJsonUtils, SimpleRenderer){
            var layerName = objectRef + " trackline";
            var existingLayer = self.mapView.map.findLayerById(layerId);

            if(!existingLayer){
                var whereClause = srcLayerInfo.idField + "='" + objectRef + "'";
                var symbol = SymbolJsonUtils.fromJSON(app.config.TRACKLINE_SYMBOL);

                var popupTemplate = null;
                if(srcLayerInfo.popupTitle && srcLayerInfo.popupContent){
                    var popupOptions = {title: srcLayerInfo.popupTitle, content: srcLayerInfo.popupContent};
                    if(srcLayerInfo.popupFieldInfos){
                        popupOptions["fieldInfos"] = srcLayerInfo.popupFieldInfos;
                    }
                    popupTemplate = new PopupTemplate(popupOptions);
                }
                else{
                    popupTemplate = new PopupTemplate({title: app.config.POPUP_TRACKLINE_LAYERS_TITLE, content: app.config.POPUP_TRACKLINE_LAYERS_CONTENT});
                }

                // Create the layer
                var tracklineLayer = new FeatureLayer({
                    id : layerId,
                    url: srcLayerInfo.url,
                    outFields : ["*"],
                    title: layerName,
                    popupTemplate : popupTemplate,
                    definitionExpression: whereClause,
                    renderer: new SimpleRenderer({symbol: symbol}),
                    elevationInfo: {
                        mode: "absolute-height",
                        offset: 0,
                        featureExpressionInfo: {
                            expression: "0"
                        },
                        unit: "meters"
                    }
                });

                groupLayerWork.add(tracklineLayer);
            }
            else{
                existingLayer.visible = true;
            }
        });
        return layerId;
    }

    var addCloseWidgetButton = function(position){
        closeWidgetButton = document.createElement("div");
        closeWidgetButton.classList.add("esri-icon-close");
        closeWidgetButton.classList.add("action-button");
        closeWidgetButton.classList.add("esri-widget--button");
        closeWidgetButton.classList.add("esri-widget");
        closeWidgetButton.classList.add("esri-interactive");
        closeWidgetButton.setAttribute("role", "button");
        closeWidgetButton.addEventListener("click", function(){
            self.deactivateCurrentTool();
        });
        if(position){
            self.mapView.ui.add(closeWidgetButton, position);
        }
        else{
            self.mapView.ui.add(closeWidgetButton, "bottom-left");
        }
    }
    /*
    *   Remove the current custom close button from the UI.
    */
    var removeCloseWidgetButton = function(){
        if(closeWidgetButton){
            self.mapView.ui.remove(closeWidgetButton);
            closeWidgetButton = null;
        }
    };

    /*
    *   Add an tool result section on the UI of the map
    *   options is a javascript object containing a title and a text : {title: "My Title", text: "My Text"}
    *
    */
    var addToolResultPanel = function(options){
        var id = "widgetpanel-" + widgetIteration.toString();
        if(currentResultPanel){
            removeResultPanel(currentResultPanel);
        }
        if(!options.position || (options.position == "bottom-left")){
            addCloseWidgetButton();
        }
        
        currentResultPanel = document.createElement("div");
        currentResultPanel.id = id;
        currentResultPanel.classList.add("esri-widget");
        currentResultPanel.classList.add("esri-widget-custom");
        currentResultPanel.classList.add("esri-component");
        currentResultPanel.classList.add("esri-widget--panel");
        currentResultContainer = document.createElement("div");
        var divPanelHeading = document.createElement("header");
        divPanelHeading.classList.add("custom-widget-header");
        divPanelHeading.innerHTML = options.title;

        var divPanelBody = document.createElement("div");
        if(options.text){
            divPanelBody.innerHTML = options.text + "<span class=\"esri-icon-loader esri-icon-loading-indicator\" id=\"result-panel-result-loader\" style=\"visibility: hidden;\"></span><span class=\"result-panel-result\"></span>";
        }
        else if(options.htmlContent){
                divPanelBody.innerHTML = options.htmlContent;
        }
        else if(options.htmlElement){
                divPanelBody.appendChild(options.htmlElement);
        }

        currentResultContainer.appendChild(divPanelHeading);
        currentResultContainer.appendChild(divPanelBody);

        currentResultPanel.appendChild(currentResultContainer);

        if(options.position){
            self.mapView.ui.add(currentResultPanel, options.position);
            addCloseWidgetButton({position: options.position});
        }
        else{
            self.mapView.ui.add(currentResultPanel, "bottom-left");
        }
        widgetIteration++;
        return id;
    };

    /*
    *   Remove the current result panel from the UI.
    */
    var removeResultPanel = function(){
        if(currentResultPanel){
            self.mapView.ui.remove(currentResultPanel);
            currentResultPanel = null;
        }
        removeCloseWidgetButton();
    };


    /*
    *   Initialize the operational layers.
    */
    var initOperationalLayers = function(){
        require([
            "esri/layers/GroupLayer"
            ], function(GroupLayer){
                groupLayerOperational = new GroupLayer({
                    title: "Operational layers",
                    visibility: true,
                    visibilityMode: "independent"
                });

                // Ordering default layers
                var operationalLayers = app.config.operationalLayers.sort((la, lb) => la.index - lb.index);

                for(var i = 0; i < operationalLayers.length; i++){
                    var layer = operationalLayers[i];

                    var visible = layer.visible;
                    
                    if(visible && (app.settings.theme == layer.theme || layer.theme == "all") && layer.type !== app.config.TYPE_OBS_PTF) {
                        self.addOperationalLayer(layer.id);
                    }
                }
                self.mapView.map.add(groupLayerOperational);

                // Read session storage
                app.settings.restoreLayersFromSessionStorage("operationalLayers");
        });
    };


    /*
    *   Initialize the work layers.
    */
    var initWorkLayers = function(){
        require([
            "esri/layers/GroupLayer",
            "esri/layers/FeatureLayer"
            ], function(GroupLayer, FeatureLayer){
            groupLayerWork = new GroupLayer({
                title: "Work layers",
                visibility: true,
                visibilityMode: "independent"
            });
            self.mapView.map.add(groupLayerWork);

            if(app.settings.platformTrack && app.settings.theme != app.config.THEME_ALL){
                var objectRef = app.settings.platformTrack;
                // Show observations DBCP PTF
                var fLayerObs = app.config.operationalLayers.find(x => x.theme === app.settings.theme && x.type === app.config.TYPE_OBS_PTF);
                if(fLayerObs){
                    showObservations(fLayerObs, objectRef);
                }
    
                var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === app.settings.theme && x.type === app.config.TYPE_TRACKLINE);
                if(fLayerTrackline){
                    showTrackline(fLayerTrackline, objectRef);
                }
            }

            // Read local storage
            app.settings.restoreWorkLayersFromLocalStorage();
        });
    };

    /*
    *   Initialize the other layers.
    */
    var initOtherLayers = function(){
        require([
            "esri/layers/GroupLayer",
            "esri/layers/MapImageLayer",
            "esri/PopupTemplate"
            ], function(GroupLayer, MapImageLayer, PopupTemplate){
            groupLayerOthers = new GroupLayer({
                title: "Other layers",
                visibility: true,
                visibilityMode: "independent"
            });
            //self.mapView.map.add(groupLayerOthers);

            // Ordering layers
            var layers = app.config.dynamicLayers;
            layers.sort(function(a, b){
                return a.index  - b.index;
            });
            var time = 100;
            for(var i = 0; i < layers.length; i++){
                var layer = layers[i];
                if(layer.visible && (app.settings.theme == app.config.THEME_ALL ||
                    app.settings.theme == layer.theme ||
                    layer.theme == app.config.THEME_ALL))
                {
                    self.addOtherLayer(layer.id);
                }
            }
            
            self.mapView.map.add(groupLayerOthers);
            // Read session storage
            app.settings.restoreLayersFromSessionStorage("otherLayers");
        });
    };

    // ========================================================================
    // Public
    // ========================================================================
    // Remote geometry service
    self.geometryService = null;
    // Bathymetry layer, for elevation
    self.bathymetryLayer = null;
    // Indicates if the current projection is 3D
    self.is3D = false;
    // Indicates if the current projection is 3D-flat
    self.is3DFlat = false;
    // Exaggeration coeficient
    self.exaggerationCoef = 10;
    // Sketch layer
    self.sketchLayer = null;
    // Reference to added layers
    self.addedLayerIds = [];

    /*
    *   Initiates the map components.
    */
    self.init = function(appInstance) {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/views/SceneView",
            "esri/geometry/SpatialReference",
            "esri/geometry/Extent",
            "esri/layers/MapImageLayer",
            "esri/Ground",
            "esri/layers/BaseElevationLayer",
            "esri/layers/ElevationLayer",
            "esri/tasks/GeometryService",
            "esri/widgets/LayerList",
            "esri/layers/GroupLayer",
            "esri/layers/FeatureLayer",
            "esri/widgets/Print",
            "esri/widgets/TimeSlider",
            "esri/widgets/Home",
            "esri/widgets/CoordinateConversion",
            "esri/widgets/Sketch",
            "esri/layers/GraphicsLayer"
            ], function(Map, MapView, SceneView, SpatialReference, Extent, MapImageLayer, Ground, BaseElevationLayer, ElevationLayer, GeometryService, LayerList, GroupLayer, FeatureLayer, Print, TimeSlider, Home, CoordinateConversion, Sketch, GraphicLayer){
                app = appInstance;
                // Setting geometry service
                self.geometryService = new GeometryService({url: app.config.GEOMETRY_SERVICE});
                // Init sketch layer
                self.sketchLayer = new GraphicLayer({
                    id: "sketchLayer",
                    title: "Draft layer"
                });

                var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
                    properties: {
                        // exaggerates the actual elevations by 100x
                        exaggeration: self.exaggerationCoef
                    },

                    load: function() {
                        this._elevation = new ElevationLayer({
                            url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"
                        });

                        // wait for the elevation layer to load before resolving load()
                        this.addResolvingPromise(this._elevation.load());
                    },

                    // Fetches the tile(s) visible in the view
                    fetchTile: function(level, row, col, options) {
                        return this._elevation.fetchTile(level, row, col, options).then(function(data) {
                                var exaggeration = this.exaggeration;
                                data.values.forEach(function(value, index, values) {
                                    values[index] = value * exaggeration;
                                });

                                return data;
                            }.bind(this));
                    }
                });
                // Setting bathymetry layer
                self.bathymetryLayer = new ElevationLayer({url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"});
                self.exaggeratedBathyLayer = new ExaggeratedElevationLayer();

				var highlightOptions = null;
				if(app.settings.highlight){
					highlightOptions = {
						color: "#1423FC",
						fillOpacity: 1,
						haloColor: "#000000",
						haloOpacity: 0
					}
				}
				
                if (app.settings && app.settings.projection && app.settings.projection == "3D") {
                    // 3D view
                    var mapParams = {};
                    if(app.settings.basemap){
                        var basemap = app.settings.getBasemapFromID(app.settings.basemap);
                        mapParams["basemap"] = basemap;
                        mapParams["ground"] = new Ground({
                            layers: [self.exaggeratedBathyLayer]
                        });
                    }
                    var map = new Map(mapParams);
					var mapViewParams = {
                        container: "mapViewDiv",
                        map: map,
                        environment: {
                            atmosphereEnabled: true,
                            atmosphere: {
                                quality: "low",
                                starsEnabled: true
                            },
                            lighting: {
                                directShadowsEnabled: false,
                                ambientOcclusionEnabled: false,
                                cameraTrackingEnabled: true
                            }
                        }
                    };
					if(highlightOptions){
						mapViewParams["highlightOptions"] = highlightOptions;
					}
                    self.mapView = new SceneView(mapViewParams);

                    self.is3D = true;
                } else if (app.settings && app.settings.projection && app.settings.projection == "3D-flat") {
                    // 3D-flat view
                    var mapParams = {};
                    if(app.settings.basemap){
                        var basemap = app.settings.getBasemapFromID(app.settings.basemap);
                        mapParams["basemap"] = basemap;
                        mapParams["ground"] = new Ground({
                            layers: [self.exaggeratedBathyLayer]
                        });
                    }
                    var map = new Map(mapParams);  
					var mapViewParams = {
                        container: "mapViewDiv",
                        map: map,
                        viewingMode: "local",
                        environment: {
                            background: {
                                type: "color",
                                color: [255, 255, 255, 1]
                            },
                            starsEnabled: false,
                            atmosphereEnabled: false
                        },
                        scale: 64360000
                    };
					if(highlightOptions){
						mapViewParams["highlightOptions"] = highlightOptions;
					}
                    self.mapView = new SceneView(mapViewParams);

                    self.is3DFlat = true;
                } else {
                    // 2D view
                    var mapParams = {};
                    var mapViewParams = {
                        container: "mapViewDiv",
                    };

                    // Reading start settings
                    if(app.settings){
                        if(app.settings.projection){
                            // Setting projection
                            var projection = app.settings.getProjectionFromID(app.settings.projection);
                            var spatialRef = SpatialReference.fromJSON(projection.spatialReference);

                            var newExtent = Extent.fromJSON({
                                "spatialReference": projection.spatialReference,
                                "xmin": projection.xmin,
                                "xmax": projection.xmax,
                                "ymin": projection.ymin,
                                "ymax": projection.ymax
                            });

                            mapViewParams["extent"] = newExtent;
                            mapViewParams["spatialReference"] = spatialRef;
                            mapViewParams["highlightOptions"] = highlightOptions;
                        }
                        if(app.settings.basemap){
                            // Setting basemap
                            var basemap = app.settings.getBasemapFromID(app.settings.basemap);
                            if((!mapViewParams["spatialReference"]) || (mapViewParams["spatialReference"] && mapViewParams["spatialReference"].isWebMercator)){
                                // WebMercator, basemap will be automatically managed
                                mapParams["basemap"] = basemap;
                            }
                            else{
                                // Other projection. Basemap has to be loaded as a classic layer
                                if(basemap.resourceInfo.data.baseMapLayers.length > 1){
                                    // Multiple-layer basemap
                                    basemapMapImageLayer = new GroupLayer({
                                        id: basemap.id,
                                        title: basemap.title
                                    });
                                    for(var i = 0; i<basemap.resourceInfo.data.baseMapLayers.length; i++){
                                        basemapMapImageLayer.add(new MapImageLayer({
                                            id: basemap.resourceInfo.data.baseMapLayers[i].id,
                                            url: basemap.resourceInfo.data.baseMapLayers[i].url,
                                            title: basemap.resourceInfo.data.baseMapLayers[i].title,
                                            sublayers: [{
                                                id: 0,
                                                title: basemap.resourceInfo.data.baseMapLayers[i].title,
                                                legendEnabled: false
                                            }]
                                        }));
                                    }
                                }
                                else{
                                    // Single layer basemap
                                    basemapMapImageLayer = new MapImageLayer({
                                        id: basemap.id,
                                        url: basemap.resourceInfo.data.baseMapLayers[0].url,
                                        title: basemap.resourceInfo.data.baseMapLayers[0].title,
                                        sublayers: [{
                                            id: 0,
                                            title: basemap.resourceInfo.data.baseMapLayers[0].title,
                                            legendEnabled: false
                                        }]
                                    });
                                }
                                // Adding the basemape layer to the map
                                mapParams["layers"] = [basemapMapImageLayer];
                            }
                            // In both case, saving basemap ID
                            basemapID = basemap.id;
                        }
                    }
					
					if(highlightOptions){
						mapViewParams["highlightOptions"] = highlightOptions;
					}
                    // Creating the map
                    mapViewParams["map"] = new Map(mapParams);
                    // Creating the 2D view
                    self.mapView = new MapView(mapViewParams);
                }

                // Watching for layer addition
                self.mapView.map.allLayers.on("change", function (event) {
                    if (event.added.length > 0) {
                        event.added.forEach(function (layer) {
                            if(layer.loaded){
                                if(layer.timeInfo){
                                    layer.useViewTime = layer.timeInfo.useTime;
                                    if(layer.timeInfo){
                                        if(!app.settings.platformTrack){
                                            self.mapView.ui.add(app.controllers.mapMenu.timeToolLink, {position: "top-left"});
                                        }
                                        self.updateFullTimeExtent();
                                    }
                                }
                            }
                            else{
                                layer.when(function(){
                                    if(layer.timeInfo){
                                        layer.useViewTime = layer.timeInfo.useTime;
                                        if(layer.timeInfo){
                                            if(!app.settings.platformTrack){
                                                self.mapView.ui.add(app.controllers.mapMenu.timeToolLink, {position: "top-left"});
                                            }
                                            self.updateFullTimeExtent();
                                        }
                                    }
                                })
                            }
                        });
                    }
                    // Removing time slider if not time layer
                    if (event.removed.length > 0) {
                        var timeEnabled = false;                        
                        self.mapView.map.allLayers.forEach(function (layer) {
                            timeEnabled = layer.useViewTime;
                        });
                        if(!timeEnabled){
                            self.activateTimeWidget(false);                           
                            self.mapView.ui.remove(app.controllers.mapMenu.timeToolLink, {position: "top-left"});
                        }
                    }
                  });

                // Handling loader based on the map status (do not control rendering time)
                self.mapView.watch("updating", function(newValue, oldValue, property, object) {
                    if(newValue){
                        app.setMainLoading(true);
                    }
                    else{
                        app.setMainLoading(false);
                    }
                });

                self.mapView.when(function(instance){
                    // Popup actions event
                    self.mapView.popup.on("trigger-action", popupActionsHandler);

                    // Initializing layers (order is important here, adding the bottom ones first)
                    initOtherLayers();
                    initOperationalLayers();
                    initWorkLayers();

                    // Initializing layer list, printer and coordinates
                    layerList = new LayerList({
                        id: "layerList",
                        view: self.mapView,
                        selectionEnabled: true,
                        listItemCreatedFunction: defineLayerListActions
                    });
                    layerList.on("trigger-action", layerListActionsHandler);
                    printer = new Print({
                        view: self.mapView,
                        templateOptions: {
                            copyright: "OceanOPS",
                            layout: "OceanOPS A4 landscape",
                            dpi: "300"
                        },
                        portal: app.config.PORTAL_URL
                    });
                    var today = new Date();
                    var defaultFullTimeExtent = {
                        start: new Date(1995, 0, 1),
                        end: new Date()
                    }
                    if(!fullTimeExtent){
                        timeExtent = defaultFullTimeExtent;
                    }
                    else{
                        timeExtent = fullTimeExtent;
                    }
                    timeSlider = new TimeSlider({
                        container: "timeSlider",
                        view: self.mapView,
                        //layout: "compact",
                        mode: "time-window",
                        fullTimeExtent: timeExtent,
                        stops: {
                            interval: {
                              value: 1,
                              unit: "months"
                            }
                        },
                        timeExtent:{
                            start: new Date(today.getFullYear()-1,today.getMonth(), today.getDate()),
                            end: today
                        }
                      });
                      
                    coordinates = new CoordinateConversion({
                        view: self.mapView
                    });

                    sketchWidget = new Sketch({
                        view: app.controllers.map.mapView,
                        layer: app.controllers.map.sketchLayer,
                        availableCreateTools: ["point", "polyline"],
                        creationMode: "single"
                    });
                    
                    if(app.settings.isWebsiteVersion){
                        var mapOff = document.createElement("div");
                        mapOff.className = "esri-component esri-widget--button esri-widget";
                        mapOff.setAttribute("title","Turn off map");
                        mapOff.innerHTML = "<span aria-hidden=\"true\" class=\"esri-icon esri-icon-non-visible\"></span>" + 
                            "<span class=\"esri-icon-font-fallback-text\">Turn off map</span>";
                        mapOff.onclick = function(){
                            parent.$("#watermark-container").show();
                            $(".esri-ui-corner").css("visibility", "hidden");
                            $('#standby-btn').hide();
    
                            // EMPTY GIS SAMPLES TO CLEAR MAP BEHIND MASK
                            window.GISViewer.objectsChanged([], 'platform');
                            setTimeout(function(){
                                parent.App.config.emptyGisSample = true;
                            },2000);
                        };
                        self.mapView.ui.add([mapOff], "top-left");
                    }
                    
                    if(self.mapView.type == "2d"){
                        var defaultExtent = new Home({
                            id: "default-extent",
                            view: self.mapView
                        });
                        var dataExtent = document.createElement("div");
                        dataExtent.className = "esri-component esri-widget--button esri-widget";
                        dataExtent.setAttribute("title","Data extent");
                        dataExtent.innerHTML = "<span aria-hidden=\"true\" class=\"esri-icon esri-icon-zoom-in-fixed\"></span>" + 
                            "<span class=\"esri-icon-font-fallback-text\">Data extent</span>";
                        dataExtent.onclick = function(){ setExtent("data-extent");};
                        if(!app.settings.platformTrack){
                            self.mapView.ui.add([defaultExtent, dataExtent], "top-left");
                        }
                        else{
                            self.mapView.ui.add([dataExtent], "top-left");
                        }
                    }

                    self.mapView.popup.dockOptions["position"] = "bottom-center";
                    self.mapView.popup.defaultPopupTemplateEnabled = true;
                    
                    self.mapView.popup.watch("selectedFeature", function(graphic) {
                        if(graphic){
                            if(graphic.layer){
                                var layer = app.config.operationalLayers.find(l => l.id === graphic.layer.id);
                                if(layer){
                                    if(layer.type == app.config.TYPE_PTF && layer.theme == app.config.THEME_ALL){
                                        if (graphic) {
                                            var graphicTemplate = graphic.getEffectivePopupTemplate();
                                            if(graphicTemplate){
                                                if(graphicTemplate.actions){
                                                    if(graphicTemplate.actions.items.length > 1){
                                                        graphicTemplate.actions.items[1].visible = graphic.attributes.MASTER_PROGRAM == "Argo" ? true : false;
                                                    }
                                                    if(graphicTemplate.actions.items.length > 2){
                                                        graphicTemplate.actions.items[2].visible = graphic.attributes.MASTER_PROGRAM == "Argo" ? true : false;
                                                    }
                                                    if(graphicTemplate.actions.items.length > 3){
                                                        graphicTemplate.actions.items[3].visible = graphic.attributes.NETWORK.indexOf("OceanSITES") != -1 ? true : false;
                                                    }
                                                    if(graphicTemplate.actions.items.length > 4){
                                                        graphicTemplate.actions.items[4].visible = graphic.attributes.NETWORK.indexOf("SOT") != -1 ? true : false;
                                                    }
                                                    if(graphicTemplate.actions.items.length > 5){
                                                        graphicTemplate.actions.items[5].visible = graphic.attributes.NETWORK.indexOf("DBCP") != -1 ? true : false;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });


                    self.layerList = layerList;

                    if(!app.settings.platformTrack){
                        app.controllers.mapMenu.init(app);
                    }
                    else{
                        setExtent("data-extent");
                    }

                    app.mapLoaded();
                });                
        });
    };

    self.changeBathyExaggerationCoef = function(coef){
        require([
            "esri/Ground",
            "esri/layers/BaseElevationLayer",
            "esri/layers/ElevationLayer"
            ], function(Ground, BaseElevationLayer, ElevationLayer){
                // Updating coeff
                self.exaggerationCoef = coef;
                // Regenerating elevation layer
                var ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
                    properties: {
                        // exaggerates the actual elevations by 100x
                        exaggeration: coef
                    },

                    load: function() {
                        this._elevation = new ElevationLayer({
                            url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"
                        });

                        // wait for the elevation layer to load before resolving load()
                        this.addResolvingPromise(this._elevation.load());
                    },

                    // Fetches the tile(s) visible in the view
                    fetchTile: function(level, row, col) {
                        return this._elevation.fetchTile(level, row, col)
                            .then(function(data) {

                                var exaggeration = this.exaggeration;
                                data.values.forEach(function(value, index, values) {
                                    values[index] = value * exaggeration;
                                });

                                return data;
                            }.bind(this));
                    }
                });

                self.exaggeratedBathyLayer = new ExaggeratedElevationLayer();

                self.mapView.map.ground = new Ground({
                layers: [self.exaggeratedBathyLayer]
                });
                // Updating elevation-based layers exageration
                self.updateElevationLayerInfo(coef);
            }
        );
    }

    self.switchLayerListVisibility = function(visible){
        if(visible){
            self.mapView.ui.add(layerList, "top-right");
        }
        else{
            self.mapView.ui.remove(layerList);   
        }
    }

    self.activateScreenshotTool = function(){
        if(!screenshotTool){
            self.deactivateCurrentTool();  
            require(["app/modules/ScreenshotTool"], function(ScreenshotTool){
                screenshotTool = new ScreenshotTool({view: self.mapView, sketchLayer: self.sketchLayer});
                self.mapView.ui.add(screenshotTool, {position: "bottom-left"});
                screenshotToolDisplayed = true;
            });
        }
        else{
            self.mapView.ui.remove(screenshotTool);
            screenshotTool.destroy();
            screenshotTool = null;
            screenshotToolDisplayed = false;
        }
    }

    /*
    *   Adds a layer to the work layer list
    */
    self.addWorkLayer = function(id, sourceLayerId, name, renderer, definitionExpression, visible){
        require([
            "esri/layers/FeatureLayer",
            "esri/PopupTemplate"], function(FeatureLayer, PopupTemplate){
            var layer = self.mapView.map.allLayers.items.find(l => l.id === sourceLayerId);
            var url, minScale = 0, maxScale = 0, labelingInfo, popupTemplate;
            if(layer){
                url = layer.url + "/" + layer.layerId;
                minScale = layer.minScale;
                maxScale = layer.maxScale;
                labelingInfo = layer.labelingInfo;
                popupTemplate = layer.popupTemplate;
            }
            else{
                layer = app.config.operationalLayers.find(l => l.id === sourceLayerId);
                url = layer.url;
                
                // Default popup templates
                var popupTemplatePtf = new PopupTemplate({title: app.config.POPUP_OPERATIONAL_PTF_TITLE, content: app.config.POPUP_OPERATIONAL_PTF_CONTENT});
                var popupTemplateObs = new PopupTemplate({title: app.config.POPUP_OBS_LAYERS_TITLE, content: app.config.POPUP_OBS_LAYERS_CONTENT});
                var popupTemplateTrackline = new PopupTemplate({title: app.config.POPUP_TRACKLINE_LAYERS_TITLE, content: app.config.POPUP_TRACKLINE_LAYERS_CONTENT});
                var popupTemplateDefault = new PopupTemplate({title: "Attributes", content: app.config.POPUP_OTHERS});
                // If min/max scale are defined, setting them
                if(layer.maxScale){
                    maxScale = layer.maxScale;
                }
                if(layer.minScale){
                    minScale = layer.minScale;
                }

                // Defining popup
                var popupTemplate = null;
                // If a template is defined for this layer, setting it up
                if (layer.popupTitle && layer.popupContent) {
                    var popupOptions = {title: layer.popupTitle, content: layer.popupContent};
                    if(layer.popupFieldInfos){
                        popupOptions["fieldInfos"] = layer.popupFieldInfos;
                    }
                    popupTemplate = new PopupTemplate(popupOptions);
                } else {
                    switch(layer.type){
                        case app.config.TYPE_PTF:
                            popupTemplate = popupTemplatePtf;
                            break;
                        case app.config.TYPE_OBS_PTF:
                            popupTemplate = popupTemplateObs;
                            break;
                        case app.config.TYPE_TRACKLINE:
                            popupTemplate = popupTemplateTrackline;
                            break;
                        default:
                            popupTemplate = popupTemplateDefault;
                    }
                }

                if(popupTemplate && layer.popupActions){
                    for(var j = 0; j < layer.popupActions.length; j++){
                        popupTemplate.actions = layer.popupActions;
                    }
                }
                else if(popupTemplate){
                    popupTemplate.actions = [{
                    "title": "Details page",
                    "id": "ptf-inspect",
                    "className": "esri-icon-review"
                    }];                      
                }
            }

            var featureLayer = new FeatureLayer({
                url: url,
                id : id,
                title: name,
                outFields : ["*"],
                minScale: minScale,
                maxScale: maxScale,
                visible : visible,
                labelingInfo: labelingInfo,
                popupTemplate : popupTemplate,
                renderer: renderer,
                definitionExpression: definitionExpression,
                legendEnabled: true,
                elevationInfo: {
                    mode: "absolute-height",
                    offset: 0,
                    featureExpressionInfo: {
                        expression: "0"
                    },
                    unit: "meters"
                }
            });

            self.addToWorkLayerList(featureLayer);

            featureLayer.watch("visible", function(newValue, oldValue, property, object){
                app.settings.updateLayerVisibilityToSessionStorage(object.id, newValue);
            });
            
        });
    };


    /*
    *   Set the basemap of the map. Do not use this at initialization since it can causes spatial reference misbehavior.
    */
    self.setBasemap = function(basemap) {
        require([
            "esri/layers/MapImageLayer",
            "esri/layers/GroupLayer"
            ], function(MapImageLayer, GroupLayer){
                if(!self.mapView.spatialReference || (self.mapView.spatialReference && self.mapView.spatialReference.isWebMercator)){
                    // WebMercator, we just have to change the basemap
                    self.mapView.map.basemap = basemap;
                }
                else{
                    // We have to handle the basemap as a classic layer
                    if(basemapMapImageLayer){
                        // If a basemap already exists, removing it
                        self.mapView.map.remove(basemapMapImageLayer);
                    }

                    if(basemap){
                        if(basemap.resourceInfo.data.baseMapLayers.length > 1){
                            // Multiple-layer basemap
                            basemapMapImageLayer = new GroupLayer({
                                id: basemap.id,
                                title: basemap.title
                            });
                            for(var i = 0; i<basemap.resourceInfo.data.baseMapLayers.length; i++){
                                basemapMapImageLayer.add(new MapImageLayer({
                                    id: basemap.resourceInfo.data.baseMapLayers[i].id,
                                    url: basemap.resourceInfo.data.baseMapLayers[i].url,
                                    title: basemap.resourceInfo.data.baseMapLayers[i].title,
                                    sublayers: [{
                                        id: 0,
                                        title: basemap.resourceInfo.data.baseMapLayers[i].title,
                                        legendEnabled: false
                                    }]
                                }));
                            }
                        }
                        else{
                            // Single layer basemap
                            basemapMapImageLayer = new MapImageLayer({
                                id: basemap.id,
                                url: basemap.resourceInfo.data.baseMapLayers[0].url,
                                title: basemap.title,
                                sublayers: [{
                                    id: 0,
                                    title: basemap.resourceInfo.data.baseMapLayers[0].title,
                                    legendEnabled: false
                                }]
                            });
                        }
                        // Adding the basemap to the bottom of the layer stack
                        self.mapView.map.add(basemapMapImageLayer, 0);
                    }
                }

                if(basemap){
                    // Setting basemap ID
                    basemapID = basemap.id;
                }
            }
        );
    };

    /**
     * 
     */
    self.addLogo = function(url){
        //self.mapView.ui.empty("top-right");
        self.mapView.ui.empty("bottom-right");
        var img = document.createElement("img");
        img.src = "//www.ocean-ops.org/static/images/oceanops/logos/oceanops-earth-ico-192.png";
        img.style.width = "50px";
        var img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "150px";
        self.mapView.ui.add(img, "bottom-right");
    }

    /*
    *   Set the current tool and add info and result panels.
    */
    self.setCurrentTool = function(tool, infoPanelContent, toolResultPanelContent){
        currentTool = tool;
        return self.setToolPanels(infoPanelContent, toolResultPanelContent);
    }

    /*
    *   Replace the info and result panels without changing the tool
    */
    self.setToolPanels = function(infoPanelContent, toolResultPanelContent){
        if(toolResultPanelContent){
            return addToolResultPanel(toolResultPanelContent);
        }
        else{
            removeResultPanel();
            return null;
        }
    }

    /*
    *   Deactivate the current tool and remove the info and result panels.
    */
    self.deactivateCurrentTool = function(){
        if(currentTool){
            currentTool.deactivate();
            removeResultPanel();
            currentTool = null;
        }
        else if(self.isMeasurementsWidgetActivated()){
            self.activateMeasurementsWidget(false, "distance");
            self.activateMeasurementsWidget(false, "area");
        }
        else if(self.isPrintWidgetActivated()){
            self.activatePrintWidget(false);
        }
        else if(self.isTimeWidgetActivated()){
            self.activateTimeWidget(false);
        }

        
        document.getElementById('moreToolsContent').querySelectorAll("a").forEach(function(elt){
            if(elt.id != "photoLink" && elt.id != "coordinatesLink"){
                elt.classList.remove("active");
            }
        });
        document.getElementById('moreToolsContent').querySelectorAll("button").forEach(function(elt){
            elt.classList.remove("active");
        });

        app.controllers.mapMenu.updateExpandLabelTools();
    }

    /*
    *   Activate the print widget
    */
    self.activatePrintWidget = function(displayed){
        if(displayed){
            self.deactivateCurrentTool();
            addCloseWidgetButton();
            self.mapView.ui.add(printer, {position: "bottom-left"});
        }
        else{
            self.mapView.ui.remove(printer);
            removeCloseWidgetButton();
        }
        printerDisplayed = displayed;
    }

    self.isPrintWidgetActivated = function(){
        return printerDisplayed;
    }

    
    /*
    *   Activate the time widget
    */
   self.activateTimeWidget = function(displayed){
        if(displayed){
            self.deactivateCurrentTool();
            if(document.getElementById("timeSlider")){
                document.getElementById("timeSlider").style.visibility = "visible";
            }            
            //addCloseWidgetButton();
            self.mapView.ui.add(timeSlider, {position: "manual"});
        }
        else{
            self.mapView.ui.remove(timeSlider);
            //removeCloseWidgetButton();
        }
        timeSliderDisplayed = displayed;
    }

    self.isTimeWidgetActivated = function(){
        return timeSliderDisplayed;
    }

     
    /*
    *   Activate the opacity widget
    */
   self.activateOpacityWidget = function(layer){
        if(!opacitySlider){
            self.deactivateCurrentTool();  
            require(["app/modules/OpacitySlider"], function(OpacitySlider){
                opacitySlider = new OpacitySlider({layer: layer});
                self.mapView.ui.add(opacitySlider, {position: "top-right"});
                opacitySliderDisplayed = true;
            });
        }
        else{
            var changeLayer = layer.id != opacitySlider.layer.id;
            self.mapView.ui.remove(opacitySlider);
            opacitySlider.destroy();
            opacitySlider = null;
            opacitySliderDisplayed = false;
            if(changeLayer){
                self.activateOpacityWidget(layer);
            }
        }
    }

self.isOpacityWidgetActivated = function(){
    return opacitySliderDisplayed;
}

    /*
    *   Activate the measurement widget
    */
    self.activateMeasurementsWidget = function(displayed, type){
        require([
            "esri/widgets/DistanceMeasurement2D",
            "esri/widgets/AreaMeasurement2D",
            "esri/widgets/DirectLineMeasurement3D",
            "esri/widgets/AreaMeasurement3D"
        ], function(DistanceMeasurement2D, AreaMeasurement2D, DirectLineMeasurement3D, AreaMeasurement3D){
            var measurementWidget;
            if(type === "distance"){
                if(self.is3D || self.is3DFlat){
                    if(!measurementWidgetDistance3D){
                        measurementWidgetDistance3D = new DirectLineMeasurement3D({
                            view: self.mapView
                        });
                    }
                    
                    measurementWidget = measurementWidgetDistance3D;
                }
                else{
                    if(!measurementWidgetDistance2D){
                        measurementWidgetDistance2D = new DistanceMeasurement2D({
                            view: self.mapView
                        });
                    }
                    measurementWidget = measurementWidgetDistance2D;
                }
            }
            else if(type === "area"){
                if(self.is3D || self.is3DFlat){
                    if(!measurementWidgetArea3D){
                        measurementWidgetArea3D = new AreaMeasurement3D({
                            view: self.mapView
                        });
                    }
                    measurementWidget = measurementWidgetArea3D;
                }
                else{
                    if(!measurementWidgetArea2D){
                        measurementWidgetArea2D = new AreaMeasurement2D({
                            view: self.mapView
                        });
                    }
                    measurementWidget = measurementWidgetArea2D;
                }
            }
            if(displayed){
                self.deactivateCurrentTool();
                addCloseWidgetButton();
                self.mapView.ui.add(measurementWidget, {position: "bottom-left"});
            }
            else{
                self.mapView.ui.remove(measurementWidget);
                removeCloseWidgetButton();
            }
            measurementsDisplayed = displayed;
        });
    }

    self.isMeasurementsWidgetActivated = function(){
        return measurementsDisplayed;
    }

    /*
    *   Activate the coordinates widget
    */
    self.activateCoordinatesWidget = function(displayed){
        if(displayed){
            self.mapView.ui.add(coordinates, {position: "bottom-right"});
        }
        else{
            self.mapView.ui.remove(coordinates);
        }
        coordinatesDisplayed = displayed;
    }

    self.isCoordinatesWidgetActivated = function(){
        return coordinatesDisplayed;
    }

    /*
    *   Activate the sketch widget
    */
    self.activateSketchWidget = function(displayed){
        if(displayed){
            self.mapView.ui.add(sketchWidget, {position: "bottom-left", index: 1});
            self.toggleSketchLayer(displayed);
        }
        else{
            self.mapView.ui.remove(sketchWidget);
        }
        sketchWidgetDisplayed = displayed;
        return sketchWidget; 
    }

    self.isSketchWidgetActivated = function(){
        return sketchDisplayed;
    }

    /*
    *   Activate custom widget
    */
    self.activateCustomWidget = function(displayed, tool){
        self.deactivateCurrentTool();
        if(displayed){
            tool.init(app);
        }
        
        customToolDisplayed = displayed;
    }

    self.isCustomWidgetActivated = function(){
        return customToolDisplayed;
    }

    /**
    *   Apply a filter on each layer of the given feature types
    */
    self.applyFilterLayers = function(filterInfo, featureType) {
        var layerList = null;
        if(featureType == app.config.TYPE_OBS){
            var displayObs = filterInfo && typeof(filterInfo) === "object" && filterInfo.length > 0 && filterInfo[0] != -1;

            layerList = app.config.layerType.filter(l => l.type == featureType);
            $.each(self.mapView.map.allLayers.items, function(index, layer) {
                if(layerList.map(l => l.id).includes(layer.id)){
                    if(displayObs){
                        // "Enabling" layer
                        layer.minScale = 0;
                        layer.definitionExpression = self.getDefinitionExpression(app.config.layerType.find(l => l.id == layer.id).filterField, filterInfo);
                    }
                    else{
                        // "Disabling" layer
                        layer.minScale = 1;
                    }
                }
            });
        }
        else{
            layerList = app.config.layerType.filter(l => l.type == featureType);
            // If feature type is platform, adding trackline
            if(featureType === app.config.TYPE_PTF){
                layerList = layerList.concat(app.config.layerType.filter(l => l.type == app.config.TYPE_TRACKLINE))
            }

            $.each(self.mapView.map.allLayers.items, function(index, layer) {
                if(layerList.map(l => l.id).includes(layer.id)){
                    layer.definitionExpression = self.getDefinitionExpression(app.config.layerType.find(l => l.id == layer.id).filterField, filterInfo);
                }
            });
        }
    }

    /**
    *   Based on a filter field and a filterInfo, returning the definition expression.
    *   If filterInfo is a string, it will be considered as a direct SQL where clause.
    *   If it is an array, a SQL IN clause will be computed.
    */
    self.getDefinitionExpression = function(filterField, filterInfo) {
        var whereClause = "1=1";
        if (filterInfo) {
            if(typeof(filterInfo) === "string"){
                whereClause += " AND " + filterInfo;
            }
            else if(typeof(filterInfo) === "object" && filterInfo.length > 0){
                whereClause += " AND " + app.utils.buildWhereClause(filterField, filterInfo);
            }
            else{
                // Not a valid filtering clause
                whereClause += " AND 1=0";
            }
        }

        return whereClause;
    }

    /**
    *   Add a layer to the group layer list
    */
    self.addToWorkLayerList = function(layer){
        groupLayerWork.add(layer);
    }

    /**
    *   Updates a layer's definition expression
    */
    self.updateLayerDefinitionExpression = function(layer, definitionExpression, sublayerId){
        if(sublayerId){
            var sublayer = layer.findSublayerById(sublayerId);
            sublayer.definitionExpression = definitionExpression;
        }
        else{
            layer.definitionExpression = definitionExpression;
        }

        if(layer.parent.id === groupLayerWork.id){
            app.settings.updateWorkLayerToLocalStorage(layer.id, layer.title, layer.renderer.toJSON(), layer.definitionExpression);
        }
    }

    /**
     * From a given layer ID, determine to what category the layer should be added and add the layer using the appropriate function (it not already added).
     * @param {string} layer ID
     */
    self.addLayer = function(layerId, visibility, definitionExpression, renderer){
        // Testing if already added
        if(!self.mapView.map.allLayers.map(l => l.id).includes(layerId)){
            // Testing layer category
            if(app.config.operationalLayers.map(l => l.id).includes(layerId)){
                self.addOperationalLayer(layerId, visibility, definitionExpression, renderer);
            }
            else if(app.config.dynamicLayers.map(l => l.id).includes(layerId)){
                self.addOtherLayer(layerId, visibility);
            }
        }
    }

    /**
     * Add a layer from a given ID.
     * @param {string} layer ID
     */
    self.addOperationalLayer = function(layerId, inVisibility, inDefinitionExpression, inRenderer){
        require([
            "esri/layers/GroupLayer",
            "esri/layers/FeatureLayer",
            "esri/PopupTemplate"
            ], function(GroupLayer, FeatureLayer, PopupTemplate){
            // Get object refs from parent window
            var ptfRefs = [];
            var cruiseRefs = [];
            var lineRefs = [];
            var obsRefs = [];
            var siteRefs = [];
            if(!app.appInterface.getEmptyGisSample()){
                ptfRefs = app.appInterface.getObjectsRefs(app.config.TYPE_PTF);
                cruiseRefs = app.appInterface.getObjectsRefs(app.config.TYPE_CRUISE);
                lineRefs = app.appInterface.getObjectsRefs(app.config.TYPE_LINE);
                obsRefs = app.appInterface.getObjectsRefs(app.config.TYPE_OBS);
                siteRefs = app.appInterface.getObjectsRefs(app.config.TYPE_SITE);
            }
            else{
            }
            
            if(!ptfRefs){
                // If null, checking URL parameters
                if(app.settings.filter && app.settings.filter.platform){
                    ptfRefs = app.settings.filter.platform;
                }
            }

            if(!cruiseRefs){
                // If null, checking URL parameters
                if(app.settings.filter && app.settings.filter.cruise){
                    cruiseRefs = app.settings.filter.cruise;
                }
            }
            if(!lineRefs){
                // If null, checking URL parameters
                if(app.settings.filter && app.settings.filter.line){
                    cruiseRefs = app.settings.filter.line;
                }
            }
            if(!siteRefs){
                // If null, checking URL parameters
                if(app.settings.filter && app.settings.filter.site){
                    siteRefs = app.settings.filter.site;
                }
            }

            // Default popup templates
            var popupTemplatePtf = new PopupTemplate({title: app.config.POPUP_OPERATIONAL_PTF_TITLE, content: app.config.POPUP_OPERATIONAL_PTF_CONTENT});
            var popupTemplateObs = new PopupTemplate({title: app.config.POPUP_OBS_LAYERS_TITLE, content: app.config.POPUP_OBS_LAYERS_CONTENT});
            var popupTemplateTrackline = new PopupTemplate({title: app.config.POPUP_TRACKLINE_LAYERS_TITLE, content: app.config.POPUP_TRACKLINE_LAYERS_CONTENT});
            var popupTemplateDefault = new PopupTemplate({title: "Attributes", content: app.config.POPUP_OTHERS});

            var layer = app.config.operationalLayers.find(l => l.id == layerId);
            var maxScale = 0, minScale = 0;
            // If min/max scale are defined, setting them
            if(layer.maxScale){
                maxScale = layer.maxScale;
            }
            if(layer.minScale){
                minScale = layer.minScale;
            }

            // Defining popup
            var popupTemplate = null;
            // If a template is defined for this layer, setting it up
            if (layer.popupTitle && layer.popupContent) {
                var popupOptions = {title: layer.popupTitle, content: layer.popupContent};
                if(layer.popupFieldInfos){
                    popupOptions["fieldInfos"] = layer.popupFieldInfos;
                }
                popupTemplate = new PopupTemplate(popupOptions);
            } else {
                switch(layer.type){
                    case app.config.TYPE_PTF:
                        popupTemplate = popupTemplatePtf;
                        break;
                    case app.config.TYPE_OBS_PTF:
                        popupTemplate = popupTemplateObs;
                        break;
                    case app.config.TYPE_TRACKLINE:
                        popupTemplate = popupTemplateTrackline;
                        break;
                    default:
                        popupTemplate = popupTemplateDefault;
                }
            }

            if(popupTemplate){
                if(layer.popupActions){
                    for(var j = 0; j < layer.popupActions.length; j++){
                        popupTemplate.actions = layer.popupActions;
                    }
                }
                else{
                    if(layer.type == app.config.TYPE_PTF){
                        popupTemplate.actions = [{
                            "title": "Details Page",
                            "id": "ptf-inspect",
                            "className": "esri-icon-review"
                        }];
                    }
                    else if (layer.type == app.config.TYPE_LINE) {
                        popupTemplate.actions = [{
                            "title": "Details Page",
                            "id": "line-inspect",
                            "className": "esri-icon-review"
                        }];
                    }
                    else if (layer.type == app.config.TYPE_CRUISE) {
                        popupTemplate.actions = [{
                            "title": "Details Page",
                            "id": "cruise-inspect",
                            "className": "esri-icon-review"
                        }];
                    }
                }
                popupTemplate.outFields = ["*"];
            }

            // Defining definition expression
            var definitionExpression = null;
            var layerTypeInfo = app.config.layerType.find(l => l.id == layer.id);
            if(ptfRefs && layerTypeInfo && (layerTypeInfo.type == app.config.TYPE_PTF || layerTypeInfo.type == app.config.TYPE_TRACKLINE)){
                definitionExpression = self.getDefinitionExpression(layerTypeInfo.filterField, ptfRefs);
            }
            if(cruiseRefs && layerTypeInfo && layerTypeInfo.type == app.config.TYPE_CRUISE){
                definitionExpression = self.getDefinitionExpression(layerTypeInfo.filterField, cruiseRefs);
            }
            if(lineRefs && layerTypeInfo && layerTypeInfo.type == app.config.TYPE_LINE){
                definitionExpression = self.getDefinitionExpression(layerTypeInfo.filterField, lineRefs);
            }
            if(obsRefs && layerTypeInfo && layerTypeInfo.type == app.config.TYPE_OBS){
                var displayObs = obsRefs && typeof(obsRefs) === "object" && obsRefs.length > 0 && obsRefs[0] != -1;
                if(displayObs){
                    minScale = 0;
                    definitionExpression = self.getDefinitionExpression(layerTypeInfo.filterField, obsRefs);
                }
            }
            if(siteRefs && layerTypeInfo && layerTypeInfo.type == app.config.TYPE_SITE){
                definitionExpression = self.getDefinitionExpression(layerTypeInfo.filterField, siteRefs);
            }
            if(inDefinitionExpression){
                definitionExpression = inDefinitionExpression;
            }

            // Visibility will be overriden in the following order: function parameter > session storage > default visibility
            var visibility = app.settings.getLayerVisibilityFromSessionStorage(layer.id);
            if(typeof(visibility) === 'undefined'){
                visibility = true;
            }
            if(inVisibility){
                visibility = inVisibility;
            }

            var timeInfo = null;
            if(layer.timeInfo){
                timeInfo = layer.timeInfo;
            }

            var params = {
                id : layer.id,
                outFields : ["*"],
                minScale: minScale,
                maxScale: maxScale,
                visible : visibility,
                timeInfo: timeInfo,
                useViewTime: layer.useViewTime,
                url: layer.url,
                title: layer.name,
                popupEnabled: (popupTemplate != null),
                popupTemplate : popupTemplate
            };

            if(self.is3D || self.is3DFlat){
                params["returnZ"] = true;
                params["hasZ"] = true;
                if(layer.elevationInfo){
                    params["elevationInfo"] = layer.elevationInfo;
                }
                else{
                    params["elevationInfo"] = {
                        mode: "absolute-height",
                        offset: 0,
                        featureExpressionInfo: {
                            expression: "0"
                        },
                        unit: "meters"
                    }
                }
            }

            if(layer.labelingInfo){
                params["labelingInfo"] = layer.labelingInfo;
                params["labelsVisible"] = true;                            
            }

            if(definitionExpression){
                // There is a contextual definition expression
                params["definitionExpression"] = definitionExpression;
            }
            else{
                // Setting default definition expression, if any
                if(!app.settings.isWebsiteVersion && layer.defaultWhereClause && layer.defaultWhereClause.length > 0){
                    params["definitionExpression"] = layer.defaultWhereClause;
                }
            }
            
            // Looking for existing renderer
            var savedRenderer = app.settings.getLayerRendererFromSessionStorage(layer.id);
            if(inRenderer){
                params.renderer = inRenderer;
            }
            else if(savedRenderer){
                params.renderer = savedRenderer;
            }
            var currentLayer = new FeatureLayer(params);
            // If no renderer preset, applying the default one after layer initialization (async)
            if(!inRenderer && !savedRenderer){
                if(layer.symbologyFields && layer.symbologyFields.length > 0){
                    var filename = layer.theme + "-" + layer.id + "-" + layer.symbologyFields[0] + ".json";
                    loadJsonSymbology(currentLayer, filename);
                }
            }

            var groupLayer = null;
            if(!operationalSubGroupLayerList[layer.group]){
                // Creating Group layer
                var groupInfo = $.grep(app.config.layerGroups, function(elt, idx){
                    return elt.id === layer.group;
                });
                groupLayer = new GroupLayer({
                    id: layer.group,
                    title: groupInfo[0]["name"],
                    visibility: true,
                    visibilityMode: "independent"
                });
                operationalSubGroupLayerList[layer.group] = groupLayer;
            }
            else{
                groupLayer = operationalSubGroupLayerList[layer.group];
            }

            groupLayerOperational.add(currentLayer);
            self.addedLayerIds.push(layerId);

            // Highlighting
            if(layerTypeInfo && (layerTypeInfo.type == app.config.TYPE_PTF)){
                if(app.settings.highlight && app.settings.highlight.platform){
                    currentLayer.on("layerview-create", function(event){
                        var highlight;
                        var query = currentLayer.createQuery();
                        query.where = app.settings.highlight.platform;
                        currentLayer.queryFeatures(query).then(function(result){
                            if (highlight) {
                                highlight.remove();
                            }
                            highlight = event.layerView.highlight(result.features);
                        });
                    });
                }
            }
        });
    }

    /**
     * Add a layer from a given ID.
     * @param {string} layer ID
     */
    self.addOtherLayer = function(layerId, visibility){
        require([
            "esri/layers/GroupLayer", 
            "esri/layers/MapImageLayer", 
            "esri/layers/FeatureLayer"], 
            function(GroupLayer, MapImageLayer, FeatureLayer){
                var layer = app.config.dynamicLayers.find(l => l.id == layerId);

                var currentLayer;
                var params = {
                    id : layerId,
                    visible : true,
                    url: layer.url,
                    title: layer.name,
                    opacity: layer.defaultOpacity || 1
                };
                if(layer.type == "featureLayer"){
                    if(self.is3D || self.is3DFlat){
                        params["returnZ"] = true;
                        params["hasZ"] = true;
                        if(layer.elevationInfo){
                            params["elevationInfo"] = layer.elevationInfo;
                        }
                        else{
                            params["elevationInfo"] = {
                                mode: "absolute-height",
                                offset: 0,
                                featureExpressionInfo: {
                                    expression: "0"
                                },
                                unit: "meters"
                            }
                        }
                    }
                    currentLayer = new FeatureLayer(params);
                }
                else{
                    if(layer.sublayers){
                        params.sublayers = layer.sublayers;
                    }

                    currentLayer = new MapImageLayer(params);
                }

                var groupLayer = null;
                if(!otherSubGroupLayerList[layer.group]){
                    // Creating Group layer
                    var groupInfo = $.grep(app.config.layerGroups, function(elt, idx){
                        return elt.id === layer.group;
                    });
                    groupLayer = new GroupLayer({
                        id: layer.group,
                        title: groupInfo[0]["name"],
                        visibility: true,
                        popupEnabled: true,
                        visibilityMode: "independent"
                    });
                    otherSubGroupLayerList[layer.group] = groupLayer;
                }
                else{
                    groupLayer = otherSubGroupLayerList[layer.group];
                }

                groupLayerOthers.add(currentLayer, layer.index);
                currentLayer.watch("loaded", function(newValue, oldValue, property, object){
                    // Visibility
                    if(visibility && visibility.root){
                        object.visible = visibility.root;
                        for(var i = 0; i < object.allSublayers.length ; i++){
                            object.allSublayers.items[i].visible = visibility.sublayers[object.allSublayers.items[i].id];
                        }
                    }
                    else if (visibility){
                        object.visible = visibility;
                    }
                });
                self.addedLayerIds.push(layerId);
        });
    }

    /**
     * Updates the full time extent of the time slider. If not intiliazed yet, replacing default values.
     * Updates as well the stops value if only one layer is defined as being time aware.
     */
    self.updateFullTimeExtent = function(){
        var stops = null;
        var newUnit = null, newValue = null;
        var nbLayers = 0;
        var units = {"years": 40, "months": 30, "days": 20, "hours": 10};
        self.mapView.map.allLayers.forEach(function(layer){
            if(layer.timeInfo){
                nbLayers++;
                if(!fullTimeExtent){
                    fullTimeExtent = timeSlider.fullTimeExtent;
                    fullTimeExtent.start = layer.timeInfo.fullTimeExtent.start;
                    fullTimeExtent.end = layer.timeInfo.fullTimeExtent.end;
                }
                else{
                    if(fullTimeExtent.start > layer.timeInfo.fullTimeExtent.start){
                        fullTimeExtent.start = layer.timeInfo.fullTimeExtent.start;
                    }
                    if(fullTimeExtent.end <  layer.timeInfo.fullTimeExtent.end){
                        fullTimeExtent.end = layer.timeInfo.fullTimeExtent.end;
                    }
                }
                
                // If multiple layers have timeinfo, taking the largest interval definition
                if(!newUnit){
                    newUnit = layer.timeInfo.interval.unit;
                    newValue = layer.timeInfo.interval.value;
                }
                else{
                    if(newUnit == layer.timeInfo.interval.unit && layer.timeInfo.interval.value != -1){
                        newValue = layer.timeInfo.interval.value > newValue ? layer.timeInfo.interval.value : newValue;
                    }
                    else{
                        if(units[layer.timeInfo.interval.unit] > units[newUnit]){
                            newUnit = layer.timeInfo.interval.unit;
                            newValue = layer.timeInfo.interval.value;
                        }
                    }
                }
                if(newUnit && newValue){
                    stops = {"interval": {"unit": layer.timeInfo.interval.unit, "value": layer.timeInfo.interval.value}};
                }
            }
        });
        if(fullTimeExtent.start && fullTimeExtent.end){
            timeSlider.fullTimeExtent = fullTimeExtent;
            if(nbLayers == 1 && stops){
                timeSlider.stops = stops;
            }
            // Resetting to full extent in any case
            timeSlider.timeExtent.start = timeSlider.fullTimeExtent.start;
            timeSlider.timeExtent.end = timeSlider.fullTimeExtent.end;
            // Play/stop to force refresh the widget 
            timeSlider.play();
            timeSlider.stop();
        }
    }

    /**
     * Adds kml layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    self.addKMLLayer = function(id, name, url){
        require(["esri/layers/KMLLayer"], function(KMLLayer) {
            var layer = new KMLLayer({
                id: id,
                title: name,
                url: url
            });
            groupLayerWork.add(layer);
        });
    }

    /**
     * Adds WMS layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    self.addWMSLayer = function(id, name, url){
        require(["esri/layers/WMSLayer"], function(WMSLayer) {
            var layer = new WMSLayer({
                id: id,
                title: name,
                url: url
            });
            groupLayerWork.add(layer);
        });
    }

    /**
     * Adds ArcGIS MapServer layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    self.addArcgisLayer = function(id, name, url){
        require(["esri/layers/FeatureLayer"], function(FeatureLayer) {
            var layer = new FeatureLayer({
                id: id,
                title: name,
                url: url
            });
            groupLayerWork.add(layer);
        });
    }

    /**
     * Adds a CSV layer to the map.
     * @param {string} id       ID of the new layer
     * @param {string} url      URL of the new layer
     * @param {string} latField Name of the latitude field in the CSV file
     * @param {string} lonField Name of the longitude field in the CSV file
     */
    self.addCSVLayer = function(id, url, latField, lonField){
        require(["esri/layers/CSVLayer", 
            "esri/renderers/SimpleRenderer", 
            "esri/symbols/SimpleMarkerSymbol","app/modules/pinLayerTool"], 
            function(CSVLayer, SimpleRenderer, SimpleMarkerSymbol, pinLayerTool) {
            var layer = new CSVLayer({
                id: id,
                title: "New CSV layer",
                url: url,
                latitudeField: latField,
                longitudeField: lonField,
                outFields: ["*"],
                popupEnabled: true,
                renderer: new SimpleRenderer({
                    symbol: new SimpleMarkerSymbol({
                        size: 6,
                        color: "blue",
                        outline: {
                            width: 1,
                            color: "white"
                        }
                    })
                })
            });

            // Opening pin layer tool, to edit symbology
            pinLayerTool.init(app, layer, true);
        });
    }

    /**
     * Keeps track of elevation-based layer IDs in order to further adapt them when the bathymetry's exageration is updated.
     * @param {integer} layerID Layer's true ID, as added on the map.
     * @param {integer} baseID  If the layer is derived from a generic layer (i.e. an observation layer, for a specific platform), specify the bade-layer ID here. If null, it will take the layer ID as a value.
     */
    self.addLayerWithElevationInfoID = function(layerID, baseID){
        withElevationInfoLayerIDs.push({layerID: layerID, baseID: (baseID ? baseID : layerID)});
    }

    /**
     * Updates all the elevation-based layer coefficient when the bathymetry's exageration is updated.
     * @param  {decimal} newCoeff The new coefficient applied to the bathymetry exageration.
     */
    self.updateElevationLayerInfo = function(newCoeff){
        for(var i = 0; i < withElevationInfoLayerIDs.length; i++){
            var layerInfo = app.config.operationalLayers.find(x => x.id === withElevationInfoLayerIDs[i].baseID);
            var layer = self.mapView.map.findLayerById(withElevationInfoLayerIDs[i].layerID);
            var elevationInfo = layerInfo.elevationInfo;
            if(layerInfo.elevationField == "z"){
                elevationInfo.featureExpressionInfo.expression = "Geometry($feature)." + layerInfo.elevationField + " * " + newCoeff;
            }
            else{
                elevationInfo.featureExpressionInfo.expression = "$feature." + layerInfo.elevationField + " * -" + newCoeff;
            }
            layer.elevationInfo = elevationInfo;
        }
    }

    /**
     * When an elevation-based layer is removed from the map, removing its record from the elevation layers list.
     * @param  {integer} layerID The layer's ID to remove.
     */
    self.removeFromElevationLayerIDs = function(layerID){
        for(var i = 0; i < withElevationInfoLayerIDs.length; i++){
            if(withElevationInfoLayerIDs[i].layerID == layerID){
                withElevationInfoLayerIDs.splice(i, 1);
            }
        }
    }

    self.toggleSketchLayer = function(shouldDisplay){
        self.sketchLayer.visible = shouldDisplay;
        if(!self.mapView.map.findLayerById(self.sketchLayer.id) && shouldDisplay){
            //self.mapView.map.add(self.sketchLayer);
            groupLayerWork.add(self.sketchLayer);
        }
        else{
            //self.mapView.map.remove(self.sketchLayer);
        }
    }

    self.processDraftPtfs = function(arrayOfObjects){
        app.models.draftPtfs = arrayOfObjects;
        
        require([
            "app/modules/editTool"
        ], function(editTool){
            editTool.init(app);
            editTool.syncDraftPtfs();
        });
    }

    self.deleteDraftPtfs = function(arrayOfObjects){
        app.models.draftPtfs = app.models.draftPtfs.filter(item => !arrayOfObjects.find(ditem => ditem.draftId === item.draftId));
        
        require([
            "app/modules/editTool"
        ], function(editTool){
            editTool.init(app);
            editTool.syncDraftPtfs();
        });
    }

    self.selectDraftPtfs = function(arrayOfObjects){
        
    }

    self.showTrackline = function(srcLayerInfo, objectRef){
        return showTrackline(srcLayerInfo, objectRef);
    }

    
    self.showObservations = function(srcLayerInfo, objectRef){
        return showObservations(srcLayerInfo, objectRef);        
    }

    self.removeWorkLayer = function(layerId){
        var layer = self.mapView.map.findLayerById(layerId);
        if(layer){
            groupLayerWork.remove(layer);
        }
    }

    self.removeAllWorkLayers = function(){
        groupLayerWork.removeAll();
    }

    return self;
});
