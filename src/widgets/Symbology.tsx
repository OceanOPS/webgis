import { aliasOf, property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";
import ColorSlider from "@arcgis/core/widgets/smartMapping/ColorSlider";
import * as colorSymbology from "@arcgis/core/smartMapping/symbology/color";
import * as colorRendererCreator from "@arcgis/core/smartMapping/renderers/color";
import histogram from "@arcgis/core/smartMapping/statistics/histogram";
import summaryStatistics from "@arcgis/core/smartMapping/statistics/summaryStatistics";

import Widget from "@arcgis/core/widgets/Widget";
import Color from "@arcgis/core/Color";
import Config from "../Config";
import SymbologyViewModel from "./SymbologyViewModel";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import VisualVariable from "@arcgis/core/renderers/visualVariables/VisualVariable";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.Symbology")
class Symbology extends Widget{
    private widgetColorSliderDivId: string = "symbologyWidgetColorSlider";
    private uiEnabled: boolean = true;

    @property()
    viewModel: SymbologyViewModel = new SymbologyViewModel();
    @aliasOf("viewModel.map")
    map: SymbologyViewModel["map"];
    @aliasOf("viewModel.view")
    view: SymbologyViewModel["view"];
    @aliasOf("viewModel.layer")
    layer: SymbologyViewModel["layer"];
    @aliasOf("viewModel.layerId")
    layerId: SymbologyViewModel["layerId"];
    @aliasOf("viewModel.histogramBins")
    histogramBins: SymbologyViewModel["histogramBins"];
    @property()
    colorSlider: ColorSlider;
    @property()
    toClose: boolean = false;

    constructor(props?: any){
        super();
        this.map = props.map;
        this.view = this.map.mapView;
        this.layer = props.layer;
        this.layerId = this.layer.id;
        this.uiEnabled = props.uiEnabled;

        // Filtering special cases here, for derived layers
        if(this.layerId.startsWith("ARGO_DATA_IFREMER_ERDDAP")){
            this.layerId = "ARGO_DATA_IFREMER_ERDDAP";
        }
        else if(this.layerId.startsWith("ARGO_TRACKLINE")){
            this.layerId = "ARGO_TRACKLINE";
        }
        else if(this.layerId.startsWith("ARGO_OBS_PTF")){
            this.layerId = "ARGO_OBS_PTF";
        }
        else if(this.layerId.startsWith("ARGO_OBS")){
            this.layerId = "ARGO_OBS";
        }
        else if(this.layerId.startsWith("SOT_OBS")){
            this.layerId = "SOT_OBS";
        }
    }

    render(){
        var layerInfo = Config.operationalLayers.find(x => x.id === this.layerId);
        if(layerInfo){
            var symbologyFields = layerInfo.symbologyFields;
            if(symbologyFields && symbologyFields.length >0){
                return (
                    <div id="symbologyWidget" afterCreate={this.renderSlider} class={this.classes([CSS.base, CSS.customDefault])}>
                        <form class='form-group'>
                            <label class="form-label" for="symbologySelect">Select a symbology - {this.layer.title}</label>
                            <select class='form-control' id='symbologySelect' onchange={this.changerColourListener}>
                                <option value='' disabled selected>--</option>
                                {
                                    symbologyFields.map((object, i) => {
                                        if((symbologyFields[i].startsWith("3D") && (this.map.is3D || this.map.is3DFlat)) || !symbologyFields[i].startsWith("3D")){
                                            return <option key={"symbology-" + symbologyFields[i]} value={symbologyFields[i]}>{symbologyFields[i]}</option>;
                                        }
                                    })
                                }
                            </select>
                        </form>
                        <div id={this.widgetColorSliderDivId}></div>
                    </div>
                );
            }
            else{
                return (
                    <div id="symbologyWidget" class={this.classes([CSS.base, CSS.customDefault])}>
                        <form class='form-group'>
                            <select class='form-control' id='symbologySelect'><option value='' disabled>no symbology available</option></select>
                        </form>
                    </div>
                );
            }
                        
        }
    }

    /**
     * This method renders the slide after creation and rendering of the main widget
     */
    private renderSlider = () => {    
        if(this.uiEnabled){
            if((this.layer.renderer instanceof SimpleRenderer || this.layer.renderer instanceof UniqueValueRenderer || this.layer.renderer instanceof ClassBreaksRenderer) 
                && this.layer.renderer.visualVariables){
                histogram({
                    layer: this.layer,
                    field: this.viewModel.getVisualVariableByType(this.layer.renderer,"color").field,
                    numBins: this.histogramBins
                }).then((histogramResult) => {
                    summaryStatistics({
                        layer: this.layer,
                        field: this.viewModel.getVisualVariableByType(this.layer.renderer,"color").field
                    }).then((stats) => {
                        this.createColorSlider(histogramResult, null, stats);
                    });
                });
            }
        }
    }

    /*
    *   Listener when changing the colour.
    */
    private changerColourListener = (event: any) => {
        var field = event.target.value;
        // Getting theme for this layer
        var layerInfo = Config.operationalLayers.find(x => x.id === this.layerId);
        if(layerInfo){
            var theme = layerInfo.theme;
            var filename = theme + "-" + this.layerId + "-" + field + ".json";
            this.loadJsonSymbology(filename);
        }
    };


    /**
     * Removes the slider from the UI
     */
    private removeColorSlider = () => {
        // Removing HTML node
        if(this.colorSlider){  
            var htmlElt: HTMLElement | null;
            if(typeof(this.colorSlider.container) == "string"){
                htmlElt = document.getElementById(this.colorSlider.container);
            }
            else{
                htmlElt = this.colorSlider.container;
            }
            if(htmlElt){
                htmlElt.innerHTML = "";
            }
            // Nullifying the property
            //this.colorSlider.destroy();
        }
    }

    /**
     * This function creates the color slider associated to the renderer, histogram and stats
     * @param histogramR 
     * @param rendererR 
     * @param stats 
     */
    private createColorSlider = (histogramR:any, rendererR: any, stats: any) => {
        if(this.uiEnabled){
            const bars: any[] = [];
            var vv: any = null;
            // Removing current slider   
            this.removeColorSlider();
            if(rendererR){
                vv = rendererR.visualVariable;
                this.colorSlider = ColorSlider.fromRendererResult(rendererR, histogramR);
            }
            else{   
                vv = this.viewModel.getVisualVariableByType(this.layer.renderer,"color")
                var histogramConfig = {
                    average: stats.avg,
                    standardDeviation: stats.stddev,
                    bins: histogramR.bins
                };
                this.colorSlider = new ColorSlider({
                    stops: this.viewModel.getVisualVariableByType(this.layer.renderer,"color").stops,
                    min: histogramR.minValue,
                    max: histogramR.maxValue,
                    histogramConfig: histogramConfig
                });
            }
            this.colorSlider.set({
                primaryHandleEnabled: true,
                handlesSyncedToPrimary: false,
                visibleElements: {
                    interactiveTrack: true
                },
                syncedSegmentsEnabled: true,
                container: this.widgetColorSliderDivId
            });
            this.colorSlider.viewModel.precision = 2;

            // update the histogram bars to match renderer values
            this.colorSlider.histogramConfig.barCreatedFunction = (index, element) => {
                const bin = histogramR.bins[index];
                const midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
                const color = this.viewModel.getColorFromValue(vv.stops, midValue);
                element.setAttribute("fill", color.toHex());
                bars.push(element);
            };

            var updateRenderer = () => {
                if(this.layer.renderer instanceof SimpleRenderer || this.layer.renderer instanceof UniqueValueRenderer || this.layer.renderer instanceof ClassBreaksRenderer){
                    let renderer = this.layer.renderer.clone();
                    let colorVariable = (renderer.visualVariables[0] as ColorVariable).clone();
                    colorVariable.stops = this.colorSlider.stops;
                    renderer.visualVariables = [ colorVariable ];
                    this.layer.renderer = renderer.clone();
            
                    // update the color of each histogram bar based on the values of the slider thumbs
                    bars.forEach((bar, index) => {
                        if(this.colorSlider.histogramConfig.bins){
                            const bin = this.colorSlider.histogramConfig.bins[index];
                            const midValue = (bin.maxValue - bin.minValue) / 2 + bin.minValue;
                            const color = this.viewModel.getColorFromValue(this.colorSlider.stops, midValue);
                            bar.setAttribute("fill", color.toHex());
                        }
                    });
                }
            }
            
            // update the renderer and the histogram when sliding
            this.colorSlider.on("thumb-change", updateRenderer);
            this.colorSlider.on("thumb-drag", updateRenderer);
            this.colorSlider.on("min-change", updateRenderer);
            this.colorSlider.on("max-change", updateRenderer);
            this.colorSlider.on("segment-drag", updateRenderer);
        }
    }

    /**
     * Loads a symbology based on its filename. Tool must be initialized beforehand.
     * @param {*} fileName 
     */
    loadJsonSymbology = (fileName: string, featureLayerExt?: FeatureLayer, viewExt?: MapView | SceneView) => {
        if(viewExt){
            this.view = viewExt;
        }
        if(featureLayerExt){
            this.layer = featureLayerExt;
        }
        fileName = fileName.replace(/ /g, '_');
        fetch("symbologies/" + fileName).then((data) => {
            // Folder containing new symbologies, using auto cast ESRI values 
            data.json().then((renderer: any) => {
                if(renderer.type == "smartContinuousRenderer" && this.view instanceof SceneView){
                    var colorScheme: any;
                    if(!renderer.colorScheme || (renderer.colorScheme == "auto")){
                        var initScheme = colorSymbology.getSchemes({
                            basemap: this.view.map.basemap,
                            view: this.view,
                            geometryType: "point",
                            theme: "above-and-below"
                        }).primaryScheme;
                        colorScheme = colorSymbology.flipColors(initScheme);
                    }
                    else{
                        var initScheme = colorSymbology.getSchemeByName({
                            basemap: this.view.map.basemap,
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
                    
                    const colorParams: any = {
                        layer: this.layer,
                        view: this.view,
                        field: renderer.field,
                        symbolType: "3d-flat",
                        theme: "above-and-below",
                        colorScheme: colorScheme
                    };
    
                    var rendererResult: any;
                    colorRendererCreator.createContinuousRenderer(colorParams).then((response) => {
                        rendererResult = response;
                        this.layer.renderer = response.renderer;
                        return histogram({
                            layer: colorParams.layer,
                            field: colorParams.field,
                            numBins: this.histogramBins
                        });
                    }).then((histogramResult) =>{
                        if(this.uiEnabled){
                            this.createColorSlider(histogramResult, rendererResult, null);
                        }
                    });
                }
                else{
                    this.layer.renderer = renderer;
                    if(renderer.visualVariables){
                        histogram({
                            layer: this.layer,
                            field: this.viewModel.getVisualVariableByType(renderer,"color").field,
                            numBins: this.histogramBins
                        }).then((histogramResult) => {
                            summaryStatistics({
                                layer: this.layer,
                                field: this.viewModel.getVisualVariableByType(renderer,"color").field
                            }).then((stats) => {
                                if(this.uiEnabled){
                                    this.createColorSlider(histogramResult, null, stats);
                                }
                            });
                        });
                    }
                    else{
                        // Removing current slider   
                        this.removeColorSlider();           
                    }
                }
                this.toClose = true;
            });            
        }, 
        function(err){
            console.error(err);
        });
    };

}
export default Symbology;