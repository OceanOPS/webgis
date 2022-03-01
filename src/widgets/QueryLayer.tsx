import { aliasOf, property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Layer from "@arcgis/core/layers/Layer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";
import * as query from "@arcgis/core/rest/query";
import Query from "@arcgis/core/rest/support/Query";
import Sublayer from "@arcgis/core/layers/support/Sublayer";

import Widget from "@arcgis/core/widgets/Widget";
import GISMap from "../Map";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.QueryLayer")
class QueryLayer extends Widget{
    /**
     * Reference to the view
     */
    @property()
    view: MapView | SceneView;    
    /**
     * Reference to the GISMap instance
     */
    @property()
    map: GISMap;
    // Current root layer being processed
    @property()
    layer: FeatureLayer | MapImageLayer;
    // Selected sublayer ID, if applicable
    @property()
    selectedSublayer: Sublayer;
    // query
    @property()
    query: string = "";
    // Current value list
    @property()
    private currentValueList: string[] = [];
    // Watchable property to auto close the widget when done
    @property()
    toClose: boolean = false;
    // Query operations
    private operations = ["=", "<>", ">", ">=", "<", "<=", "_", "%", "()", "like", "and", "or", "not", "is"];

    constructor(props?: any){
        super();
        this.map = props.map;
        this.view = this.map.mapView;
        this.layer = props.layer;
        if(this.layer instanceof FeatureLayer && this.layer.definitionExpression){
            this.query = this.layer.definitionExpression;
        }
    }

    render(){
        // Sublayer selection for map image layers
        if(this.layer instanceof MapImageLayer && this.layer.allSublayers.length > 0 && !this.selectedSublayer){
            return (
                <div class={this.classes([CSS.base, CSS.customDefault])}>
                    <form key="queryform-sublayerselection">
                        <select class='form-control' onchange={this.sublayerSelection}>
                            <option disabled selected='selected'> -- choose a sub layer -- </option>
                            {
                                this.layer.allSublayers.map((object, i) => {
                                    return <option key={"symbology-" + object.id} value={object.id}>{object.title}</option>;
                                }).toArray()
                            }  
                        </select>
                    </form>
                </div>
            );
        }
        else{
            return (
                <div class={this.classes([CSS.base, CSS.customDefault])}>
                {
                    this.getQueryForm()
                }
                </div>                
            );
        }
    }

    /**
     * Builds the query form when a FeatureLayer is selected or a sublayer of a MapLayer
     * @returns 
     */
    private getQueryForm = () => {
        var givenLayer = this.selectedSublayer ? this.selectedSublayer: this.layer as FeatureLayer;
        return (
            <form key="queryform-querybuilder">
                    <select multiple class="form-control" name="queryToolAttrFieldSelect" style="resize: both;" onchange={this.fieldChanged} ondblclick={this.addToTextAreaSelect}>
                    {
                        givenLayer.fields.map((object: any, i: number) => {
                            if(object.type != "oid" && object.type != "geometry"){
                                return <option key={"queryField-" + object.name} value={object.name} title={object.alias || object.name}>{object.name}</option>;
                            }                            
                        })
                    }
                    </select>
                    <br/>
                    <select multiple class="form-control" name="queryToolAttrValueSelect" style="resize: both;" ondblclick={this.addToTextAreaSelect}>
                    {
                        this.currentValueList.map((object: any, i: number) => {
                            return <option key={"queryValue-" + i} value={object} title={object}>{object}</option>;       
                        })
                    }
                    </select>
                    <br/>
                    <div class="form-group">
                    {
                        this.operations.map((object: any, i: number) => {
                            return <input type="button" class="btn btn-secondary" key={"queryOperations-" + i} value={object} title={object} onclick={this.addToTextAreaButton}/>;
                        })
                    }
                    </div>
                    <br/>
                    <textarea afterCreate={this.initQuery} id="queryToolAttrQuery" name="queryToolAttrQuery" class="form-control" style="resize: both;" onchange={this.updateQueryFromText}></textarea>
                    <br/>
                    <input type="button" class="btn btn-primary" value="Perform query" onclick={this.performQuery}/>
            </form>
        );
    }

    /**
     * Initializes the query field with the definition expression, if any. This has to be done manually to avoid conflict with update events.
     * @param evt 
     */
    private initQuery = (evt: any) => {
        if(typeof(this.query) != 'undefined'){
            var htmlElt = document.getElementById("queryToolAttrQuery") as HTMLTextAreaElement;
            if(htmlElt){
                htmlElt.value = this.query;
            }
        }
    }
    /**
     * When the query field is manually updated, updating the query
     * @param evt 
     */
    private updateQueryFromText = (evt: any) => {
        this.query = evt.target.value;
    }
    /**
     * Updating the query and query field on double click on the select inputs
     * @param evt 
     */
    private addToTextAreaSelect = (evt: any) => {
        this.query += " " + evt.target.value;
        var htmlElt = document.getElementById("queryToolAttrQuery") as HTMLTextAreaElement;
        if(htmlElt){
            htmlElt.value = this.query;
        }
    }
    /**
     * Updating the query and query field when clicking an operation button
     * @param evt 
     */
    private addToTextAreaButton = (evt: any) => {
        this.query += " " + evt.target.value;
        var htmlElt = document.getElementById("queryToolAttrQuery") as HTMLTextAreaElement;
        if(htmlElt){
            htmlElt.value = this.query;
        }
    }
    /**
     * When selecting a field from the layer in the select input, fetching all its distinct values
     * @param evt 
     */
    private fieldChanged = (evt: any) => {
        this.currentValueList = [];
        var field = evt.target.selectedOptions[0].value;
        var url;
        if(this.selectedSublayer){
            url = this.selectedSublayer.url;
        }
        else{
            var layer = this.layer as FeatureLayer;
            url = layer.url + "/" + layer.layerId;
        }
        var queryObject = new Query({
            returnGeometry: false,
            outFields: [field],
            returnDistinctValues: true,
            orderByFields: [field],
            where: "1=1"
        });
        query.executeQueryJSON(url, queryObject).then((results) => {
            for(var i = 0; i < results.features.length; i++){
                var val = results.features[i].attributes[field];
                if(val){
                    if(typeof(val) === "string"){
                        val = "'" + val.trim() + "'";
                    }
                    if(val != ""){
                        this.currentValueList.push(val);
                    }
                }
            }
        });
    }
    /**
     * Submitting the query when building is done
     */
    private performQuery = () => {
        if(typeof(this.selectedSublayer) != 'undefined'){
            this.map.updateLayerDefinitionExpression(this.layer as MapImageLayer, this.query, this.selectedSublayer.id);
        }
        else{
            this.map.updateLayerDefinitionExpression(this.layer as FeatureLayer, this.query);
        }
        this.toClose = true;
    }
    /**
     * Setting the sublayer when selected
     * @param event 
     */
    private sublayerSelection = (event: any) => {
        var selectedSublayerID = parseInt(event.target.value);
        if(this.layer instanceof MapImageLayer){
            var sublayer = this.layer.findSublayerById(selectedSublayerID);
            sublayer.load().then(() => {
                if(sublayer.definitionExpression){
                    this.query = sublayer.definitionExpression;
                }
                this.selectedSublayer = sublayer;
            });
        }
    }
}
export default QueryLayer;