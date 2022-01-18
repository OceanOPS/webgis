import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Ground from "@arcgis/core/Ground";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneView from "@arcgis/core/views/SceneView";
import Config from "../Config";
import ExaggeratedElevationLayer from "../ExaggeratedElevationLayer";


@subclass("esri.widgets.ElevationExaggerationViewModel")
class ElevationExaggerationViewModel extends Accessor{
    @property()
    view: SceneView;
    @property()
    exaggeration: number;
    @property()
    exaggeratedLayer: ExaggeratedElevationLayer;
    @property()
    withElevationInfoLayerIDs: {layerID: string, baseID: string}[] = [];

    constructor(props?: any){
        super();
    }

    public static getExaggeratedElevationLayer(exaggeration = Config.DEFAULT_ELEVATION_EXAGGERATION){
        return new ExaggeratedElevationLayer({exaggeration: exaggeration});
    }

    /**
     * Changes exaggeration coefficient and regenerates the elevation layer
     */
    public changeExaggeration = (evt: any): void =>{
        // Regenerating elevation layer
        this.exaggeratedLayer = ElevationExaggerationViewModel.getExaggeratedElevationLayer(this.exaggeration);

        this.view.map.ground = new Ground({
            layers: [this.exaggeratedLayer]
        });
        // Updating elevation-based layers exageration
        this._updateElevationLayerInfo();
    };

    /**
     * Updates all the elevation-based layer coefficient when the bathymetry's exageration is updated.
     * @param  {decimal} newCoeff The new coefficient applied to the bathymetry exageration.
     */
    private _updateElevationLayerInfo = (): void =>{
        for(var i = 0; i < this.withElevationInfoLayerIDs.length; i++){
            var layerInfo: any = Config.operationalLayers.find(x => x.id === this.withElevationInfoLayerIDs[i].baseID);
            var layer = this.view.map.findLayerById(this.withElevationInfoLayerIDs[i].layerID);
            if(layer instanceof FeatureLayer){
                var elevationInfo = layerInfo.elevationInfo;
                if(layerInfo.elevationField == "z"){
                    elevationInfo.featureExpressionInfo.expression = "Geometry($feature)." + layerInfo.elevationField + " * " + this.exaggeration;
                }
                else{
                    elevationInfo.featureExpressionInfo.expression = "$feature." + layerInfo.elevationField + " * -" + this.exaggeration;
                }
                layer.elevationInfo = elevationInfo;
            }
        }
    }
}
export default ElevationExaggerationViewModel;