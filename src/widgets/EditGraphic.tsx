import { aliasOf, property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Widget from "@arcgis/core/widgets/Widget";
import {EditGraphicViewModel, DraftPtf} from "./EditGraphicViewModel";

import { tsx } from "@arcgis/core/widgets/support/widget";
import GISMap from "../Map";
import Sketch from "@arcgis/core/widgets/Sketch";
import AppInterface from "../AppInterface";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Polyline from "@arcgis/core/geometry/Polyline";
import Point from "@arcgis/core/geometry/Point";
import Utils from "../Utils";
import Graphic from "@arcgis/core/Graphic";

const CSS = {
  base: "esri-widget",
  customDefault: "custom-widget-default"
};

@subclass("esri.widgets.EditGraphic")
class EditGraphic extends Widget{
    // Reference to the sketch widget
    private sketchWidget: Sketch;
    // References to the different hnadler attached to the widget
    private onCreateCompleteHandler: IHandle;
    private onUpdateCompleteHandler: IHandle;
    private onDeleteCompleteHandler: IHandle;
    private map: GISMap;

    @aliasOf("viewModel.idsSelected")
    idsSelected: EditGraphicViewModel["idsSelected"];

    @aliasOf("viewModel.draftPtfs")
    draftPtfs: EditGraphicViewModel["draftPtfs"];

    @aliasOf("viewModel.countPoints")
    countPoints: EditGraphicViewModel["countPoints"];

    @aliasOf("viewModel.countPolyline")
    countPolyline: EditGraphicViewModel["countPolyline"];

    @property()
    viewModel: EditGraphicViewModel = new EditGraphicViewModel();

    constructor(props?: any){
        super(props);
        this.map = props.map;

        this.sketchWidget = this.map.activateSketchWidget(true);
    }

    
    postInitialize() {
        if(!this.onCreateCompleteHandler){
            this.onCreateCompleteHandler = this.sketchWidget.on("create", this.createGraphicEvent);
        }
        if(!this.onUpdateCompleteHandler){
            this.onUpdateCompleteHandler = this.sketchWidget.on("update", this.updateGraphicEvent);
        }
        if(!this.onDeleteCompleteHandler){
            this.onDeleteCompleteHandler = this.sketchWidget.on("delete", this.deleteGraphicEvent);
        }

        // Helper used for cleaning up resources once the widget is destroyed
        this.own(this.onCreateCompleteHandler);
        this.own(this.onUpdateCompleteHandler);
        this.own(this.onDeleteCompleteHandler);
    }

    render(){
        return this.getDraftHtml(this.countPoints,this.countPolyline);
    }

    destroy() {
        this.map.activateSketchWidget(false);
        super.destroy();
    }
        
    /**
     * Synchronizes this widget draft platforms array with the given one.
     * @param draftsArray the array of draft platform deployments
     * @param action the action to perform ("all": replace the array, "delete": remove from the existing array the ones provided)
     */
    public syncDraftPtfs = (draftsArray: DraftPtf[], action: "all" | "delete") => {
        if(action == "all"){
            this.draftPtfs = draftsArray;
        }
        else if(action = "delete"){
            this.draftPtfs = this.draftPtfs.filter((item: any) => !draftsArray.find(ditem => ditem.draftId === item.draftId));
        }
        if(this.draftPtfs.length == 0){
            var graphicsToRemove = [];
            for(var i = 0; i < this.sketchWidget.layer.graphics.length;i++){
                if(this.sketchWidget.layer.graphics.getItemAt(i).geometry.type == "point"){
                    graphicsToRemove.push(this.sketchWidget.layer.graphics.getItemAt(i));
                }
            }
            this.sketchWidget.layer.removeMany(graphicsToRemove);
            this.countPoints = 0;
        }
        else{
            // Adding/updating drafts
            for(var i = 0; i < this.draftPtfs.length; i++){
                // Checking if draft exists in GIS, updating if so
                var found = false; 
                var j = 0;
                while(!found && j < this.sketchWidget.layer.graphics.length){
                    var currentGraphic = this.sketchWidget.layer.graphics.getItemAt(j);
                    if(currentGraphic){
                        if(currentGraphic.attributes.draftId == this.draftPtfs[i].draftId){
                            found = true;
                            var newGeom = this.sketchWidget.layer.graphics.getItemAt(j).geometry.clone() as Point;
                            newGeom.latitude = this.draftPtfs[i].lat;
                            newGeom.longitude = this.draftPtfs[i].lon;
                            this.sketchWidget.layer.graphics.getItemAt(j).geometry = newGeom;
                        }
                    }
                    j++;
                }

                // Adding
                if(!found){
                    var geom = webMercatorUtils.geographicToWebMercator(new Point({
                        longitude: this.draftPtfs[i].lon,
                        latitude: this.draftPtfs[i].lat
                    }));
                    var graphic = new Graphic({
                        attributes: {
                            "draftId": this.draftPtfs[i].draftId
                        },
                        geometry : geom,
                        popupTemplate: {
                            title: "{draftId}"
                        },
                        symbol: this.sketchWidget.viewModel.pointSymbol 
                    });
                    this.sketchWidget.layer.add(graphic);
                    this.countPoints++;
                }
            }

            // Removing outdated drafts
            var graphicsToRemove = [];
            for(var i = 0; i < this.sketchWidget.layer.graphics.length;i++){
                var elt = this.draftPtfs.find(item => item.draftId === this.sketchWidget.layer.graphics.getItemAt(i).attributes.draftId);
                if(!elt){
                    if(this.sketchWidget.layer.graphics.getItemAt(i).geometry.type == "point"){
                        graphicsToRemove.push(this.sketchWidget.layer.graphics.getItemAt(i));
                    }
                    this.countPoints--;
                }
            }
            this.sketchWidget.layer.removeMany(graphicsToRemove);
        }
    };

    /**
    * Computes the HTML required for the tool panel
    * @param {integer} countPoints initial count of draft points
    * @param {integer} countPolyline initial count of draft polylines
    */
    private getDraftHtml = (countPoints: number, countPolyline: number) => {
        var separator = ",";
        var getIdsList = () => {
            var list: string= "";
            for(var i = 0; i < this.idsSelected.length; i++){
                var id = this.idsSelected[i];
                if(i > 0){
                    list += ", "
                }
                list += "#" + id;
            }
            return (
                <span>{list}</span>
            )
        };
        return (
        <div class={this.classes([CSS.base, CSS.customDefault])}>
            {
                this.idsSelected.length == 0 && (this.countPoints > 0 || this.countPolyline > 0) &&
                <p id='selectionIDs'>No draft selected</p>
            }
            {
                this.idsSelected.length > 0 &&
                <p id='selectionIDs'>Selected draft: {(getIdsList())}</p>
            }
            {
                this.countPoints > 0 &&
                <div id='pointDrafts' key='pointDrafts'>
                    <hr/>
                    <p>
                        <button id='showUploaderLink' key='showUploaderLink' class='btn btn-sm btn-primary' onclick={AppInterface.showUploader}><span class='esri-icon-upload'></span>&nbsp;save <span id='pointsCounter'>{this.countPoints}</span> draft deployment(s)</button>
                    </p>
                </div>
            }
            {
                this.countPolyline > 0 &&
                <div id='polylineDrafts' key='polylineDrafts'>     
                    <hr/>
                    <p>
                        <button id='cruiseFormLink' key='cruiseFormLink' class='btn btn-sm btn-primary' onclick={this.openCruiseForm}><span class='esri-icon-upload'></span>&nbsp;save draft cruise plan</button>
                    </p>
                    <p>
                        <button id='cruiseOrthodromy' class='btn btn-sm btn-secondary' onclick={this.cruiseGeodesicDensify}><span class='esri-icon-globe'></span> orthodromy</button>
                        &nbsp;/&nbsp;
                        <button id='cruiseDensify' class='btn btn-sm btn-secondary' onclick={this.cruiseDensify}><span class='esri-icon-globe'></span> densify</button>
                    </p>
                </div>
            }
            {
                this.countPoints == 0 && this.countPolyline == 0 &&
                <p id='noDraft'>Add draft to continue, use the drawing panel above to select a drawing tool</p>
            }            
        </div>
        );
   };

    /**
     * Helper function opening the cruise form and passing through it the WKT of the polyline drawn
     */
    private openCruiseForm = () => {
        for(var i = 0; i < this.sketchWidget.layer.graphics.length; i++){
            if(this.sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var geom = webMercatorUtils.webMercatorToGeographic(this.sketchWidget.layer.graphics.getItemAt(i).geometry);
                var wkt = Utils.polylineJsonToWKT(geom);
                AppInterface.openCruiseForm(wkt);
            }
        }
    }

    /*
    *   Computes the geodesic route for a given polyline and updates the feature's geometry
    */
    private cruiseGeodesicDensify = () => {
        for(var i = 0; i < this.sketchWidget.layer.graphics.length; i++){
            if(this.sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var geom: Polyline = this.sketchWidget.layer.graphics.getItemAt(i).geometry as Polyline;
                var densifiedGeom = geometryEngine.geodesicDensify(geom, 10000);
                this.sketchWidget.layer.graphics.getItemAt(i).geometry = densifiedGeom;
            }
        }
    }

    /*
    *   Computes a densified route for a given polyline and updates the feature's geometry
    */
    private cruiseDensify = () => {
        for(var i = 0; i < this.sketchWidget.layer.graphics.length; i++){
            if(this.sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var geom: Polyline = this.sketchWidget.layer.graphics.getItemAt(i).geometry as Polyline;
                var densifiedGeom = geometryEngine.densify(geom, 10000);
                this.sketchWidget.layer.graphics.getItemAt(i).geometry = densifiedGeom;
            }
        }
    }

    /**
     * Event function called when a graphic is created or being created
     * @param {*} event 
     */
     private createGraphicEvent = (event: any) => {
        var graphic = event.graphic;

        if (event.state === "complete") {
            if(graphic.geometry.type == "point"){
                this.countPoints++;
                var draftId = AppInterface.addDraftFromGIS(graphic.geometry.latitude, graphic.geometry.longitude);
                if(!draftId){
                    draftId = "error!" +  this.countPoints;
                }
                this.draftPtfs.push({"draftId": draftId, "lat": graphic.geometry.latitude, "lon": graphic.geometry.longitude});
                graphic.attributes = {"draftId": draftId};
            }
            else if(graphic.geometry.type == "polyline"){
                this.countPolyline++;
                if(this.countPolyline == 1){
                    this.sketchWidget.availableCreateTools = ["point"];
                    this.sketchWidget.cancel();
                }
                graphic.attributes = {"draftId": "cruise" + this.countPolyline};
            }
        }
    };

    /**
     * Event function called when a graphic is updated or being updated
     * @param {*} event 
     */
    private updateGraphicEvent = (event: any) =>{        
        var graphics = event.graphics;
        var draftsToUpdate = [];
        this.idsSelected = [];
        for(var i = 0; i < graphics.length; i++){
            var graphic = graphics[i];
            this.idsSelected.push(graphic.attributes.draftId);
            if (event.state === "complete") {
                if(graphic.geometry.type == "point"){
                    for(var j=0; j<this.draftPtfs.length;j++) {
                        if(this.draftPtfs[j].draftId === graphic.attributes.draftId)
                        {
                            this.draftPtfs[j].lon = graphic.geometry.longitude;
                            this.draftPtfs[j].lat = graphic.geometry.latitude;
                        }
                    }
                    draftsToUpdate.push({"draftId": graphic.attributes.draftId, "lon": graphic.geometry.longitude, "lat": graphic.geometry.latitude});
                }
                else if(graphic.geometry.type == "polyline"){
                }
            }
        }
        if (event.state === "complete") {
            this.idsSelected = [];
        }
        AppInterface.updateDraftsFromGIS(draftsToUpdate);        
    };

    /**
     * Event function called when a graphic is deleted
     * @param {*} event 
     */
    private deleteGraphicEvent = (event: any) => {
        var graphics = event.graphics;
        
        var draftsToDelete = [];
        for(var i = 0; i < graphics.length; i++){
            if(graphics[i].geometry.type == "point"){                
                draftsToDelete.push({"draftId": graphics[i].attributes.draftId});
                this.draftPtfs = this.draftPtfs.filter(item => graphics[i].attributes.draftId != item.draftId);
                this.countPoints--;
            }
            else if(graphics[i].geometry.type == "polyline"){
                this.countPolyline--;
                if(this.countPolyline == 0){
                    this.sketchWidget.availableCreateTools = ["point", "polyline"];
                }
            }
        }
        AppInterface.deleteDraftsFromGIS(draftsToDelete);
    };
}

export default EditGraphic;