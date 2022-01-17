import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Field from "@arcgis/core/layers/support/Field";
import SceneView from "@arcgis/core/views/SceneView";
import Config from "./Config";
import GISMap from "./Map";
import Symbology from "./widgets/Symbology";

class SensorDisplay{    
    private map: GISMap;
    private view: SceneView;
    private fields:Field[] = [new Field({
        name: "ObjectID",
        alias: "ObjectID",
        type: "oid"
    })];


    constructor(props: {map: GISMap}){
        this.map = props.map;
        this.view = this.map.mapView as SceneView;
    }

    /**
     * @todo Sensors do not display correctly on z-axis
     * Adds the layer of observation's data for a given float.
     * @param  {[type]} objectRef The float's reference
     * @param  {[type]} dataType  For later use, the desired variable. Ignore for now.
     */
     public displaySensorsOceanSITES = (objectRef: string) => {
        var layerInfo = Config.operationalLayers.find(x => x.theme === "oceansites" && x.type === "oceansitesSensors");
        var existingLayer = null;
        var layerId = null;
        var layerName = null;
        if(layerInfo){
            layerId = layerInfo.id + "_" + objectRef;
            existingLayer = this.view.map.findLayerById(layerId);
            layerName = objectRef + " sensors";


            if(!existingLayer){
                var layer = null;
                var elevationInfo: any = layerInfo.elevationInfo;
                if(elevationInfo && elevationInfo.featureExpressionInfo){
                    elevationInfo.featureExpressionInfo.expression = elevationInfo.featureExpressionInfo.expression.replace("{COEFF}", this.map.exaggerationCoef);
                
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
                        var symbologyWidget = new Symbology({layer: layer, map: this.map, uiEnabled: false});
                        symbologyWidget.loadJsonSymbology(filename);
                    }
                    this.map.addLayerWithElevationInfoID(layer.id, layerInfo.id);
                    this.map.addToWorkLayerList(layer);                
                }
            }
        }
        return layerId;
    };
}
export default SensorDisplay;