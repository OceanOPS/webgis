import Print from "@arcgis/core/widgets/Print";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";
import Collection from "@arcgis/core/core/Collection";
import Extent from "@arcgis/core/geometry/Extent";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import AreaMeasurement3D from "@arcgis/core/widgets/AreaMeasurement3D";
import CoordinateConversion from "@arcgis/core/widgets/CoordinateConversion";
import DirectLineMeasurement3D from "@arcgis/core/widgets/DirectLineMeasurement3D";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import Sketch from "@arcgis/core/widgets/Sketch";
import Config from "./Config";
import OpacitySlider from "./widgets/OpacitySlider";
import ScreenshotTool from "./widgets/ScreenshotTool";
import PinLayer from "./widgets/PinLayer";
import Ground from "@arcgis/core/Ground";
import SceneView from "@arcgis/core/views/SceneView";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Layer from "@arcgis/core/layers/Layer";
import LayerList from "@arcgis/core/widgets/LayerList";
import TimeInterval from "@arcgis/core/TimeInterval";
import Home from "@arcgis/core/widgets/Home";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import * as symbolJsonUtils from "@arcgis/core/symbols/support/jsonUtils";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import ExaggeratedElevationLayer from "./ExaggeratedElevationLayer";
import ActionButton from "@arcgis/core/support/actions/ActionButton";
import Basemap from "@arcgis/core/Basemap";
import Widget from "@arcgis/core/widgets/Widget";
import KMLLayer from "@arcgis/core/layers/KMLLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import CSVLayer from "@arcgis/core/layers/CSVLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import AppInterface from "./AppInterface";
import Utils from "./Utils";
import Settings from "./Settings";
import MapMenu from "./MapMenu";
import EditGraphic from "./widgets/EditGraphic";
import Identify from "./widgets/Identify";
import HeightFilter from "./widgets/HeightFilter";
import QueryElevation from "./widgets/QueryElevation";
import SelectionLayer from "./SelectionLayer";
import AnimationRotate from "./widgets/AnimationRotate";
import AnimationWaypoint from "./widgets/AnimationWaypoint";
import AddLogo from "./widgets/AddLogo";
import DataDisplay from "./DataDisplay";
import SensorDisplay from "./SensorDisplay";
import Symbology from "./widgets/Symbology";
import QueryLayer from "./widgets/QueryLayer";
import ElevationExaggerationViewModel from "./widgets/ElevationExaggerationViewModel";
import ElevationExaggeration from "./widgets/ElevationExaggeration";
import LayerElevationExpr from "./widgets/LayerElevationExpr";

class GISMap {
    // ========================================================================
    // #region Private
    // ========================================================================
    // Current basemap layer, if applicable
    private basemapMapImageLayer: GroupLayer | MapImageLayer | null = null;
    // Current basemap ID
    private basemapID: string | null = null;
    // Current tool opened
    private currentTool: any = null;
    // Current result panel (linked to the tool)
    private currentResultPanel: any = null;
    // Current custom tool close button (linked to the tool)
    private closeWidgetButton: any = null;
    // Boolean aiming to not overload the server when projecting coordinates
    private waitCoordinates: boolean = false;
    // LayerList
    private layerList: any = null;
    // Print Widget
    private printer: Print;
    private printerDisplayed: boolean = false;
    // Time Widget
    private timeSlider: TimeSlider;
    private timeSliderDisplayed: boolean = false;
    // Opacity slider Widget
    private opacitySlider: OpacitySlider;
    private opacitySliderDisplayed: boolean = false;
    // Symbology Widget
    private symbologyWidget: Symbology;
    private symbologyWidgetDisplayed: boolean = false;
    // Query Widget
    private queryWidget: QueryLayer;
    private queryWidgetDisplayed: boolean = false;
    // LayerElevationExpr Widget
    private layerElevationExpr: LayerElevationExpr;
    private layerElevationExprDisplayed: boolean = false;
    // PinLayer Widget
    private pinLayer: PinLayer;
    private pinLayerDisplayed: boolean = false;
    // Screenshot Widget
    private screenshotTool: ScreenshotTool;
    private screenshotToolDisplayed: boolean = false;
    // Screenshot Widget
    private queryElevation: QueryElevation;
    private queryElevationDisplayed: boolean = false;
    // Measurements widget
    private measurementsDisplayed: boolean = false;
    private measurementWidgetDistance2D: DistanceMeasurement2D;
    private measurementWidgetDistance3D: DirectLineMeasurement3D;
    private measurementWidgetArea2D: AreaMeasurement2D;
    private measurementWidgetArea3D: AreaMeasurement3D;
    // Coordinates Widget
    private coordinates: CoordinateConversion;
    private coordinatesDisplayed: boolean = false;
    // Sketch Widget
    private sketchWidget: Sketch;
    private sketchWidgetDisplayed: boolean = false;
    // EditGraphic widget
    private editGraphic: EditGraphic;
    private editGraphicDisplayed: boolean;
    // Identify widget
    private identify: Identify;
    private identifyDisplayed: boolean;
    // HeightFilter widget
    private heightFilter: HeightFilter;
    private heightFilterDisplayed: boolean;
    // AnimationRotate widget
    private animationRotate: AnimationRotate;
    private animationRotateActivated: boolean;
    // AnimationWaypoint widget
    private animationWaypoint: AnimationWaypoint;
    private animationWaypointActivated: boolean;
    // AddLogo widget
    private addLogo: AddLogo;
    private addLogoActivated: boolean;
    // Exaggeration widget and view model
    private exaggerationWidget: ElevationExaggeration;
    private exaggerationWidgetActivated: boolean = false;
    // Custom tool
    private customToolDisplayed: boolean = false;

    // References to the main group layer
    private groupLayerWork: GroupLayer;
    private groupLayerOperational: GroupLayer;
    private groupLayerOthers: GroupLayer;
    private operationalSubGroupLayerList: {} = {};
    private otherSubGroupLayerList: {} = {};
    private withElevationInfoLayerIDs: {layerID: string, baseID: string}[] = [];

    private fullTimeExtent: any = null;

    private widgetIteration: number = 0;
    private settings: Settings;
    private mapMenu: MapMenu;
    // #endregion
    
    // ========================================================================
    // #region Public members
    // ========================================================================
    // Map view
    public mapView: MapView | SceneView;
    // Selection Tool
    public selectionLayer: SelectionLayer;
    // Bathymetry layer, for elevation
    public bathymetryLayer: ElevationLayer;
    // Indicates if the current projection is 3D
    public is3D: boolean = false;
    // Indicates if the current projection is 3D-flat
    public is3DFlat: boolean = false;
    // Exaggeration coeficient
    public exaggerationCoef: number = Config.DEFAULT_ELEVATION_EXAGGERATION;
    // Sketch layer
    public sketchLayer: GraphicsLayer;
    // Reference to added layers
    public addedLayerIds: string[] = [];
    // 3D Playground
    public isImmersiveViewActivated: boolean;
    // #endregion

    constructor(settingsInstance: Settings){
        this.settings = settingsInstance;
        // Init sketch layer
        this.sketchLayer = new GraphicsLayer({
            id: "sketchLayer",
            title: "Draft layer"
        });
        

        // Setting bathymetry layer
        this.bathymetryLayer = new ElevationLayer({url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"});
        
        var exaggeratedBathyLayer = ElevationExaggerationViewModel.getExaggeratedElevationLayer();
        
        if (this.settings.projection && this.settings.projection == "3D") {
            
            // 3D view
            var mapParams: any = {};
            if(this.settings.basemap){
                var basemap = this.settings.getBasemapFromID(this.settings.basemap);
                mapParams["basemap"] = basemap;
                mapParams["ground"] = new Ground({
                    layers: [exaggeratedBathyLayer]
                });
            }
            var map = new Map(mapParams);
            var mapViewParams: any = {
                container: "mapViewDiv",
                map: map,
                environment: {
                    atmosphereEnabled: true,
                    atmosphere: {
                        quality: "low",
                        starsEnabled: true
                    },
                    lighting: {
                        type: 'virtual'
                    }
                }
            };
            /*if(highlightOptions){
                mapViewParams["highlightOptions"] = highlightOptions;
            }*/
            this.mapView = new SceneView(mapViewParams);

            this.exaggerationWidget = new ElevationExaggeration({view: this.mapView, withElevationInfoLayerIDs: this.withElevationInfoLayerIDs});
            this.exaggerationWidget.watch("exaggeration", (newValue,oldValue, propertyName, target) => {
                this.exaggerationCoef = newValue;
            });

            this.is3D = true;
        } else if (this.settings.projection && this.settings.projection == "3D-flat") {
            // 3D-flat view
            var mapParams: any = {};
            if(this.settings.basemap){
                var basemap = this.settings.getBasemapFromID(this.settings.basemap);
                mapParams["basemap"] = basemap;
                mapParams["ground"] = new Ground({
                    layers: [exaggeratedBathyLayer]
                });
            }
            var map = new Map(mapParams);  
            var mapViewParams: any = {
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
            this.mapView = new SceneView(mapViewParams);
            this.exaggerationWidget = new ElevationExaggeration({view: this.mapView});

            this.is3DFlat = true;
        } else {
            // 2D view
            var mapParams: any = {};
            var mapViewParams: any = {
                container: "mapViewDiv",
            };

            // Reading start settings
            if(this.settings.projection){
                // Setting projection
                var projection = this.settings.getProjectionFromID(this.settings.projection);
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
            }
            
            // Creating the map
            mapViewParams["map"] = new Map(mapParams);
            // Creating the 2D view
            this.mapView = new MapView(mapViewParams);

            if(this.settings.basemap){
                this.setBasemapID(this.settings.basemap);
            }
        }
        
        this.selectionLayer = new SelectionLayer({view: this.mapView});

        if(this.mapView.ready){
            this.setupView();
        }
        else{
            this.mapView.when(() => {
                this.setupView();
            });
        }
    };


    // ========================================================================
    // #region Public methods
    // ========================================================================
    /**
     * Wrapper methods to set the projection in Settings
     * @param ref (string) the reference of the projection
     */
    public setProjection = (ref: string): void => {
        this.settings.setProjection(ref);
    }
    /**
     * Wrapper methods to get the projection from Settings
     * @return (string) the reference of the projection
     */
    public getProjection = (): string => {
        return this.settings.projection;
    }
    /**
     * Wrapper methods to get the theme from Settings
     * @return (string) the theme
     */
    public getTheme = (): string => {
        return this.settings.theme;
    }

    /**
     * Switch the layer list visibility
     * @param visible (boolean) true if should be visible, false otherwise
     */
    public switchLayerListVisibility = (visible: boolean): void => {
        if(visible){
            this.mapView.ui.add(this.layerList, "top-right");
        }
        else{
            this.mapView.ui.remove(this.layerList);   
        }
    }

    /**
     * Activates/deactives the screenshot tool
     */
    public activateScreenshotTool = (): void => {
        if(!this.screenshotTool || (this.screenshotTool && this.screenshotTool.destroyed)){
            this.screenshotTool = new ScreenshotTool({view: this.mapView, sketchLayer: this.sketchLayer});
            this.mapView.ui.add(this.screenshotTool, {position: "bottom-left"});
            this.screenshotToolDisplayed = true;
        }
        else{
            this.mapView.ui.remove(this.screenshotTool);
            this.screenshotTool.destroy();
            this.screenshotToolDisplayed = false;
        }
    }
    public isScreenshotToolDisplayed = ():boolean => { return this.screenshotToolDisplayed;};

    /**
     * Activates/deactivates the edit graphic widget
     */
    public activateEditGraphic = () =>{
        if(!this.editGraphic || (this.editGraphic && this.editGraphic.destroyed)){
            this.editGraphic = new EditGraphic({map: this});
        }

        if(this.editGraphicDisplayed){
            this.mapView.ui.remove(this.editGraphic);
            this.activateSketchWidget(false);
            this.editGraphicDisplayed = false;
        }
        else{
            this.activateSketchWidget(true);
            this.mapView.ui.add(this.editGraphic, {position: "bottom-left"});
            this.editGraphicDisplayed = true;
        }
    }

    public isEditGraphicDisplayed = ():boolean => { return this.editGraphicDisplayed;};
    
    /**
     * Activates/deactivates the Identify widget
     */
    public activateIdentify = () => {
        if(!this.identify || (this.identify && this.identify.destroyed)){
            this.identify = new Identify({view: this.mapView});
            this.mapView.ui.add(this.identify, {position: "bottom-left"});
            this.identifyDisplayed = true;
        }
        else{
            this.mapView.ui.remove(this.identify);
            this.identify.destroy();
            this.identifyDisplayed = false;
        }
    }
    public isIdentifyDisplayed = ():boolean => { return this.identifyDisplayed;};
    
    /**
     * Activates/deactivates the HeightFilter widget
     */
     public activateHeightFilter = () => {
        if(!this.heightFilter || (this.heightFilter && this.heightFilter.destroyed)){
            this.heightFilter = new HeightFilter({view: this.mapView});
            this.mapView.ui.add(this.heightFilter, {position: "bottom-left"});
            this.heightFilterDisplayed = true;
        }
        else{
            this.mapView.ui.remove(this.heightFilter);
            this.heightFilter.destroy();
            this.heightFilterDisplayed = false;
        }
    }
    public isHeightFilterDisplayed = ():boolean => { return this.heightFilterDisplayed;};
    
    /**
     * Activates/deactivates the QueryElevation widget
     */
     public activateQueryElevation = () => {
        if(!this.queryElevation || (this.queryElevation && this.queryElevation.destroyed)){
            this.queryElevation = new QueryElevation({view: this.mapView, elevationLayer: this.bathymetryLayer});
            this.mapView.ui.add(this.queryElevation, {position: "bottom-left"});
            this.queryElevationDisplayed = true;
        }
        else{
            this.mapView.ui.remove(this.queryElevation);
            this.queryElevation.destroy();
            this.queryElevationDisplayed = false;
        }
    }
    public isQueryElevationDisplayed = ():boolean => { return this.queryElevationDisplayed;};

    /**
     * Activates/deactivates the 3D Playground functionnality
     */
     public activateImmersiveView = () => {
        if(!this.isImmersiveViewActivated){
            // Disable loader
            Utils.setLoadingEnabled(false);
            // Activate UI auto hide
            this.settings.activateAutoHide(true);
            this.isImmersiveViewActivated = true;
        }
        else{
            // Disable loader
            Utils.setLoadingEnabled(true);
            // Activate UI auto hide
            this.settings.activateAutoHide(false);
            this.isImmersiveViewActivated = false;
        }
    }

    /**
     * Activates/deactivates the AnimationRotate widget
     */
     public activateAnimationRotate = () => {
        if(!this.animationRotate || (this.animationRotate && this.animationRotate.destroyed)){
            this.animationRotate = new AnimationRotate({view: this.mapView});
            this.mapView.ui.add(this.animationRotate, {position: "bottom-left"});
            this.animationRotateActivated = true;
        }
        else{
            this.mapView.ui.remove(this.animationRotate);
            this.animationRotate.destroy();
            this.animationRotateActivated = false;
        }
        this.activateImmersiveView();
    }
    public isAnimationRotateActivated = ():boolean => { return this.animationRotateActivated;};

    /**
     * Activates/deactivates the AnimationWaypoint widget
     */
     public activateAnimationWaypoint = () => {
        if(!this.animationWaypoint || (this.animationWaypoint && this.animationWaypoint.destroyed)){
            this.animationWaypoint = new AnimationWaypoint({mapInstance: this});
            this.mapView.ui.add(this.animationWaypoint, {position: "bottom-left"});
            this.animationWaypointActivated = true;
        }
        else{
            this.mapView.ui.remove(this.animationWaypoint);
            this.animationWaypoint.destroy();
            this.animationWaypointActivated = false;
        }
    }
    public isAnimationWaypointActivated = ():boolean => { return this.animationWaypointActivated;};
    
    /**
     * Activates/deactivates the AddLogo widget
     */
     public activateAddLogo = () => {
        if(!this.addLogo || (this.addLogo && this.addLogo.destroyed)){
            this.addLogo = new AddLogo({mapInstance: this});
            this.mapView.ui.add(this.addLogo, {position: "bottom-left"});
            this.addLogoActivated = true;
        }
        else{
            this.mapView.ui.remove(this.addLogo);
            this.addLogo.destroy();
            this.addLogoActivated = false;
        }
    }
    public isAddLogoActivated = ():boolean => { return this.addLogoActivated;};

    /**
     * Activates/deactivates the ElevationExaggeration widget
     */
     public activateElevationExaggeration = () => {
        if(this.mapView instanceof SceneView){
            if(!this.exaggerationWidget || (this.exaggerationWidget && this.exaggerationWidget.destroyed)){
                this.exaggerationWidget = new ElevationExaggeration({view: this.mapView});
            }

            if(!this.exaggerationWidgetActivated){
                this.mapView.ui.add(this.exaggerationWidget, {position: "bottom-left"});
                this.exaggerationWidgetActivated = true;
            }
            else{
                this.mapView.ui.remove(this.exaggerationWidget);
                this.exaggerationWidgetActivated = false;
            }
        }
    }
    public isElevationExaggerationActivated = ():boolean => { return this.exaggerationWidgetActivated;};
    

    /*
    *   Adds a layer to the work layer list
    */
    public addWorkLayer = (id: string, sourceLayerId: string, name: string, renderer: any, definitionExpression: string, visible: boolean): FeatureLayer => {
        var existingLayer: Layer = this.mapView.map.allLayers.find(l => l.id === sourceLayerId);
        var url: string, minScale: number = 0, maxScale: number = 0, labelingInfo: any, popupTemplate: PopupTemplate | null;
        if(existingLayer && existingLayer instanceof FeatureLayer){
            url = existingLayer.url + "/" + existingLayer.layerId;
            minScale = existingLayer.minScale;
            maxScale = existingLayer.maxScale;
            labelingInfo = existingLayer.labelingInfo;
            popupTemplate = existingLayer.popupTemplate;
        }
        else{
            var layer: any;
            if(sourceLayerId.includes("_GROUP_")){
                layer = Config.operationalLayers.find(l => l.id === sourceLayerId.substring(0,sourceLayerId.indexOf("_GROUP_")+6));
                url = layer.url + sourceLayerId.substring(sourceLayerId.indexOf("_GROUP_")+7);
            }
            else{
                layer = Config.operationalLayers.find(l => l.id === sourceLayerId);
                url = layer.url;
            }
            
            // Default popup templates
            var popupTemplatePtf = new PopupTemplate({title: Config.POPUP_OPERATIONAL_PTF_TITLE, content: Config.POPUP_OPERATIONAL_PTF_CONTENT});
            var popupTemplateObs = new PopupTemplate({title: Config.POPUP_OBS_LAYERS_TITLE, content: Config.POPUP_OBS_LAYERS_CONTENT});
            var popupTemplateTrackline = new PopupTemplate({title: Config.POPUP_TRACKLINE_LAYERS_TITLE, content: Config.POPUP_TRACKLINE_LAYERS_CONTENT});
            var popupTemplateDefault = new PopupTemplate({title: "Attributes", content: Config.POPUP_OTHERS});
            // If min/max scale are defined, setting them
            if(layer.maxScale){
                maxScale = layer.maxScale;
            }
            if(layer.minScale){
                minScale = layer.minScale;
            }

            // Defining popup
            popupTemplate = null;
            // If a template is defined for this layer, setting it up
            if (layer.popupTitle && layer.popupContent) {
                var popupOptions = {title: layer.popupTitle, content: layer.popupContent};
                if(layer.popupFieldInfos){
                    popupOptions["fieldInfos"] = layer.popupFieldInfos;
                }
                popupTemplate = new PopupTemplate(popupOptions);
            } else {
                switch(layer.type){
                    case Config.TYPE_PTF:
                        popupTemplate = popupTemplatePtf;
                        break;
                    case Config.TYPE_OBS_PTF:
                        popupTemplate = popupTemplateObs;
                        break;
                    case Config.TYPE_TRACKLINE:
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
                popupTemplate.actions = new Collection<ActionButton>();
                popupTemplate.actions.add(new ActionButton({
                    "title": "Details page",
                    "id": "ptf-inspect",
                    "className": "esri-icon-review"
                }));
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

        this.addToWorkLayerList(featureLayer);

        featureLayer.watch("visible", (newValue, oldValue, property, object): void => {
            if(object instanceof FeatureLayer){
                this.settings.updateLayerVisibilityToSessionStorage(object.id, newValue);
            }
        });
        return featureLayer;
    };
    
    /**
     * Saves work layer info to local storage and visibilty to session storage
     * @param id layer ID
     * @param sourceLayerId source layer ID
     * @param name name of this layer
     * @param renderer JSON renderer of this layer
     * @param definitionExpression definition expression of this layer
     * @param visible boolean true if visible, false if not
     */
    public saveWorkLayerToBrowserStorage = (id: string, sourceLayerId: string, name: string, renderer: any, definitionExpression: string, visible: boolean) => {
        // Adding new entry to local storage
        this.settings.saveWorkLayerToLocalStorage(id, sourceLayerId, name, renderer.toJSON(), definitionExpression);
        // Save layer visibility
        this.settings.updateLayerVisibilityToSessionStorage(id, visible);
    }

    /**
     * Updates work layer info to local storage
     * @param id layer ID
     * @param name name of this layer
     * @param renderer JSON renderer of this layer
     * @param definitionExpression definition expression of this layer
     * @param visible boolean true if visible, false if not
     */
    public updateWorkLayerToBrowserStorage = (id: string, name: string, renderer: any, definitionExpression: string, visible: boolean) => {
        // Adding new entry to local storage
        this.settings.updateWorkLayerToLocalStorage(id, name, renderer.toJSON(), definitionExpression);
    }

    /**
     *   Set the basemap of the map by its ID.
     */
    public setBasemapID = (basemapID: string | null): void => {
        var basemap: Basemap | null = this.settings.getBasemapFromID(basemapID);
        this.setBasemap(basemap);
        // In both case, saving basemap ID
        this.basemapID = basemapID;
        // Updating settings and URL
        this.settings.setBasemap(basemapID);
    }
    /*
    *   Set the basemap of the map. Do not use this at initialization since it can causes spatial reference misbehavior.
    */
    public setBasemap = (basemap: Basemap | null): void => {
        if(basemap){
            // Setting basemap
            if(!this.mapView.spatialReference || (this.mapView.spatialReference && this.mapView.spatialReference.isWebMercator)){
                // WebMercator, basemap will be automatically managed
                this.mapView.map.basemap = basemap;
            }
            else{
                // We have to handle the basemap as a classic layer
                var addBasemap = (basemap: Basemap) => {
                    var cancel = false;
                    // Other projection. Basemap has to be loaded as a classic layer                    
                    var newBasemap = new GroupLayer({
                        id: basemap.id,
                        title: basemap.title
                    });
                    // Base layers
                    for(var i = 0; i<basemap.baseLayers.length; i++){
                        let url: string = "";
                        let layer: Layer = basemap.baseLayers.getItemAt(i);
                        if(layer["url"]){
                            url = layer["url"];
                        }
                        else if(layer["urlTemplate"]){
                            url = layer["urlTemplate"].substr(0, layer["urlTemplate"].indexOf("tile"));
                        }
                        if(url.indexOf("MapServer") >= 0){
                            cancel = false;
                            newBasemap.add(new MapImageLayer({
                                id: layer.id,
                                url: url,
                                title: layer.title,
                                sublayers: [{
                                    id: 0,
                                    title: layer.title,
                                    legendEnabled: false
                                }]
                            }));
                        }
                        else{                            
                            console.warn("Unsupported basemap layer type: " + basemap.baseLayers.getItemAt(i).type + " (" + url + ")");
                            cancel = true;
                        }
                    }
                    if(!cancel){
                        // Reference layers
                        for(var i = 0; i<basemap.referenceLayers.length; i++){
                            let url: string;
                            let layer: MapImageLayer = <MapImageLayer>basemap.referenceLayers.getItemAt(i);
                            url = layer.url;
                            
                            newBasemap.add(new MapImageLayer({
                                id: layer.id,
                                url: url,
                                title: layer.title,
                                sublayers: [{
                                    id: 0,
                                    title: layer.title,
                                    legendEnabled: false
                                }]
                            }));
                        }
                        if(this.basemapMapImageLayer){
                            // If a basemap already exists, removing it                            
                            this.mapView.map.remove(this.basemapMapImageLayer);
                        }
                        this.basemapMapImageLayer = newBasemap;
                        // Adding the basemape layer to the map
                        this.mapView.map.layers.add(this.basemapMapImageLayer,0);
                    }
                };
                if(basemap.loaded){
                    addBasemap(basemap);
                }
                else{
                    basemap.load().then(() => {
                        addBasemap(basemap);
                    });
                }
                
            }
        }
        else{
            this.mapView.map.basemap = new Basemap();
        }
    };

    /**
     * Add a logo to the UI
     */
    public addLogoToUI = (url: string): void =>{
        //this.mapView.ui.empty("top-right");
        this.mapView.ui.empty("bottom-right");
        var img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "150px";
        this.mapView.ui.add(img, "bottom-right");
        var img = document.createElement("img");
        img.src = "//www.ocean-ops.org/static/images/oceanops/logos/oceanops-earth-ico-192.png";
        img.style.width = "50px";
        this.mapView.ui.add(img, "bottom-right");
    }

    /*
    *   Set the current tool and add info and result panels.
    */
    public setCurrentTool = (tool: any, infoPanelContent: any, toolResultPanelContent: any): any =>{
        this.currentTool = tool;
        return this.setToolPanels(infoPanelContent, toolResultPanelContent);
    }

    /*
    *   Replace the info and result panels without changing the tool
    */
    public setToolPanels = (infoPanelContent: any, toolResultPanelContent: any): any =>{
        if(toolResultPanelContent){
            return this.addToolResultPanel(toolResultPanelContent);
        }
        else{
            this.removeResultPanel();
            return null;
        }
    }

    /*
    *   Deactivate the current tool and remove the info and result panels.
    */
    public deactivateCurrentTool = (): void => {
        if(this.currentTool){
            this.currentTool.deactivate();
            this.removeResultPanel();
            this.currentTool = null;
        }
        else if(this.isMeasurementsWidgetActivated()){
            this.activateMeasurementsWidget(false, "distance");
            this.activateMeasurementsWidget(false, "area");
        }
        else if(this.isPrintWidgetActivated()){
            this.activatePrintWidget();
        }
        else if(this.isTimeWidgetActivated()){
            this.activateTimeWidget(false);
        }

        var htmlElt = document.getElementById('moreToolsContent');
        if(htmlElt){
            htmlElt.querySelectorAll("a").forEach(function(elt){
                if(elt.id != "photoLink" && elt.id != "coordinatesLink"){
                    elt.classList.remove("active");
                }
            });
        }
        htmlElt = document.getElementById('moreToolsContent');
        if(htmlElt){
            htmlElt.querySelectorAll("button").forEach(function(elt){
                elt.classList.remove("active");
            });
        }

        this.mapMenu.updateExpandLabelTools();
    }

    /*
    *   Activate the print widget
    */
    public activatePrintWidget = (): any => {
        if(!this.printerDisplayed && typeof(this.printer) != 'undefined'){
            this.mapView.ui.add(this.printer, {position: "bottom-left"});
            this.printerDisplayed = true;
        }
        else{
            this.mapView.ui.remove(this.printer);
            this.printerDisplayed = false;
        }
    }
    /**
     * Tells if the printer widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isPrintWidgetActivated = (): boolean =>{
        return this.printerDisplayed;
    }


    /*
    *   Activate the time widget
    */
    public activateTimeWidget = (displayed: boolean): void =>{
        if(displayed){
            this.deactivateCurrentTool();
            var elt = document.getElementById("timeSlider");
            if(elt){
                elt.style.visibility = "visible";
            }            
            this.mapView.ui.add(this.timeSlider, {position: "manual"});
        }
        else{
            this.mapView.ui.remove(this.timeSlider);
        }
        this.timeSliderDisplayed = displayed;
    }

    /**
     * Tells if the time widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isTimeWidgetActivated = (): boolean => {
        return this.timeSliderDisplayed;
    }

    
    /*
    *   Activate the opacity widget
    */
    public activateOpacityWidget = (layer: Layer): void => {
        if(!this.opacitySlider || (this.opacitySlider && this.opacitySlider.destroyed)){
            this.opacitySlider = new OpacitySlider({layer: layer});
            this.mapView.ui.add(this.opacitySlider, {position: "top-right"});
            this.opacitySliderDisplayed = true;
            this.opacitySlider.watch("toClose", (newValue: boolean, oldValue: boolean, propertyName: string, target: any) => {
                if(newValue){
                    this.activateOpacityWidget(layer);
                }
            });
        }
        else{
            var changeLayer = layer.id != this.opacitySlider.layer.id;
            this.mapView.ui.remove(this.opacitySlider);
            this.opacitySlider.destroy();
            this.opacitySliderDisplayed = false;
            if(changeLayer){
                this.activateOpacityWidget(layer);
            }
        }
    }

    /**
     * Tells if the opacity widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isOpacityWidgetActivated = (): boolean => {
        return this.opacitySliderDisplayed;
    }

    
    /*
    *   Activate the symbology widget
    */
    public activateSymbologyWidget = (layer: FeatureLayer, uiEnabled: boolean = true) => {        
        if(!this.symbologyWidget || (this.symbologyWidget && this.symbologyWidget.destroyed)){
            this.symbologyWidget = new Symbology({map: this, layer: layer, uiEnabled: uiEnabled});
            if(uiEnabled){
                this.mapView.ui.add(this.symbologyWidget, {position: "top-right"});
                this.symbologyWidgetDisplayed = true;
                this.symbologyWidget.watch("toClose", (newValue: boolean) => {
                    if(newValue){
                        this.activateSymbologyWidget(layer);
                    }
                });
            }
        }
        else{
            var changeLayer = layer.id != this.symbologyWidget.layer.id;
            this.mapView.ui.remove(this.symbologyWidget);
            this.symbologyWidget.destroy();
            this.symbologyWidgetDisplayed = false;
            if(changeLayer){
                this.activateSymbologyWidget(layer);
            }
        }
    }

    /** 
     * Activates the query widget
    */
    public activateQueryWidget = (layer: Layer) => {              
        if(!this.queryWidget || (this.queryWidget && this.queryWidget.destroyed)){
            this.queryWidget = new QueryLayer({map: this, layer: layer});
            this.mapView.ui.add(this.queryWidget, {position: "top-right"});
            this.queryWidgetDisplayed = true;
            this.queryWidget.watch("toClose", (newValue: boolean) => {
                if(newValue){
                    this.activateQueryWidget(layer);
                }
            })
        }
        else{
            var changeLayer = layer.id != this.queryWidget.layer.id;
            this.mapView.ui.remove(this.queryWidget);
            this.queryWidget.destroy();
            this.queryWidgetDisplayed = false;
            if(changeLayer){
                this.activateQueryWidget(layer);
            }
        }
    }

    /** 
     * Activates the LayerElevationExpr widget
    */
    public activateLayerElevationExpr = (layer: Layer) => {    
        if(this.mapView instanceof SceneView && layer instanceof FeatureLayer){          
            if(!this.layerElevationExpr || (this.layerElevationExpr && this.layerElevationExpr.destroyed)){
                this.layerElevationExpr = new LayerElevationExpr({layer: layer});
                this.mapView.ui.add(this.layerElevationExpr, {position: "top-right"});
                this.layerElevationExprDisplayed = true;
            }
            else{
                var changeLayer = layer.id != this.layerElevationExpr.layer.id;
                this.mapView.ui.remove(this.layerElevationExpr);
                this.layerElevationExpr.destroy();
                this.layerElevationExprDisplayed = false;
                if(changeLayer){
                    this.activateLayerElevationExpr(layer);
                }
            }
        }
    }
    
    /** 
     * Activates the PinLayer widget
    */
    public activatePinLayer = (layer: Layer, useGivenLayer: boolean, editPinnedLayer: boolean) => {   
        if(layer instanceof FeatureLayer){
            if(!this.pinLayer || (this.pinLayer && this.pinLayer.destroyed)){
                this.pinLayer = new PinLayer({layer: layer, map: this, useGivenLayer: useGivenLayer, editPinnedLayer: editPinnedLayer});
                this.mapView.ui.add(this.pinLayer, {position: "top-right"});
                this.pinLayerDisplayed = true;
                this.pinLayer.watch("toClose", (newValue: boolean, oldValue: boolean, propertyName: string, target: any) => {
                    if(newValue){
                        this.activatePinLayer(layer, useGivenLayer, editPinnedLayer);
                    }
                });
            }
            else{
                var changeLayer = layer.id != this.pinLayer.layer.id;
                this.mapView.ui.remove(this.pinLayer);
                this.pinLayer.destroy();
                this.pinLayerDisplayed = false;
                if(changeLayer){
                    this.activatePinLayer(layer, useGivenLayer, editPinnedLayer);
                }
            }
        }
    }

    /*
    *   Activate the measurement widget
    */
    public activateMeasurementsWidget = (displayed: boolean, type: string): void => {
        var measurementWidget: Widget | undefined;
        if(type === "distance"){
            if(this.is3D || this.is3DFlat){
                if(!this.measurementWidgetDistance3D){
                    this.measurementWidgetDistance3D = new DirectLineMeasurement3D({
                        view: this.mapView as SceneView
                    });
                }
                
                measurementWidget = this.measurementWidgetDistance3D;
            }
            else{
                if(!this.measurementWidgetDistance2D){
                    this.measurementWidgetDistance2D = new DistanceMeasurement2D({
                        view: this.mapView as MapView
                    });
                }
                measurementWidget = this.measurementWidgetDistance2D;
            }
        }
        else if(type === "area"){
            if(this.is3D || this.is3DFlat){
                if(!this.measurementWidgetArea3D){
                    this.measurementWidgetArea3D = new AreaMeasurement3D({
                        view: this.mapView as SceneView
                    });
                }
                measurementWidget = this.measurementWidgetArea3D;
            }
            else{
                if(!this.measurementWidgetArea2D){
                    this.measurementWidgetArea2D = new AreaMeasurement2D({
                        view: this.mapView as MapView
                    });
                }
                measurementWidget = this.measurementWidgetArea2D;
            }
        }
        if(measurementWidget){
            if(displayed){
                this.deactivateCurrentTool();
                this.addCloseWidgetButton(null);
                this.mapView.ui.add(measurementWidget, {position: "bottom-left"});
            }
            else{
                this.mapView.ui.remove(measurementWidget);
                this.removeCloseWidgetButton();
            }
            this.measurementsDisplayed = displayed;
        }
    }

    /**
     * Tells if the measurement widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isMeasurementsWidgetActivated = (): boolean =>{
        return this.measurementsDisplayed;
    }

    /*
    *   Activate the coordinates widget
    */
    public activateCoordinatesWidget = (): void =>{
        if(this.coordinatesDisplayed){
            this.mapView.ui.remove(this.coordinates);
            this.coordinatesDisplayed = false;
        }
        else{
            this.mapView.ui.add(this.coordinates, {position: "bottom-right"});
            this.coordinatesDisplayed = true;
        }
    }

    /**
     * Tells if the coordinates convertion widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isCoordinatesWidgetActivated = (): boolean =>{
        return this.coordinatesDisplayed;
    }

    /*
    *   Activate the sketch widget
    */
    public activateSketchWidget = (displayed: boolean): Sketch => {
        if(displayed){
            this.mapView.ui.add(this.sketchWidget, {position: "bottom-left", index: 1});
            this.toggleSketchLayer(displayed);
        }
        else{
            this.mapView.ui.remove(this.sketchWidget);
        }
        this.sketchWidgetDisplayed = displayed;
        return this.sketchWidget; 
    }

    /**
     * Tells if the sketch widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isSketchWidgetActivated = (): boolean =>{
        return this.sketchWidgetDisplayed;
    }

    /**
     * @deprecated
     * Activates a custom widget
     * 
     * @param displayed (boolean) true if the widget should be displayed, false otherwise
     * @param tool (any) the widget
     */
    public activateCustomWidget = (displayed: boolean, tool: any): void => {
        this.deactivateCurrentTool();
        if(displayed){
            //@todo tool.init(App);
        }
        
        this.customToolDisplayed = displayed;
    }

    /**
     * @deprecated
     * Tells if the custom widget is activated or not
     * @returns (boolean) true is the widget is activated, false otherwise
     */
    public isCustomWidgetActivated = (): boolean => {
        return this.customToolDisplayed;
    }

    /**
    *   Apply a filter on each layer of the given feature types
    */
    public applyFilterLayers = (filterInfo: any, featureType: string): void => {
        var layerList: any[];
        if(featureType == Config.TYPE_OBS){
            var displayObs = filterInfo && typeof(filterInfo) === "object" && filterInfo.length > 0 && filterInfo[0] != -1;

            layerList = Config.layerType.filter(l => l.type == featureType);
            this.mapView.map.allLayers.forEach((layer: Layer): void => {
                if(layer instanceof FeatureLayer){
                    if(layerList.map(l => l.id).includes(layer.id)){
                        if(displayObs){
                            // "Enabling" layer
                            layer.minScale = 0;
                            var configLayer = Config.layerType.find(l => l.id == layer.id);
                            if(configLayer){
                                layer.definitionExpression = this.getDefinitionExpression(configLayer.filterField, filterInfo);
                            }
                        }
                        else{
                            // "Disabling" layer
                            layer.minScale = 1;
                        }
                    }
                }
            });
        }
        else{
            layerList = Config.layerType.filter(l => l.type == featureType);
            // If feature type is platform, adding trackline
            if(featureType === Config.TYPE_PTF){
                layerList = layerList.concat(Config.layerType.filter(l => l.type == Config.TYPE_TRACKLINE))
            }
                        
            this.groupLayerOperational.allLayers.forEach((layer: Layer): void => {
                var layerID = layer.id;
                if(layer.id.includes("_GROUP_")){
                    layerID = layer.id.substring(0,layer.id.indexOf("_GROUP_")+6);
                }

                if(layer instanceof FeatureLayer){
                    if(layerList.map(l => l.id).includes(layerID)){
                        var configLayer = Config.layerType.find(l => l.id == layerID);
                        if(configLayer){
                            layer.definitionExpression = this.getDefinitionExpression(configLayer.filterField, filterInfo);
                        }
                    }
                }
            });
        }
    }

    /**
    *   Based on a filter field and a filterInfo, returning the definition expression.
    *   If filterInfo is a string, it will be considered as a direct SQL where clause.
    *   If it is an array, a SQL IN clause will be computed.
    */
    public getDefinitionExpression = (filterField: string, filterInfo: any): string => {
        var whereClause = "1=1";
        if (filterInfo) {
            if(typeof(filterInfo) === "string"){
                whereClause += " AND " + filterInfo;
            }
            else if(typeof(filterInfo) === "object" && filterInfo.length > 0){
                whereClause += " AND " + Utils.buildWhereClause(filterField, filterInfo);
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
    public addToWorkLayerList = (layer: any): void => {
        this.groupLayerWork.add(layer);
    }

    /**
    *   Updates a layer's definition expression
    */
    public updateLayerDefinitionExpression = (layer: FeatureLayer | MapImageLayer, definitionExpression: string, sublayerId?: number): void =>{
        if(layer instanceof MapImageLayer && typeof(sublayerId) != 'undefined'){
            var sublayer = layer.findSublayerById(sublayerId);
            sublayer.definitionExpression = definitionExpression;
        }
        else if(layer instanceof FeatureLayer){
            layer.definitionExpression = definitionExpression;
            if(this.groupLayerWork.findLayerById(layer.id)){
                this.settings.updateWorkLayerToLocalStorage(layer.id, layer.title, layer.renderer.toJSON(), layer.definitionExpression);
            }
        }
    }

    /**
     * From a given layer ID, determine to what category the layer should be added and add the layer using the appropriate function (it not already added).
     * @param {string} layer ID
     */
    public addLayer = (layerId: string, visibility?: boolean, definitionExpression?: string, renderer?: any): void => {
        // Testing if already added
        if(!this.mapView.map.allLayers.map(l => l.id).includes(layerId)){
            // Testing layer category
            if(Config.operationalLayers.map(l => l.id).includes(layerId)){
                const config = Config.operationalLayers.find(l => l.id == layerId);
                if(config && config.url.endsWith("/MapServer/")){
                    fetch(config.url + "?f=pjson").then((data) => {
                        // Json info on service
                        data.json().then((info: any) => {
                            info.layers.forEach((elt: any) => {
                                this.addOperationalLayer(layerId, visibility, definitionExpression, renderer, elt);
                            });
                        });
                    });
                }
                else{
                    this.addOperationalLayer(layerId, visibility, definitionExpression, renderer);
                }
            }
            else if(Config.dynamicLayers.map(l => l.id).includes(layerId)){
                this.addOtherLayer(layerId, visibility);
            }
        }
    }

    /**
     * Add a layer from a given ID.
     * @param {string} layer ID
     */
    public addOperationalLayer = (layerId: string, inVisibility?: boolean, inDefinitionExpression?: string, inRenderer?: any, subLayerInfo?: any): void =>{
        // Get object refs from parent window
        var ptfRefs = [];
        var cruiseRefs = [];
        var lineRefs = [];
        var obsRefs = [];
        var siteRefs = [];
        if(!AppInterface.getEmptyGisSample()){
            ptfRefs = AppInterface.getObjectsRefs(Config.TYPE_PTF);
            cruiseRefs = AppInterface.getObjectsRefs(Config.TYPE_CRUISE);
            lineRefs = AppInterface.getObjectsRefs(Config.TYPE_LINE);
            obsRefs = AppInterface.getObjectsRefs(Config.TYPE_OBS);
            siteRefs = AppInterface.getObjectsRefs(Config.TYPE_SITE);
        }
        else{
        }
        
        if(!ptfRefs){
            // If null, checking URL parameters
            if(this.settings.filter && this.settings.filter.platform){
                ptfRefs = this.settings.filter.platform;
            }
        }

        if(!cruiseRefs){
            // If null, checking URL parameters
            if(this.settings.filter && this.settings.filter.cruise){
                cruiseRefs = this.settings.filter.cruise;
            }
        }
        if(!lineRefs){
            // If null, checking URL parameters
            if(this.settings.filter && this.settings.filter.line){
                cruiseRefs = this.settings.filter.line;
            }
        }
        if(!siteRefs){
            // If null, checking URL parameters
            if(this.settings.filter && this.settings.filter.site){
                siteRefs = this.settings.filter.site;
            }
        }

        // Default popup templates
        var popupTemplatePtf = new PopupTemplate({title: Config.POPUP_OPERATIONAL_PTF_TITLE, content: Config.POPUP_OPERATIONAL_PTF_CONTENT});
        var popupTemplateObs = new PopupTemplate({title: Config.POPUP_OBS_LAYERS_TITLE, content: Config.POPUP_OBS_LAYERS_CONTENT});
        var popupTemplateTrackline = new PopupTemplate({title: Config.POPUP_TRACKLINE_LAYERS_TITLE, content: Config.POPUP_TRACKLINE_LAYERS_CONTENT});
        var popupTemplateDefault = new PopupTemplate({title: "Attributes", content: Config.POPUP_OTHERS});

        var layer: any = Config.operationalLayers.find(l => l.id == layerId);
        var newLayerID = layerId;
        if(typeof(subLayerInfo) != 'undefined'){
            newLayerID = layerId + "_" + subLayerInfo.id.toString();
        }
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
                case Config.TYPE_PTF:
                    popupTemplate = popupTemplatePtf;
                    break;
                case Config.TYPE_OBS_PTF:
                    popupTemplate = popupTemplateObs;
                    break;
                case Config.TYPE_TRACKLINE:
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
                if(layer.type == Config.TYPE_PTF){
                    popupTemplate.actions = new Collection<ActionButton>();
                    popupTemplate.actions.add(new ActionButton({
                        "title": "Details Page",
                        "id": "ptf-inspect",
                        "className": "esri-icon-review"
                    }));
                }
                else if (layer.type == Config.TYPE_LINE) {
                    popupTemplate.actions = new Collection<ActionButton>();
                    popupTemplate.actions.add(new ActionButton({
                        "title": "Details Page",
                        "id": "line-inspect",
                        "className": "esri-icon-review"
                    }));
                }
                else if (layer.type == Config.TYPE_CRUISE) {
                    popupTemplate.actions = new Collection<ActionButton>();
                    popupTemplate.actions.add(new ActionButton({
                        "title": "Details Page",
                        "id": "cruise-inspect",
                        "className": "esri-icon-review"
                    }));
                }
            }
            popupTemplate.outFields = ["*"];
        }

        // Defining definition expression
        var definitionExpression = null;
        var layerTypeInfo = Config.layerType.find(l => l.id == layer.id);
        if(ptfRefs && layerTypeInfo && (layerTypeInfo.type == Config.TYPE_PTF || layerTypeInfo.type == Config.TYPE_TRACKLINE)){
            definitionExpression = this.getDefinitionExpression(layerTypeInfo.filterField, ptfRefs);
        }
        if(cruiseRefs && layerTypeInfo && layerTypeInfo.type == Config.TYPE_CRUISE){
            definitionExpression = this.getDefinitionExpression(layerTypeInfo.filterField, cruiseRefs);
        }
        if(lineRefs && layerTypeInfo && layerTypeInfo.type == Config.TYPE_LINE){
            definitionExpression = this.getDefinitionExpression(layerTypeInfo.filterField, lineRefs);
        }
        if(obsRefs && layerTypeInfo && layerTypeInfo.type == Config.TYPE_OBS){
            var displayObs = obsRefs && typeof(obsRefs) === "object" && obsRefs.length > 0 && obsRefs[0] != -1;
            if(displayObs){
                minScale = 0;
                definitionExpression = this.getDefinitionExpression(layerTypeInfo.filterField, obsRefs);
            }
        }
        if(siteRefs && layerTypeInfo && layerTypeInfo.type == Config.TYPE_SITE){
            definitionExpression = this.getDefinitionExpression(layerTypeInfo.filterField, siteRefs);
        }
        if(inDefinitionExpression){
            definitionExpression = inDefinitionExpression;
        }

        // Visibility will be overriden in the following order: function parameter > session storage > default visibility
        var visibility = this.settings.getLayerVisibilityFromSessionStorage(layer.id);
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

        var url = layer.url;
        var name = layer.name;
        if(typeof(subLayerInfo) != 'undefined'){
            url = layer.url + subLayerInfo.id.toString();
            name = subLayerInfo.name;
        }

        var params:any = {
            id : newLayerID,
            outFields : ["*"],
            minScale: minScale,
            maxScale: maxScale,
            visible : visibility,
            timeInfo: timeInfo,
            useViewTime: layer.useViewTime,
            url: url,
            title: name,
            popupEnabled: (popupTemplate != null),
            popupTemplate : popupTemplate
        };

        if(this.is3D || this.is3DFlat){
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
            if(!Utils.isWebsiteVersion() && layer.defaultWhereClause && layer.defaultWhereClause.length > 0){
                params["definitionExpression"] = layer.defaultWhereClause;
            }
        }
        
        // Looking for existing renderer
        var savedRenderer = this.settings.getLayerRendererFromSessionStorage(newLayerID);
        if(inRenderer){
            params.renderer = inRenderer;
        }
        else if(savedRenderer){
            params.renderer = savedRenderer;
        }
        var currentLayer = new FeatureLayer(params);
        // If no renderer preset, applying the default one after layer initialization (async)
        if(!inRenderer && !savedRenderer){
            var symbologyFields = layer.symbologyFields;
            if(subLayerInfo){
                symbologyFields = layer.symbologyFields[subLayerInfo.id.toString()]
            }
            if(symbologyFields && symbologyFields.length > 0){
                var filename = layer.theme + "-" + newLayerID + "-" + symbologyFields[0] + ".json";
                this.loadJsonSymbology(currentLayer, filename);
            }
        }

        var groupLayer = null;
        if(!this.operationalSubGroupLayerList[layer.layerGroupMap]){
            // Creating Group layer
            var groupInfo = Config.layerGroupsMap.find(elt => elt.id === layer.layerGroupMap);
            if(groupInfo){
                groupLayer = new GroupLayer({
                    id: layer.layerGroupMap,
                    title: groupInfo.name,
                    visible: true,
                    visibilityMode: "independent"
                });
                this.operationalSubGroupLayerList[layer.layerGroupMap] = groupLayer;
            }
        }
        else{
            groupLayer = this.operationalSubGroupLayerList[layer.layerGroupMap];
        }
        if(groupLayer){
            groupLayer.add(currentLayer);
            this.groupLayerOperational.add(groupLayer);
        }
        else{
            this.groupLayerOperational.add(currentLayer);
        }
        this.addedLayerIds.push(newLayerID);

        // Highlighting
        if(layerTypeInfo && (layerTypeInfo.type == Config.TYPE_PTF)){
            if(this.settings.highlight && this.settings.highlight.platform){
                if(currentLayer instanceof FeatureLayer){
                    var highlight: any;
                    this.mapView.whenLayerView(currentLayer).then((layerView) => {                        
                        var query = currentLayer.createQuery();
                        query.where = this.settings.highlight.platform;
                        currentLayer.queryFeatures(query).then(function(result){
                            if (highlight) {
                                highlight.remove();
                            }
                            highlight = layerView.highlight(result.features);
                        });
                    });
                }
            }
        }        
    }

    /**
     * Add a layer from a given ID.
     * @param {string} layer ID
     */
    public addOtherLayer = (layerId: string, visibility: any): Layer => {
        var layer: any = Config.dynamicLayers.find(l => l.id == layerId);

        var currentLayer;
        var params: any = {
            id : layerId,
            visible : true,
            url: layer.url,
            title: layer.name,
            opacity: layer.defaultOpacity || 1
        };
        if(layer.type == "featureLayer"){
            if(this.is3D || this.is3DFlat){
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
        else if(layer.type == "tile"){
            currentLayer = new TileLayer(params);
        }
        else{
            if(layer.sublayers){
                params.sublayers = layer.sublayers;
            }

            currentLayer = new MapImageLayer(params);
        }

        var groupLayer = null;
        if(!this.otherSubGroupLayerList[layer.group]){
            // Creating Group layer
            var groupInfo = $.grep(Config.layerGroups, function(elt, idx){
                return elt.id === layer.group;
            });
            groupLayer = new GroupLayer({
                id: layer.group,
                title: groupInfo[0]["name"],
                visible: true, 
                visibilityMode: "independent"
            });
            this.otherSubGroupLayerList[layer.group] = groupLayer;
        }
        else{
            groupLayer = this.otherSubGroupLayerList[layer.group];
        }

        this.groupLayerOthers.add(currentLayer, layer.index);
        currentLayer.watch("loaded", (newValue, oldValue, property, object): void => {
            if(object instanceof Layer){
                // Visibility
                if(visibility && visibility.root){
                    object.visible = visibility.root;
                    if(object instanceof MapImageLayer){
                        for(var i = 0; i < object.allSublayers.length ; i++){
                            object.allSublayers.getItemAt(i).visible = visibility.sublayers[object.allSublayers.getItemAt(i).id];
                        }
                    }
                }
                else if (visibility){
                    object.visible = visibility;
                }
            }
        });
        this.addedLayerIds.push(layerId);   
        
        return currentLayer;
    }

    /**
     * Updates the full time extent of the time slider. If not intiliazed yet, replacing default values.
     * Updates as well the stops value if only one layer is defined as being time aware.
     */
    public updateFullTimeExtent = (): void => {
        var stops = null;
        var newUnit: string, newValue: number;
        var nbLayers = 0;
        var units = {"years": 40, "months": 30, "days": 20, "hours": 10};
        this.mapView.map.allLayers.forEach((layer): void => {
            if(layer instanceof FeatureLayer){
                if(layer.timeInfo){
                    nbLayers++;
                    if(!this.fullTimeExtent){
                        this.fullTimeExtent = this.timeSlider.fullTimeExtent;
                        this.fullTimeExtent.start = layer.timeInfo.fullTimeExtent.start;
                        this.fullTimeExtent.end = layer.timeInfo.fullTimeExtent.end;
                    }
                    else{
                        if(this.fullTimeExtent.start > layer.timeInfo.fullTimeExtent.start){
                            this.fullTimeExtent.start = layer.timeInfo.fullTimeExtent.start;
                        }
                        if(this.fullTimeExtent.end <  layer.timeInfo.fullTimeExtent.end){
                            this.fullTimeExtent.end = layer.timeInfo.fullTimeExtent.end;
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
            }
        });
        // Overriding bug: time aware layers do not refresh their time extent automatically
        this.timeSlider.fullTimeExtent.end = new Date();
        if(this.fullTimeExtent.start && this.fullTimeExtent.end){
            this.timeSlider.fullTimeExtent = this.fullTimeExtent;
            if(nbLayers == 1 && stops){
                this.timeSlider.stops = stops;
            }
            // Resetting to full extent in any case
            this.timeSlider.timeExtent.start = this.timeSlider.fullTimeExtent.start;
            this.timeSlider.timeExtent.end = this.timeSlider.fullTimeExtent.end;
            // Play/stop to force refresh the widget 
            this.timeSlider.play();
            this.timeSlider.stop();
        }
    }

    /**
     * Adds kml layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    public addKMLLayer = (id: string, name: string, url: string):void =>{
        var layer = new KMLLayer({
            id: id,
            title: name,
            url: url
        });
        this.groupLayerWork.add(layer);
    }

    /**
     * Adds WMS layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    public addWMSLayer = (id: string, name: string, url: string):void =>{
        var layer = new WMSLayer({
            id: id,
            title: name,
            url: url
        });
        this.groupLayerWork.add(layer);
    }

    /**
     * Adds ArcGIS MapServer layer to the map.
     * @param {string} id   ID of the new layer
     * @param {string} name Name of the new layer
     * @param {string} url  URL of the new layer
     */
    public addArcgisLayer = (id: string, name: string, url: string): void =>{
        var layer = new FeatureLayer({
            id: id,
            title: name,
            url: url
        });
        this.groupLayerWork.add(layer);
    }

    /**
     * Adds a CSV layer to the map.
     * @param {string} id       ID of the new layer
     * @param {string} url      URL of the new layer
     * @param {string} latField Name of the latitude field in the CSV file
     * @param {string} lonField Name of the longitude field in the CSV file
     */
    public addCSVLayer = (id: string, url: string, latField: string, lonField: string): void =>{
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
        this.activatePinLayer(layer, true, false);
    }

    /**
     * Keeps track of elevation-based layer IDs in order to further adapt them when the bathymetry's exageration is updated.
     * @param {integer} layerID Layer's true ID, as added on the map.
     * @param {integer} baseID  If the layer is derived from a generic layer (i.e. an observation layer, for a specific platform), specify the bade-layer ID here. If null, it will take the layer ID as a value.
     */
    public addLayerWithElevationInfoID = (layerID: string, baseID: string): void => {
        this.withElevationInfoLayerIDs.push({layerID: layerID, baseID: (baseID ? baseID : layerID)});
        if(typeof(this.exaggerationWidget) != 'undefined'){
            this.exaggerationWidget.withElevationInfoLayerIDs.push({layerID: layerID, baseID: (baseID ? baseID : layerID)});
        }
    }

    /**
     * When an elevation-based layer is removed from the map, removing its record from the elevation layers list.
     * @param  {integer} layerID The layer's ID to remove.
     */
    public removeFromElevationLayerIDs = (layerID: string): void => {
        for(var i = 0; i < this.withElevationInfoLayerIDs.length; i++){
            if(this.withElevationInfoLayerIDs[i].layerID == layerID){
                this.withElevationInfoLayerIDs.splice(i, 1);
            }
        }
        if(typeof(this.exaggerationWidget) != 'undefined'){
            for(var i = 0; i < this.exaggerationWidget.withElevationInfoLayerIDs.length; i++){
                if(this.exaggerationWidget.withElevationInfoLayerIDs[i].layerID == layerID){
                    this.exaggerationWidget.withElevationInfoLayerIDs.splice(i, 1);
                }
            }
        }
    }

    /**
     * De/activates the sketch layer
     * @param shouldDisplay true if the sketch layer should be displayed, false otherwise
     */
    public toggleSketchLayer = (shouldDisplay: boolean): void => {
        this.sketchLayer.visible = shouldDisplay;
        if(!this.mapView.map.findLayerById(this.sketchLayer.id) && shouldDisplay){
            this.groupLayerWork.add(this.sketchLayer);
        }
    }

    /**
     * Activates the edit tool and synchronises the given array of objects
     * @param arrayOfObjects 
     */
    public processDraftPtfs = (arrayOfObjects: any[]): void => {
        if(arrayOfObjects){
            if(!this.isEditGraphicDisplayed()){
                this.activateEditGraphic();
            }
            this.editGraphic.syncDraftPtfs(arrayOfObjects, "all");
        }
    }

    /**
     * Activates the edit tool and deletes the given array of objects
     * @param arrayOfObjects 
     */
    public deleteDraftPtfs = (arrayOfObjects: any[]): void => {
        if(arrayOfObjects){
            if(!this.isEditGraphicDisplayed()){
                this.activateEditGraphic();
            }
            this.editGraphic.syncDraftPtfs(arrayOfObjects, "delete");
        }
    }

    /**
     * @todo
     * @param arrayOfObjects 
     */
    public selectDraftPtfs = (arrayOfObjects: any[]): void => {
        
    }

    /**
     * Displays the observations for a given reference
     * @param srcLayerInfo (any) the configuration informatino of the layer
     * @param objectRef (string) the reference to use
     * @returns the added FeatureLayer
     */
    public showObservations = (srcLayerInfo: any, objectRef: string): FeatureLayer => {
        var layerId = srcLayerInfo.id + "_" + objectRef;
        var layerName = objectRef + " observations";
        var existingLayer = this.mapView.map.findLayerById(layerId) as FeatureLayer;
        var resultLayer: FeatureLayer;

        if(!existingLayer){
            var whereClause = srcLayerInfo.idField + "='" + objectRef + "'";                
            var renderer = new SimpleRenderer({symbol: Config.OBSERVATIONS_SYMBOL, label: "Observation"});
            resultLayer = this.addWorkLayer(layerId, srcLayerInfo.id, layerName, renderer, whereClause, true);
        }
        else{
            existingLayer.visible = true;
            resultLayer = existingLayer;
        }
        return resultLayer;
    }

    /**
     * Displays the trackline for a given reference
     * @param srcLayerInfo (any) the configuration informatino of the layer
     * @param objectRef (string) the reference to use
     * @returns the added FeatureLayer
     */
    public showTrackline = (srcLayerInfo: any, objectRef: string): FeatureLayer => {
        var layerId = srcLayerInfo.id + "_" + objectRef;
        var layerName = objectRef + " trackline";
        var existingLayer = this.mapView.map.findLayerById(layerId) as FeatureLayer;
        var resultLayer: FeatureLayer;

        if(!existingLayer){
            var whereClause = srcLayerInfo.idField + "='" + objectRef + "'";
            var symbol = symbolJsonUtils.fromJSON(Config.TRACKLINE_SYMBOL);

            var popupTemplate = null;
            if(srcLayerInfo.popupTitle && srcLayerInfo.popupContent){
                var popupOptions = {title: srcLayerInfo.popupTitle, content: srcLayerInfo.popupContent};
                if(srcLayerInfo.popupFieldInfos){
                    popupOptions["fieldInfos"] = srcLayerInfo.popupFieldInfos;
                }
                popupTemplate = new PopupTemplate(popupOptions);
            }
            else{
                popupTemplate = new PopupTemplate({title: Config.POPUP_TRACKLINE_LAYERS_TITLE, content: Config.POPUP_TRACKLINE_LAYERS_CONTENT});
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

            this.groupLayerWork.add(tracklineLayer);
            resultLayer = tracklineLayer;
        }
        else{
            existingLayer.visible = true;
            resultLayer = existingLayer;
        }
        return resultLayer;
    }

    public removeWorkLayer = (layerId: string): void => {
        var layer = this.mapView.map.findLayerById(layerId);
        if(layer){
            this.groupLayerWork.remove(layer);
        }
    }

    public removeAllWorkLayers = (): void =>{
        this.groupLayerWork.removeAll();
    }

    /**
     * Activate the cruise editing mode, switching off all extra layers and activating the drawing tool in polyline mode
     */
    public activateCruiseEditingMode = (): void =>{
        // Switch off all layers, except port layer
        const portLayerID = "pointsOfInterest";
        const subLayerID = 1;
        var portLayerAdded = false;
        this.groupLayerOperational.allLayers.forEach((layer: Layer): void => {
            layer.visible = false;
        });
        this.groupLayerWork.allLayers.forEach((layer: Layer): void => {
            if(layer.id !== this.sketchLayer.id){
                layer.visible = false;
            }
        });
        this.groupLayerOthers.allLayers.forEach((layer: Layer): void => {
            if(layer.id === portLayerID){
                var portLayer = layer as MapImageLayer;
                var subLayer = portLayer.sublayers.find(sl => sl.id === subLayerID);
                if(subLayer){
                    subLayer.visible = true;
                    portLayerAdded = true;
                }
            }
            else{
                layer.visible = false;
            }
        });
        // Check and add ports layers if needed
        if(!portLayerAdded){
            var portLayer = this.addOtherLayer(portLayerID, true) as MapImageLayer;
            portLayer.when(() => {
                var subLayer = portLayer.sublayers.find(sl => sl.id === subLayerID);
                if(subLayer){
                    subLayer.visible = true;
                }
            })
        }
        // Add editor/drawing tool and activate line drawing with snapping
        if(!this.isEditGraphicDisplayed()){
            this.activateEditGraphic();
            this.editGraphic.activateDrawingTool("polyline");
        }
    }
    // #endregion

    // ========================================================================
    // #region Private methods
    // ========================================================================
    /**
     * Setup method, called when the MapView is loaded
     */
     private setupView = (): void => {
        // Watching for layer addition
        this.mapView.map.allLayers.on("change", (event): void => {
            if (event.added.length > 0) {
                event.added.forEach((layer: Layer): void => {
                    if(layer instanceof FeatureLayer){
                        if(layer.loaded){
                            if(layer.timeInfo){
                                layer.useViewTime = true;
                                if(layer.timeInfo){
                                    if(!this.settings.platformTrack){
                                        this.mapView.ui.add(this.mapMenu.timeToolLink, {position: "top-left"});
                                    }
                                    this.updateFullTimeExtent();
                                }
                            }
                        }
                        else{
                            layer.when((): void => {
                                if(layer.timeInfo){
                                    layer.useViewTime = true;
                                    if(layer.timeInfo){
                                        if(!this.settings.platformTrack){
                                            this.mapView.ui.add(this.mapMenu.timeToolLink, {position: "top-left"});
                                        }
                                        this.updateFullTimeExtent();
                                    }
                                }
                            })
                        }
                    }
                });
            }
            // Removing time slider if not time layer
            if (event.removed.length > 0) {
                var timeEnabled = false;                        
                this.mapView.map.allLayers.forEach((layer: Layer): void => {
                    if(layer instanceof FeatureLayer){
                        timeEnabled = layer.useViewTime;
                    }
                });
                if(!timeEnabled){
                    this.activateTimeWidget(false);                           
                    this.mapView.ui.remove(this.mapMenu.timeToolLink);
                }
                // Updating AddLayer modal
                event.removed.forEach((layer:Layer) =>{
                    var layerID = layer.id;
                    if(layer.id.includes("_GROUP_")){
                        layerID = layer.id.substring(0,layer.id.indexOf("_GROUP_")+6);
                    }
                    var badgeAdd = document.getElementById("badge-add-" + layerID) as HTMLButtonElement;
                    if(badgeAdd){
                        badgeAdd.className = "badge bg-light text-dark";
                        badgeAdd.innerHTML = "Add";
                        badgeAdd.disabled = false;
                    }
                });
            }
          });

        if(this.mapView.updating){
            Utils.setMainLoading(true);
        }
        var initialLoading = true;
        // Handling loader based on the map status (do not control rendering time)
        this.mapView.watch("updating", (newValue, oldValue, property, object) => {
            if(newValue){
                Utils.setMainLoading(true);
            }
            else{
                Utils.setMainLoading(false);
                if(initialLoading){
                    initialLoading = false;
                    if(this.settings.extent == "data"){
                        this.setExtent("data-extent");
                    }
                    else if(Object.keys(Config.extentPresets).indexOf(this.settings.extent)>=0){
                        var extent = new Extent(Config.extentPresets[this.settings.extent]);
                        this.setExtent("given-extent", extent);
                    }
                    else if(typeof(this.settings.extent) == 'object'){
                        // Array [xmin, ymin, xmax, ymax] (4326)
                        var extent = new Extent({"xmin": this.settings.extent[0], "ymin": this.settings.extent[1], "xmax": this.settings.extent[2], "ymax": this.settings.extent[3],
                            "spatialReference": SpatialReference.WGS84});
                        this.setExtent("given-extent", extent);
                    }
                }
            }
        });

        // Popup actions event
        this.mapView.popup.on("trigger-action", this.popupActionsHandler);

        // Initializing layers (order is important here, adding the bottom ones first)
        this.initOtherLayers();
        this.initOperationalLayers();
        this.initWorkLayers();

        // Initializing layer list, printer and coordinates
        this.layerList = new LayerList({
            id: "layerList",
            view: this.mapView,
            selectionEnabled: true,
            listItemCreatedFunction: this.defineLayerListActions
        });
        this.layerList.on("trigger-action", this.layerListActionsHandler);
        if(!this.is3D && !this.is3DFlat){
            this.printer = new Print({
                view: this.mapView as MapView,
                templateOptions: {
                    copyright: "OceanOPS",
                    layout: "a4-landscape",
                    dpi: "300"
                },
                portal: {url: Config.PORTAL_URL}
            });
        }
        var today = new Date();
        var defaultFullTimeExtent = {
            start: new Date(1995, 0, 1),
            end: new Date()
        }
        var timeExtent: {};
        if(!this.fullTimeExtent){
            timeExtent = defaultFullTimeExtent;
        }
        else{
            timeExtent = this.fullTimeExtent;
        }
        this.timeSlider = new TimeSlider({
            container: "timeSlider",
            view: this.mapView,
            //layout: "compact",
            mode: "time-window",
            fullTimeExtent: timeExtent,
            stops: {
                interval: new TimeInterval ({
                  value: 1,
                  unit: "months"
                })
            },
            timeExtent:{
                start: new Date(today.getFullYear()-1,today.getMonth(), today.getDate()),
                end: today
            }
        });
          
        this.coordinates = new CoordinateConversion({
            view: this.mapView
        });

        this.sketchWidget = new Sketch({
            view: this.mapView,
            layer: this.sketchLayer,
            availableCreateTools: ["point", "polyline"],
            creationMode: "continuous"
        });
        
        if(Utils.isWebsiteVersion()){
            var mapOff = document.createElement("div");
            mapOff.className = "esri-component esri-widget--button esri-widget";
            mapOff.setAttribute("title","Turn off map");
            mapOff.innerHTML = "<span aria-hidden=\"true\" class=\"esri-icon esri-icon-non-visible\"></span>" + 
                "<span class=\"esri-icon-font-fallback-text\">Turn off map</span>";
            mapOff.onclick = () => {
                window.parent["watermark"].display();
                $(".esri-ui-corner").css("visibility", "hidden");
                $('#standby-btn').hide();

                // EMPTY GIS SAMPLES TO CLEAR MAP BEHIND MASK
                AppInterface.objectsChanged([], 'platform');
                setTimeout(function(){
                    window.parent["App"].config.emptyGisSample = true;
                },2000);
            };
            this.mapView.ui.add([mapOff], "top-left");
        }
        
        if(this.mapView.type == "2d"){
            var defaultExtent = new Home({
                id: "default-extent",
                view: this.mapView
            });
            var dataExtent = document.createElement("div");
            dataExtent.className = "esri-component esri-widget--button esri-widget";
            dataExtent.setAttribute("title","Data extent");
            dataExtent.innerHTML = "<span aria-hidden=\"true\" class=\"esri-icon esri-icon-zoom-in-fixed\"></span>" + 
                "<span class=\"esri-icon-font-fallback-text\">Data extent</span>";
            dataExtent.onclick = ():void => { this.setExtent("data-extent");};
            if(!this.settings.platformTrack){
                this.mapView.ui.add([defaultExtent, dataExtent], "top-left");
            }
            else{
                this.mapView.ui.add([dataExtent], "top-left");
            }
        }

        this.mapView.popup.dockOptions["position"] = "bottom-center";
        this.mapView.popup.defaultPopupTemplateEnabled = true;
        
        this.mapView.popup.watch("selectedFeature", function(graphic) {
            if(graphic){
                if(graphic.layer){
                    var layer = Config.operationalLayers.find(l => l.id === graphic.layer.id);
                    if(layer){
                        if(layer.type == Config.TYPE_PTF && layer.theme == Config.THEME_ALL){
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

        if(!this.settings.platformTrack){
            this.mapMenu = new MapMenu(this);
        }

        Utils.mapLoaded();
    }

    /*
    *   Defines a symbology for the given feature layer
    */
    private loadJsonSymbology = (featureLayer: FeatureLayer, fileName: string): void => {
        fileName = fileName.replace(/ /g, '_');

        // Fast way to load symbology
        fetch("symbologies/" + fileName).then((response: Response) =>{
            var dataP = response.text();
            // Folder containing symbologies, using auto cast ESRI values 
            dataP.then((data: string) => {
                var renderer = JSON.parse(data);
                featureLayer.renderer = renderer;
            });
        }, 
        function(err){
            console.error(err);
        });
    };

    /*
    * Set the extent of map
    */
    private setExtent = (extentType: "data-extent" | "layer-extent" | "given-extent", input ?: FeatureLayer | Extent): void => {
        if(extentType === "data-extent"){
            // Set the extent to the data extent, based on all feature layers
            let extents: Extent[] = [];
            let layers: Collection = this.mapView.map.allLayers.filter(x => x.type === "feature" && x.visible);
            let cnt = 0;
            for(var i = 0; i < layers.length; i++){
                var layer = layers.getItemAt(i);
                layer.queryExtent({outSpatialReference: this.mapView.spatialReference, where: layer.definitionExpression}).then((result: any) => {
                    cnt++;
                    if(result.count > 0){
                        extents.push(result.extent);
                    }
                    if(cnt == layers.length){
                        let newExtent = extents[0];
                        for(let j = 1; j < extents.length; j++){
                            newExtent = newExtent.union(extents[j]);
                        }
                        this.mapView.goTo(newExtent);
                    }
                });
            }
        }
        else if(extentType == "layer-extent" && typeof(input) != 'undefined' && input instanceof FeatureLayer){
            input.queryExtent({outSpatialReference: this.mapView.spatialReference, where: input.definitionExpression}).then((result: any) => {
                if(result.count > 0){
                    this.mapView.goTo(result.extent);
                }
            });
        }
        else if(extentType == "given-extent" && typeof(input) != 'undefined' && input instanceof Extent){
            this.mapView.goTo(input);
        }
    };

    /**
     * Determines recursively if a layer is under a group identified by the given ID.
     * @param layer the layer subject to the test
     * @param groupLayerID the group layer ID
     * @returns true if the layer is under the group, false otherwise
     */
    private isUnderGroup = (layer: any, groupLayerID: string): boolean =>{
        // if the current layer is a top level group, testing its ID
        if(typeof(layer.parent.parent) == "undefined"){
            return layer.id == groupLayerID;
        }
        // If the current layer is a group and is the one we are looking for
        // If not, we still want to search recursively
        else if(layer.type == "group" && layer.id == groupLayerID){
            return true;
        }
        // Recursion
        else{
            return this.isUnderGroup(layer.parent, groupLayerID);
        }
    }

    /*
    *   Defines the actions related to each layer in the layer list
    */
    private defineLayerListActions = (event: any): void => {
        var item = event.item;
        var layer = event.item.layer;

        var actions: any[] = [];
        if(layer.type == "feature" && this.isUnderGroup(layer,this.groupLayerOperational.id)){
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

            if(!Utils.isWebsiteVersion()){
                actions[1].push({
                    title: "Change query",
                    className: "esri-icon-filter",
                    id: "change-query"
                });
            }
            if((this.is3D || this.is3DFlat) && layer.type == "feature"){
                actions[1].push({
                    title: "Change elevation expression",
                    className: "esri-icon-polygon",
                    id: "change-elevation-expr"
                });
            }
        }
        else if(layer.type == "group" && layer.parent.id === this.groupLayerOperational.id){
            actions = [[],[]];
            actions[0].push({
                title: "Remove",
                className: "esri-icon-close",
                id: "remove-operational-layer"
            });
        }
        else if(layer.parent.id === this.groupLayerOthers.id){
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
            if((this.is3D || this.is3DFlat) && layer.type == "feature"){
                actions[1].push({
                    title: "Change elevation expression",
                    className: "esri-icon-polygon",
                    id: "change-elevation-expr"
                });
            }
        }
        else if(layer.parent.id === this.groupLayerWork.id){
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
            actions[1].push({
                title: "Edit name & symbology",
                className: "esri-icon-settings",
                id: "customize-symbology"
            });            
            if((this.is3D || this.is3DFlat) && layer.type == "feature"){
                actions[1].push({
                    title: "Change elevation expression",
                    className: "esri-icon-polygon",
                    id: "change-elevation-expr"
                });
            }
        }
        
        item.actionsSections = actions;

        if (item.layer.type != "group"){
            item.panel = {
                content: "legend",
                open: false
            };
        }
    
    }

    /**
     * Handles the actions link to every layer/group layer in the layer list.
     */
    private layerListActionsHandler = (event: any): void =>{
        var id = event.action.id;
        var layer = event.item.layer;
        if(id === "change-symbology"){
            this.activateSymbologyWidget(layer, true);
        }
        else if(id === "customize-symbology"){
            this.activatePinLayer(layer, true, true);
        }
        else if(id === "pin-layer"){
            this.activatePinLayer(layer, false, false);
        }
        else if(id === "remove-operational-layer"){
            this.groupLayerOperational.remove(layer);
            this.settings.removeLayerFromSessionStorage(layer.id, "operationalLayers");
            this.addedLayerIds.splice(this.addedLayerIds.findIndex(l => l === layer.id),1);
        }
        else if(id === "remove-other-layer"){
            this.groupLayerOthers.remove(layer);
            this.settings.removeLayerFromSessionStorage(layer.id, "otherLayers");
            this.addedLayerIds.splice(this.addedLayerIds.findIndex(l => l === layer.id),1);
        }
        else if(id === "remove-work-layer"){
            this.removeFromElevationLayerIDs(layer.id);
            this.groupLayerWork.remove(layer);
            this.settings.removeWorkLayerFromLocalStorage(layer.id);
        }
        else if(id === "change-opacity"){
            this.activateOpacityWidget(layer);
        }
        else if(id === "change-query"){
            this.activateQueryWidget(layer);
        }
        else if(id === "change-elevation-expr"){
            this.activateLayerElevationExpr(layer);
        }
    }

    /*
    *   Handles the actions link to every popups.
    */
    private popupActionsHandler = (event: any): void => {
        var id = event.action.id;
        var feature = this.mapView.popup.selectedFeature;

        if(id === "ptf-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.PTF_REF;
            if (Utils.isWebsiteVersion()) {
                //Send to Dashboard
                window.parent["displayInspectPtf"](objectRef);
            }
            else{
                window.open(Config.URL_INSPECT_PTF.replace("{PTF_REF}", objectRef));
            }
        }
        else if(id === "cruise-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.ID;
            if (Utils.isWebsiteVersion()){
                //Send to Dashboard
                window.parent["openInspectCruise"](objectRef);
            }
            else{
                objectRef = feature.attributes.REF;
                window.open(Config.URL_INSPECT_CRUISE.replace("{REF}", objectRef));
            }
        }
        else if(id === "line-inspect"){
            // Inspect PTF
            var objectRef = feature.attributes.ID;
            if (Utils.isWebsiteVersion()){
                //Send to Dashboard
                window.parent["openInspectLine"](objectRef);
            }
            else{
                objectRef = feature.attributes.NAME;
                window.open(Config.URL_INSPECT_LINE.replace("{NAME}", objectRef));
            }
        }
        else if(id === "ptf-argo-observations"){
            // Show observations Argo PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "argo" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === "argo" && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                this.showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-glider-observations"){
            // Show observations Argo PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "gliders" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === "gliders" && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                this.showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-argo-data"){
            // Show Argo data
            if(!(this.is3D || this.is3DFlat)){
                Utils.displayAlert("Limited display functionalities", "You can switch to a 3D projection to benefit from the 'in-depth' experience.");
            }
            else{
                var objectRef = feature.attributes.PTF_REF;
                var dataDisplay = new DataDisplay({map: this});
                dataDisplay.displayDataArgo(objectRef, "SEA TEMPERATURE");
            }
        }
        else if(id === "ptf-oceansites-sensors"){
            // Show OceanSITES sensors
            if(this.is3D || this.is3DFlat){
                var objectRef = feature.attributes.PTF_REF;
                var sensorDisplay = new SensorDisplay({map: this});
                sensorDisplay.displaySensorsOceanSITES(objectRef);
            }
            else{
                Utils.displayAlert("Limited display functionalities", "You can switch to a 3D projection to benefit from the 'in-depth' experience.");
            }
        }
        else if(id === "ptf-argo-data-cycle"){
            // Show Argo data
            if(this.is3D || this.is3DFlat){
                var objectRef = feature.attributes.PTF_REF;
                var cycleNb = feature.attributes.CYCLE_NB;
                var dataDisplay = new DataDisplay({map: this});
                dataDisplay.displayDataArgo(objectRef, "SEA TEMPERATURE", cycleNb);
            }
            else{
                Utils.displayAlert("Limited display functionalities", "You can switch to a 3D projection to benefit from the 'in-depth' experience.");
            }
        }
        else if(id === "ptf-dbcp-observations"){
            // Show observations DBCP PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "dbcp" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === "dbcp" && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                this.showTrackline(fLayerTrackline, objectRef);
            }
        }
        else if(id === "ptf-sot-observations"){
            // Show observations SOT PTF
            var objectRef = feature.attributes.PTF_REF;
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "sot" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.showObservations(fLayerObs, objectRef);
            }
        }
        else if(id === "cruise-geodesic-densify"){
            // @todo
            /*require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.cruiseGeodesicDensify(feature);                    
            });*/
        }
        else if(id === "cruise-densify"){
            // @todo
            /*require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.cruiseDensify(feature);
            });*/
        }
        else if(id === "cruise-submit"){
            var geom = webMercatorUtils.webMercatorToGeographic(feature.geometry, false);      
            AppInterface.openCruiseForm(Utils.polylineJsonToWKT(geom));
        }
        else if(id === "ptf-submit"){
            var eltLat: any = document.getElementById("gisLat");
            var eltLon: any = document.getElementById("gisLon");
            var eltWmo: any = document.getElementById("gisWmo");
            var eltId: any = document.getElementById("gisInternalId");
            if(eltLat && eltLon && eltWmo && eltId){
                var lat = eltLat.value;
                var lon = eltLon.value;
                var wmo = eltWmo.value;
                var internalId = eltId.value;
                var draftId = null;
                if(feature.attributes){
                    draftId = feature.attributes["draftId"];
                }
                AppInterface.openPtfForm(draftId, wmo, lat, lon, internalId);
            }
        }
        else if(id === "edit-graphic"){
            // @todo
            /*require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.updateGeometryGraphic(feature);
            });*/
        }
        else if(id === "delete-draft"){
            // @todo
            /*require([
                "app/modules/editTool"
            ], function(editTool){
                editTool.deleteDraft(feature);
            });*/
        }
    }

    private addCloseWidgetButton = (position: any | null): void => {
        this.closeWidgetButton = document.createElement("div");
        this.closeWidgetButton.classList.add("esri-icon-close");
        this.closeWidgetButton.classList.add("action-button");
        this.closeWidgetButton.classList.add("esri-widget--button");
        this.closeWidgetButton.classList.add("esri-widget");
        this.closeWidgetButton.classList.add("esri-interactive");
        this.closeWidgetButton.setAttribute("role", "button");
        this.closeWidgetButton.addEventListener("click", (): void => {
            this.deactivateCurrentTool();
        });
        if(position){
            this.mapView.ui.add(this.closeWidgetButton, position);
        }
        else{
            this.mapView.ui.add(this.closeWidgetButton, "bottom-left");
        }
    }
    /*
    *   Remove the current custom close button from the UI.
    */
    private removeCloseWidgetButton = (): void => {
        if(this.closeWidgetButton){
            this.mapView.ui.remove(this.closeWidgetButton);
            this.closeWidgetButton = null;
        }
    };

    /*
    *   Add an tool result section on the UI of the map
    *   options is a javascript object containing a title and a text : {title: "My Title", text: "My Text"}
    *
    */
    private addToolResultPanel = (options: any): string => {
        var id = "widgetpanel-" + this.widgetIteration.toString();
        if(this.currentResultPanel){
            this.removeResultPanel();
        }
        if(!options.position || (options.position == "bottom-left")){
            this.addCloseWidgetButton(null);
        }
        
        this.currentResultPanel = document.createElement("div");
        this.currentResultPanel.id = id;
        this.currentResultPanel.classList.add("esri-widget");
        this.currentResultPanel.classList.add("esri-widget-custom");
        this.currentResultPanel.classList.add("esri-component");
        this.currentResultPanel.classList.add("esri-widget--panel");
        var currentResultContainer = document.createElement("div");
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

        this.currentResultPanel.appendChild(currentResultContainer);

        if(options.position){
            this.mapView.ui.add(this.currentResultPanel, options.position);
            this.addCloseWidgetButton({position: options.position});
        }
        else{
            this.mapView.ui.add(this.currentResultPanel, "bottom-left");
        }
        this.widgetIteration++;
        return id;
    };

    /*
    *   Remove the current result panel from the UI.
    */
    private removeResultPanel = (): void =>{
        if(this.currentResultPanel){
            this.mapView.ui.remove(this.currentResultPanel);
            this.currentResultPanel = null;
        }
        this.removeCloseWidgetButton();
    };


    /*
    *   Initialize the operational layers.
    */
    private initOperationalLayers = (): void => {
        this.groupLayerOperational = new GroupLayer({
            title: "Operational layers",
            visible: true,
            visibilityMode: "independent"
        });
        // Ordering default layers
        var operationalLayers = Config.operationalLayers.sort((la, lb) => la.index - lb.index);

        for(var i = 0; i < operationalLayers.length; i++){
            var layer = operationalLayers[i];

            var visible = layer.visible;
            if(visible && (this.settings.theme == layer.theme || layer.theme == Config.THEME_ALL) && layer.type !== Config.TYPE_OBS_PTF) {
                this.addOperationalLayer(layer.id);
            }
        }
        this.mapView.map.add(this.groupLayerOperational);

        // Read session storage
        this.settings.restoreLayersFromSessionStorage("operationalLayers");
        
    };


    /*
    *   Initialize the work layers.
    */
    private initWorkLayers = (): void => {
        this.groupLayerWork = new GroupLayer({
            title: "Work layers",
            visible: true,
            visibilityMode: "independent"
        });
        this.mapView.map.add(this.groupLayerWork);

        if(this.settings.platformTrack && this.settings.theme != Config.THEME_ALL){
            var objectRef = this.settings.platformTrack;
            // Show observations DBCP PTF
            var fLayerObs = Config.operationalLayers.find(x => x.theme === this.settings.theme && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.showObservations(fLayerObs, objectRef);
            }

            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === this.settings.theme && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                var tracklineLayer = this.showTrackline(fLayerTrackline, objectRef);
                if(tracklineLayer){
                    if(tracklineLayer.loaded){
                        this.setExtent("layer-extent", tracklineLayer);
                    }
                    else{
                        tracklineLayer.when(() => {
                            this.setExtent("layer-extent", tracklineLayer);
                        })
                    }
                }
            }
        }

        // Read local storage
        this.settings.restoreWorkLayersFromLocalStorage();
    };

    /*
    *   Initialize the other layers.
    */
    private initOtherLayers = (): void => {
        this.groupLayerOthers = new GroupLayer({
            title: "Other layers",
            visible: true,
            visibilityMode: "independent"
        });

        // Ordering layers
        var layers = Config.dynamicLayers;
        layers.sort(function(a, b){
            return a.index  - b.index;
        });
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            if(layer.visible && (this.settings.theme == Config.THEME_ALL ||
                this.settings.theme == layer.theme ||
                layer.theme == Config.THEME_ALL))
            {
                this.addOtherLayer(layer.id, null);
            }
        }
        
        this.mapView.map.add(this.groupLayerOthers);
        // Read session storage
        this.settings.restoreLayersFromSessionStorage("otherLayers");
    };
    // #endregion
}

export default GISMap;