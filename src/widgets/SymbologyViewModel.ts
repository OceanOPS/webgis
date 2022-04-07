import Color from "@arcgis/core/Color";
import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import GISMap from "../Map";


@subclass("esri.widgets.SymbologyViewModel")
class SymbologyViewModel extends Accessor{
    @property()
    view: MapView | SceneView;
    @property()
    map: GISMap;
    @property()
    layer: FeatureLayer;
    @property()
    layerId: string;
    @property()
    sublayerId: string | null;
    @property()
    histogramBins: number = 30;

    constructor(props ?: any){
        super();
    }

    
    /**
     * Gets the colours from the histogram through a given value
     * @param stops stops from the histogram
     * @param value the value requested
     * @returns (Color) the colour corresponding to the value
     */
    getColorFromValue = (stops: any, value: any) => {
        let minStop = stops[0];
        let maxStop = stops[stops.length - 1];
  
        const minStopValue = minStop.value;
        const maxStopValue = maxStop.value;
  
        if (value < minStopValue) {
          return minStop.color;
        }
  
        if (value > maxStopValue) {
          return maxStop.color;
        }
  
        const exactMatches = stops.filter((stop: any) => {
          return stop.value === value;
        });
  
        if (exactMatches.length > 0) {
          return exactMatches[0].color;
        }
  
        minStop = null;
        maxStop = null;
        stops.forEach((stop: any, i: number) => {
          if (!minStop && !maxStop && stop.value >= value) {
            minStop = stops[i - 1];
            maxStop = stop;
          }
        });
  
        const weightedPosition =
          (value - minStop.value) / (maxStop.value - minStop.value);
  
        return Color.blendColors(
          minStop.color,
          maxStop.color,
          weightedPosition
        );
    }

    
    /**
     * Extract VisualVariable from renderer with a given type
     * @param renderer 
     * @param type 
     * @returns 
     */
    getVisualVariableByType = (renderer: any, type: any) => {
        var visualVariables = renderer.visualVariables;
        return visualVariables && visualVariables.filter((vv: any) => {
            return vv.type === type;
        })[0];
    }

}
export default SymbologyViewModel;