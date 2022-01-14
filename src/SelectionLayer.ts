import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import Config from "./Config";
import Utils from "./Utils";

/**
 * Class exporting the selection functionnalities on the map
 */
class SelectionLayer{
    private view: MapView|SceneView;
    private highlight: {[key: string]: any} = {};
    constructor(props: {view: MapView|SceneView}){
        this.view = props.view;
    }

    /**
     * 
     * @param selectedObjectsRef 
     * @param featureType 
     */
    public applySelectionLayers = (selectedObjectsRef: string[], featureType: string) => {
        var operationalLayers = Config.operationalLayers;
        this.view.popup.clear();
        this.view.popup.close();
        this.view.map.allLayers.forEach((layer) => {
            if(layer instanceof FeatureLayer){
                var operationalLayersForType = operationalLayers.filter(x => x.type == featureType).map(x => x.id);
                if(operationalLayersForType.indexOf(layer.id) !== -1){
                    this.applySelection(layer, selectedObjectsRef);
                }
            }
        });
    }

    private applySelection = (featureLayer: FeatureLayer, selectedObjects: string[]) => {
        const layerConfig = Config.operationalLayers.find(x => x.id == featureLayer.id);
        if(layerConfig && layerConfig.idField){
            var whereClause = Utils.buildWhereClause(layerConfig.idField, selectedObjects);
            for (var prop in this.highlight) {
                if (this.highlight.hasOwnProperty(prop)) { 
                    if(featureLayer.id == prop){
                        this.highlight[prop].remove();
                    }
                }
            }
            if(whereClause && whereClause != "" && whereClause != "()"){
                var query = featureLayer.createQuery();
                query.where = whereClause;
                this.view.whenLayerView(featureLayer).then((layerView) => {
                    layerView.queryFeatures(query).then((results) => {
                        // remove existing highlighted features
                        this.highlight[featureLayer.id] = layerView.highlight(results.features);
                        if(layerConfig.type == Config.TYPE_PTF){
                            this.view.goTo(results.features, {
                                duration: 1000,
                                easing: "linear"
                            }).then(() =>{
                                if(results.features.length == 1){
                                    this.view.popup.open({
                                        features: results.features
                                    });
                                }
                            });
                        }
                    }).catch(function(e){
                        console.error(e)
                    });
                });
            }
        }
    };
}

export default SelectionLayer;