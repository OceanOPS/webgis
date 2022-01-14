import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";
import * as identify from "@arcgis/core/rest/identify";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";
import IdentifyResult from "@arcgis/core/rest/support/IdentifyResult";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import Widget from "@arcgis/core/widgets/Widget";
import Config from "../Config";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Utils from "../Utils";
import PopupTemplate from "@arcgis/core/PopupTemplate";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.Identify")
class Identify extends Widget{
    // Loading task
    @property()
    loading: boolean = false;
    // Current layer being processed
    private layer: MapImageLayer;
    // Reference to the View
    private view: MapView | SceneView;
    // Event reference
    private eventClick: IHandle;
    constructor(props?: any){
        super(props);
        this.view = props.view;
    }


    render(){
        var visibleLayers = Config.dynamicLayers.filter((l) =>{
            return this.view.map.findLayerById(l.id);
        });
        return (
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <p>Select a layer below, and point-click on the map to query the selected layer:</p>
                <form class='form-group'>
                    <select class='form-control' id='layerSelect' onchange={this.selectLayer}>
                        <option disabled selected='selected'>--</option>
                        {
                            visibleLayers.map((object, i) => {
                                return <option key={"identify-" + object.id} value={object.id}>{object.name}</option>;
                            })
                        }
                    </select>
                </form>
            </div>
        );
    }

    postInitialize(){
        this.eventClick = this.view.on("click", this.executeIdentifyTask);
        this.own(this.eventClick);
    }

    private selectLayer = (event: any) => {
        var val = event.target.value;
        this.layer = this.view.map.findLayerById(val) as MapImageLayer;
    }

    private executeIdentifyTask = (event:any) => {
        if(this.layer){
            Utils.changeCursor("wait");
            // Set the parameters for the Identify
            var params = new IdentifyParameters();
            params.tolerance = 3;
            params.returnGeometry = true;
            var visibleLayers = this.layer.allSublayers.filter(sl => Utils.isTreeVisible(sl) && !sl.sublayers).map(function(item){return item.id});
            params.layerIds = visibleLayers.toArray();
            params.layerOption = "all";
            params.width = this.view.width;
            params.height = this.view.height;
            // Set the geometry to the location of the view click
            params.geometry = event.mapPoint;
            params.mapExtent = this.view.extent;

            // This function returns a promise that resolves to an array of features
            // A custom popupTemplate is set for each feature based on the layer it
            // originates from
            this.loading = true;
            identify.identify(this.layer.url, params).then((response: any) => {
                return response.results.map((result: IdentifyResult) => {

                    var feature = result.feature;
                    var layerName = result.layerName;

                    var content = "";
                    for (var property in feature.attributes) {
                        if (feature.attributes.hasOwnProperty(property)) {
                            if(property != "SHAPE" && property != "OBJECTID" && property != "OBJECT_ID"){
                                content += property + ": " + feature.attributes[property] + "<br>";
                            }
                        }
                    }
                    feature.popupTemplate = new PopupTemplate({ 
                        title: layerName,
                        content: content
                    });

                    return feature;
                });
            }).then((array: any[]) => {
                if (array.length > 0) {
                    this.loading = false;
                    this.view.popup.open({
                        features: array,
                        location: event.mapPoint
                    });
                }
                Utils.changeCursor("auto");
            }).catch(() => {
                Utils.changeCursor("auto");
            });

        }
    }
}

export default Identify;