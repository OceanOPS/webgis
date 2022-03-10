import Accessor from "@arcgis/core/core/Accessor";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Color from "@arcgis/core/Color";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import GISMap from "../Map";

@subclass("esri.widgets.PinLayerViewModel")
class PinLayerViewModel extends Accessor {
    // Reference to the view
    @property()
    private map: GISMap;
    // Boolean indicating if given layer should be used directly instead of creating a new one
    @property()
    private useGivenLayer: boolean = false;
    // Boolean indicating if given layer should be updated (already pinned)
    @property()
    private editPinnedLayer: boolean = false;
    // Current layer being processed
    @property()
    private layer: FeatureLayer;

    constructor(props?: any){
        super();
    }


    pinLayer = (formFields: any): void => {
        var now = new Date();
            var newName = this.layer.title + " - " + now.toISOString().split('T')[1].split('Z')[0].split('.')[0],
                newId = this.layer.id + "_" + now.toISOString().split('T')[1].split('Z')[0].replace(/:/g,'').replace(/\./g,''),
                legendLabel = this.layer.title;
            if(this.useGivenLayer){
                newId = this.layer.id;
            }
            if(formFields.layerNameToSave.value.length > 0){
                newName = formFields.layerNameToSave.value;
                legendLabel = formFields.layerNameToSave.value;
            }
            else if(this.editPinnedLayer){
                // If edit and no new name provided
                newName = this.layer.title;
            }

            var renderer = null;

            if(formFields.layerKeepOriginalRendererToSave.checked){
                renderer = this.layer.renderer;
            }
            else{
                var markerParams: any = {};
                var marker;
                
                markerParams.style = formFields.layerStyleToSave.value;
                if(formFields.layerColorTransparencyToSave.checked){
                    markerParams.color = new Color([0,0,0,0]);
                }
                else{
                    markerParams.color = new Color(formFields.layerColorToSave.value);
                }

                if(!this.layer.geometryType || this.layer.geometryType === "point" || this.layer.geometryType === "multipoint"){
                    markerParams.outline = new SimpleLineSymbol({
                        style: "solid",
                        color: new Color(formFields.layerOutlineToSave.value),
                        width: formFields.layerOutlineSizeToSave.value
                    });
                    markerParams.size = formFields.layerSizeToSave.value;

                    marker = new SimpleMarkerSymbol(markerParams);
                }
                else if(this.layer.geometryType === "polyline"){
                    markerParams.width = formFields.layerSizeToSave.value;

                    marker = new SimpleLineSymbol(markerParams);
                }
                else if(this.layer.geometryType === "polygon"){
                    markerParams.outline = new SimpleLineSymbol({
                        style: "solid",
                        color: new Color(formFields.layerOutlineToSave.value),
                        width: formFields.layerOutlineSizeToSave.value
                    });
                    marker = new SimpleFillSymbol(markerParams);
                }

                renderer = new SimpleRenderer({label: legendLabel, symbol: marker});
            }

            if(this.useGivenLayer){
                this.layer.title = newName;
                this.layer.renderer = renderer;
                if(this.editPinnedLayer){
                   this.map.updateWorkLayerToBrowserStorage(this.layer.id, this.layer.title, this.layer.renderer, this.layer.definitionExpression, this.layer.visible); 
                }
                else{
                    this.map.addToWorkLayerList(this.layer);
                }
            }
            else{
                // Adding layer to work layer list and map
                this.map.addWorkLayer(newId, this.layer.id, newName, renderer, this.layer.definitionExpression, true);
                this.map.saveWorkLayerToBrowserStorage(newId, this.layer.id, newName, renderer, this.layer.definitionExpression, true);
            }
    }
}

export default PinLayerViewModel;