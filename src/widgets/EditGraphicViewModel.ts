import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Polyline from "@arcgis/core/geometry/Polyline";
import GISMap from "../Map";

interface DraftPtf {
    draftId: string, lat: number, lon: number
};

@subclass("esri.widgets.EditGraphicViewModel")
class EditGraphicViewModel extends Accessor{
    @property()
    private map: GISMap;
    @property()
    idsSelected: string[] = [];
    @property()
    cruiseIdSelected: string | null = null;
    @property()
    currentCruiseLength: number | null = null;
    @property()
    countPoints = 0;
    @property()
    countPolyline = 0;
    @property()
    drawOrthodromy: boolean = true;

    @property()
    draftPtfs: DraftPtf[] = [];

    constructor(props?: any){
        super(props);
    }

    /**
     * Computes and returns the current cruise length in nautical miles
     * @param geometry the polyline to analize
     * @returns the computed length
     */
    public getPolylineLength = (geometry: Polyline) => {
        if(this.map.mapView.spatialReference.isWebMercator || this.map.mapView.spatialReference.isWGS84){
            this.currentCruiseLength = Math.round(geometryEngine.geodesicLength(geometry, "nautical-miles") * 100) / 100;
        }
        else{
            this.currentCruiseLength = Math.round(geometryEngine.planarLength(geometry, "nautical-miles") * 100) / 100;
        }

        return this.currentCruiseLength;
    }

}

export {EditGraphicViewModel, DraftPtf};