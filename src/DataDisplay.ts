import Point from "@arcgis/core/geometry/Point";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Layer from "@arcgis/core/layers/Layer";
import SceneView from "@arcgis/core/views/SceneView";
import Config from "./Config";
import GISMap from "./Map";
import Field from "@arcgis/core/layers/support/Field";
import fetchJsonp from "fetch-jsonp";
import Symbology from "./widgets/Symbology";

class DataDisplay{
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
     * Adds the layer of observation's data for a given float.
     * @param  {[type]} objectRef The float's reference
     * @param  {[type]} dataType  For later use, the desired variable. Ignore for now.
     */
     public displayDataArgo = (objectRef: string, dataType: string, cycleNb?: string) =>{
        const layerInfo = Config.operationalLayers.find(x => x.theme === "argo" && x.type === "argoData");
        var existingLayer: Layer;
        var layerId: string | null = null;
        var layerName: string;
        if(layerInfo){
            var url = layerInfo.url.replace("{PTF_REF}", objectRef);

            if(cycleNb){
                layerId = layerInfo.id + "_" + objectRef + "_" + cycleNb;
                existingLayer = this.view.map.findLayerById(layerId);
                url += "&cycle_number=" + cycleNb;
                layerName = objectRef + " cycle " + cycleNb + " data";
            }
            else{
                layerId = layerInfo.id + "_" + objectRef;
                existingLayer = this.view.map.findLayerById(layerId);
                layerName = objectRef + " data";
            }


            if(!existingLayer){
                var layer = null;
                var elevationInfo: any = layerInfo.elevationInfo;
                if(elevationInfo && elevationInfo.featureExpressionInfo){
                    elevationInfo.featureExpressionInfo.expression = "$feature." + layerInfo.elevationField + " * -" + this.map.exaggerationCoef;

                    fetchJsonp(url,{
                        jsonpCallback: ".jsonp"
                    }).then((response) => {
                        response.json().then((jsonData: any) => {
                            var graphics = this.createGraphicsFromGeoJson(jsonData);
                            layer = new FeatureLayer({
                                id: layerId as string,
                                title: layerName,
                                source: graphics, // autocast as an array of esri/Graphic
                                // create an instance of esri/layers/support/Field for each field object
                                fields: this.fields, // This is required when creating a layer from Graphics
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
                                var symbologyWidget = new Symbology({layer: layer, map: this.map, uiEnabled: false});
                                symbologyWidget.loadJsonSymbology(filename);
                            }

                            this.map.addLayerWithElevationInfoID(layer.id, layerInfo.id);
                            this.map.addToWorkLayerList(layer);
                        });
                    });
                }
            }
        }
        return layerId;
    };

    private createGraphicsFromGeoJson = (geoJsonData: any) => {
        // raw GeoJSON data
        var geoJson = geoJsonData;
        var currentX: number, currentY: number, currentZ: number;

        // Create fields and attribute objects
        for(var i in geoJson.propertyNames){
            var type: "double" | "string";
            if(geoJson.propertyUnits[i] == "degree_Celsius" || geoJson.propertyUnits[i] == "PSU"){
                type = "double";
            }
            else{
                type = "string";
            }
            this.fields.push(new Field({
                name: geoJson.propertyNames[i],
                alias: geoJson.propertyNames[i],
                type: type
            }));
        }
        // Create an array of Graphics from each GeoJSON feature
        return geoJson.features.map((feature: any, i: string) => {
            var attributes = {ObjectID: i};
            geoJson.propertyNames.forEach((property: any) => {
                var field = this.fields.find(x => x.name == property);
                if(field && field.type === "string"){
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

}
export default DataDisplay;