import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import BaseElevationLayer from "@arcgis/core/layers/BaseElevationLayer";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import Config from "./Config";

@subclass("esri.layers.ExaggeratedElevationLayer")
class ExaggeratedElevationLayer extends BaseElevationLayer {
    private _exaggeration: number;
    private _elevation: ElevationLayer;

    constructor(props: {exaggeration: number} = {exaggeration: Config.DEFAULT_ELEVATION_EXAGGERATION}){
        super();
        this._exaggeration = props.exaggeration;
        this.title = "Custom elevation layer";
        this._elevation = new ElevationLayer({
            url: "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"
        });

        // wait for the elevation layer to load before resolving load()
        this.addResolvingPromise(
            this._elevation.load().then(() => {
              // get tileInfo, spatialReference and fullExtent from the elevation service
              // this is required for elevation services with a custom spatialReference
              this.tileInfo = this._elevation.tileInfo;
              this.spatialReference = this._elevation.spatialReference;
              this.fullExtent = this._elevation.fullExtent;
            })
        );
    }

    public fetchTile = (level: number, row: number, col: number, options: any): any => {
        return this._elevation.fetchTile(level, row, col, options).then((data: any) : any => {
                const exaggeration = this._exaggeration;
                for (let i = 0; i < data.values.length; i++) {
                    data.values[i] = data.values[i] * exaggeration;
                }
        
                return data;
            });
    }
}

export default ExaggeratedElevationLayer;