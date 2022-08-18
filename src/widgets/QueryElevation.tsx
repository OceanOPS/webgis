import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import ElevationLayerElevationQueryResult from "@arcgis/core/layers/ElevationLayer";
import ProjectParameters from"@arcgis/core/rest/support/ProjectParameters";
import {project} from "@arcgis/core/rest/GeometryService";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";
import Utils from "../Utils";
import Config from "../Config";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.QueryElevation")
class QueryElevation extends Widget{
    // Reference to the elevation layer
    private elevationLayer: ElevationLayer;
    // Reference to the view
    private view: MapView | SceneView;
    @property()
    elevation: string;

    constructor(props: any){
        super(props);
        this.view = props.view;
        this.elevationLayer = props.elevationLayer;
        Utils.changeCursor("crosshair");
    }

    postInitialize(){
        this.own(this.view.on("click", this.listener));
    }

    render(){
        return(
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <p>Click on the globe to query elevation.</p>Elevation (m): {this.elevation || "-"}
            </div>
        );
    }

    destroy(){
        Utils.changeCursor("auto");
        super.destroy();
    }


    /*
    *   Query the bathymetry layer for the elevation.
    */
    private queryElevation = (position: Point) => {
        this.elevationLayer.queryElevation(position, {demResolution: "finest-contiguous"}).then((result) => {
            var geom = result.geometry as Point;
            this.elevation = geom.z.toFixed(2);
            Utils.changeCursor("crosshair");
        }).catch(function(error) {
            console.error(error);
            Utils.changeCursor("crosshair");
        });
    };
    /*
    *   Listener when clicking on the map.
    */
    private listener = (event: any) => {
        Utils.changeCursor("wait");
        var position = event.mapPoint;
        // Testing if ready to process
        if(!(position.spatialReference.isWebMercator || position.spatialReference.isWGS84)){
            // Need to project
            // Testing if can project client-side
            if(webMercatorUtils.canProject(position.spatialReference, SpatialReference.WGS84)){
                // Can project client-side
                position = webMercatorUtils.project(position, SpatialReference.WGS84);
                this.queryElevation(position);
            }
            else{
                // Need server assistance for projection
                var params = new ProjectParameters();
                params.geometries = [position];
                params.outSpatialReference = SpatialReference.WGS84;
                project(Config.GEOMETRY_SERVICE, params).then((results) => {
                    var geom = results[0] as Point;
                    this.queryElevation(geom);
                }).catch(function(result){
                    console.error("Error while querying elevation");
                    Utils.changeCursor("crosshair");
                });
            }
        }
        else{
            this.queryElevation(position);
        }
    };
}
export default QueryElevation;