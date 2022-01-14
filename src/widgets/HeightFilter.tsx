import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Slider from "@arcgis/core/widgets/Slider";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import Widget from "@arcgis/core/widgets/Widget";
import Polygon from "@arcgis/core/geometry/Polygon";
import Layer from "@arcgis/core/layers/Layer";
import Config from "../Config";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.HeightFilter")
class HeightFilter extends Widget{
    @property()
    minValue = -6000;
    @property()
    maxValue = 50;
    @property()
    heightKeepNull = false;
    @property()
    coeffDepth = 1;
    // Reference to the slider
    private slider: Slider;
    // Reference to the View
    private view: MapView | SceneView;

    constructor(props?: any){
        super(props);
        this.view = props.view;
    }

    render(){
        return (
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <div afterCreate={this.renderSlider} id='heightSlider'></div>
                <br/>
                <input type='checkbox' id='heightKeepNull' name='heightKeepNull' checked={this.heightKeepNull} onchange={this.changeFilter}/><label for='heightKeepNull'>Keep unspecified heights</label>
            </div>
        );
    }

    destroy(){
        this.resetFilter();
        super.destroy();
    }

    /**
     * Renders the slider after creation of the DOM node
     */
    private renderSlider = () => {
        this.slider = new Slider({
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
        this.slider.when(() => {
            this.slider.on("thumb-change", this.changeFilter);
            this.slider.on("thumb-drag", this.changeFilter);
        });
    }

    /**
     * Event listener on the slider and checkbox
     * @param event 
     */
    private changeFilter = (event: any) => {
        if(event.value){            
            if(event.index == 0){
                this.minValue = event.value;
            }
            if(event.index == 1){
                this.maxValue = event.value;
            }
        }
        else{
            this.heightKeepNull = event.target.checked;
        }
        var rings = [[
            [-180,-90, this.minValue],
            [-180, 90, this.maxValue],
            [180,90, this.maxValue],
            [180,-90, this.minValue],
            [-180,-90, this.minValue]
        ]];
        var polygon = new Polygon({rings: rings, hasZ: true, spatialReference: { wkid: 4326 }});

        this.view.map.allLayers.forEach((layer: Layer) => {
            if(layer instanceof FeatureLayer){
                var configLayerTmp = Config.operationalLayers.find(l => l.id == layer.id);
                if(!configLayerTmp && layer.id.startsWith("ARGO_DATA_IFREMER_ERDDAP")){
                    configLayerTmp = Config.operationalLayers.find(l => l.id == "ARGO_DATA_IFREMER_ERDDAP");
                    this.coeffDepth = -1;
                }
                const configLayer = configLayerTmp;
                if(configLayer){
                    if(configLayer.sensorMaxHeightField && configLayer.sensorMinHeightField){
                        this.view.whenLayerView(layer).then((layerView) =>{
                            var where:string = "";
                            if(this.minValue){
                                where = configLayer.sensorMinHeightField + " >= " + this.minValue;
                            }
                            if(this.maxValue && !this.minValue){
                                where = configLayer.sensorMaxHeightField + " <= " + this.maxValue;
                            }
                            else if(this.maxValue){
                                where = "(" + configLayer.sensorMinHeightField + " <= " + this.maxValue + ") AND (" + 
                                    configLayer.sensorMaxHeightField + " >= " + this.minValue + ")";
                            }
                            if(this.heightKeepNull){
                                where += " OR " + configLayer.sensorMinHeightField + " IS NULL OR " + configLayer.sensorMaxHeightField + " IS NULL";
                            }
                            layerView.filter = new FeatureFilter({
                                where: where
                            });
                        });
                    }
                    else{
                        if(configLayer.elevationField){
                            this.view.whenLayerView(layer).then((layerView) => {
                                var where: string = "";
                                if(this.minValue){
                                    where = "(" + configLayer.elevationField + " * " + this.coeffDepth + ") >= " + this.minValue;
                                }
                                if(this.maxValue && !this.minValue){
                                    where = "(" + configLayer.elevationField + " * " + this.coeffDepth + ") <= " + this.maxValue;
                                }
                                else if(this.maxValue){
                                    where = "((" + configLayer.elevationField + " * " + this.coeffDepth + ") <= " + this.maxValue + ") AND ((" + 
                                    configLayer.elevationField + " * " + this.coeffDepth + ") >= " + this.minValue + ")";
                                }
                                if(this.heightKeepNull){
                                    where += " OR " + configLayer.elevationField + " IS NULL";
                                }
                                layerView.filter = new FeatureFilter({
                                    where: where
                                });
                            });
                        }
                        else{
                            // Looking on Z values
                            if(layer.hasZ){
                                this.view.whenLayerView(layer).then(function(layerView){
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
                            this.view.whenLayerView(layer).then(function(layerView){
                                layerView.filter = new FeatureFilter({
                                    spatialRelationship: "contains",
                                    geometry: polygon.extent
                                });
                            });
                        }
                }
            }
        });
    }

    /**
     * Resets the filter. Typically called when destroying this widget's instance.
     */
    private resetFilter = () => {
        this.view.map.allLayers.forEach((layer) => {
            if(layer instanceof FeatureLayer){
                var configLayer = Config.operationalLayers.find(l => l.id == layer.id);
                if(configLayer){
                    if(configLayer.sensorMaxHeightField && configLayer.sensorMinHeightField){                        
                        this.view.whenLayerView(layer).then((layerView) => {
                            var where = "";                        
                            layerView.filter = new FeatureFilter({
                                where: where
                            });
                        });
                    }
                }
            }
        });
    }

}

export default HeightFilter;