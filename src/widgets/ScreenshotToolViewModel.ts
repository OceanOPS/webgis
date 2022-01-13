import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";

@subclass("esri.widgets.ScreenshotToolViewModel")
class ScreenshotToolViewModel extends Accessor {

    constructor(props ?: any){
        super();
        this.pixelRatio = 1;
        this._handleSketchVMCreate = this._handleSketchVMCreate.bind(this);
    }

    @property()
    private view: MapView | SceneView;

    @property()
    private sketchViewModel: SketchViewModel;

    @property()
    private sketchLayer: GraphicsLayer;

    @property()
    pixelRatio: number;

    @property()
    dataUrl: string;

    takeScreenshotWholeView = (): void => {
        this.view.takeScreenshot({ 
            format: "png",
            width: this.view.width * this.pixelRatio, 
            height: this.view.height * this.pixelRatio 
        }).then((screenshot) => {
            this.dataUrl = screenshot.dataUrl;
        });
    }

    
    initSketchViewModel = (): void => {
        // create a new sketch view model
        this.sketchViewModel = new SketchViewModel({
            view: this.view,
            updateOnGraphicClick: false,
            layer: this.sketchLayer,
            pointSymbol: {
                type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                style: "cross",
                color: "#FFFFFF",
                size: "16px",
                outline: { // autocasts as new SimpleLineSymbol()
                    color: "#202020",
                    width: 1
                }
            },
            polylineSymbol: {
                type: "simple-line", // autocasts as new SimpleLineSymbol()
                color: "#FF8000",
                width: "4",
                style: "dash"
            },
            polygonSymbol: {
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: "rgba(138,43,226, 0.5)",
                style: "solid",
                outline: {
                    color: "white",
                    width: 1
                }
            }
        });
        this.sketchViewModel.create('rectangle', {mode: "freehand"});

        // Listen the sketchViewModel's update-complete and update-cancel events
        this.sketchViewModel.on("create", this._handleSketchVMCreate);
    }

    private _handleSketchVMCreate = (event: any) => {
        if (event.state === "complete") {
            this._takeScreenshotForGraphic(event.graphic);
        }
    };

    private _takeScreenshotForGraphic = (graphic: Graphic): void => {
        // Determining the area to capture
        var xmin = -1, ymin = -1, xmax = -1, ymax = -1;
        for(var i = 0; i < 4; i++){
            var geom = graphic.geometry as Polygon;
            var screenPoint = this.view.toScreen(geom.getPoint(0,i));
            if(xmin == -1 || xmin > screenPoint.x){
                xmin = screenPoint.x;
            }
            if(ymin == -1 || ymin > screenPoint.y){
                ymin = screenPoint.y;
            }
            if(xmax == -1 || xmax < screenPoint.x){
                xmax = screenPoint.x;
            }
            if(ymax == -1 || ymax < screenPoint.y){
                ymax = screenPoint.y;
            }
        }
        // Removing sketch before taking the screenshot
        var sketchLayerId = this.sketchLayer.id;
        var layers = this.view.map.allLayers.filter(function(l){
            return l.id != sketchLayerId;
        }).toArray();
        // Taking the screenshot
        var self = this;
        this.view.takeScreenshot({ 
            layers: layers,
            width: (xmax - xmin) * this.pixelRatio,
            height: (ymax - ymin) * this.pixelRatio,
            area: {
                x: xmin,
                y: ymin,
                width: xmax - xmin,
                height: ymax - ymin
            }
        }).then(function(screenshot) {
            self.dataUrl = screenshot.dataUrl;
        });
    };
}

export default ScreenshotToolViewModel;