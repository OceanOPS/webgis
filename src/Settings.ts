import * as rendererJsonUtils from "@arcgis/core/renderers/support/jsonUtils";
import Basemap from "@arcgis/core/Basemap";
import Renderer from "@arcgis/core/renderers/Renderer";
import Config from "./Config";
import GISMap from "./Map";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import AppInterface from "./AppInterface";
import Utils from "./Utils";

class Settings {
    // ========================================================================
    // Private
    // ========================================================================
    private map: GISMap;
    private interfaceTimeout = 5000;
    private mouseTimeoutHandler: number | undefined;
    private mouseMoveListener = (): void =>{
        this.hideInterface(false, true);
    };

    // ========================================================================
    // Public
    // ========================================================================
    // Contains ID of the current projection
    public projection: string;
    // Contains the list of all active layers
    public activeLayers: any = [];
    // Contains current basemap ID
    public basemap: string | null;
    // Current theme
    public theme: string;
    // Filtering clauses
    public filter: any;
    // Platform track mode
    public platformTrack: string;
    // Highlighting options
    public highlight: any;

    // Should the sample be empty
    public emptyGisSample: boolean;

    constructor(){
        try{
            this.emptyGisSample = Utils.isWebsiteVersion() && AppInterface.getEmptyGisSample();
        }
        catch(error){
            this.emptyGisSample = false;
        }

        this.readFromURL();
    }

    public setMap = (mapInstance: GISMap) => {
        this.map = mapInstance;
    }

    private readFromURL = (): void => {
        var uri = location.search;
        if (uri) {
            const urlSearchParams:URLSearchParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlSearchParams.entries());

            if (params.projection) {
                this.projection = params.projection;
            }
            else if (params.system){
                var proj = Config.projections.find(i => i.number == parseInt(params.system));
                if(proj){
                    this.projection = proj.ref;
                }
                else{
                    this.projection = "102100";
                }
            } else {
                this.projection = "102100";
            }

            if (params.basemap) {
                this.basemap = params.basemap;
            } else {
                this.basemap = "basemapOceansNoLabel";
            }

            if(params.theme){
                this.theme = params.theme.toLowerCase();
                if(this.theme === "jcommops" || this.theme === "all"){
                    this.theme = Config.THEME_INTEGRATED;
                }
                else if(this.theme === "oceangliders"){
                    this.theme = "gliders";
                }
            }
            else{
                if(params.t){
                    this.theme = params.t.toLowerCase();
                    if(this.theme === "jcommops" || this.theme === "all"){
                        this.theme = Config.THEME_INTEGRATED;
                    }
                    else if(this.theme === "oceangliders"){
                        this.theme = "gliders";
                    }
                }
                else{
                    this.theme = Config.THEME_INTEGRATED;
                }
            }

            if(params.highlight){
                this.highlight = JSON.parse(params.highlight);
            }

            if(params.platformTrack){
                var ref = params.platformTrack;
                this.platformTrack = ref;
                sqlClause = "PTF_REF = '" + ref + "'";
                this.filter = {"platform": sqlClause};
            }
            else{
                if(params.filter){
                    try{
                        this.filter = JSON.parse(params.filter);
                    }
                    catch(err){
                        
                    }
                }
                else{
                    // Clause for backward compatibility
                    var sqlClause: string | null = "1=1";
                    if(params.ptfRefs){
                        var refs = JSON.parse(params.ptfRefs);
                        sqlClause += " AND PTF_REF IN ('" + refs.join("','") + "')";
                    }
                    if(params.ptfCountries){
                        var ptfCountries = JSON.parse(params.ptfCountries);
                        sqlClause += " AND COUNTRY_ISO_CODE2 IN ('" + ptfCountries.join("','") + "')";
                    }
                    if(params.ptfStatuses){
                        var ptfStatuses = JSON.parse(params.ptfStatuses);
                        sqlClause += " AND PTF_STATUS IN ('" + ptfStatuses.join("','") + "')";
                    }
                    if(params.ptfPrograms){
                        var ptfPrograms = JSON.parse(params.ptfPrograms);
                        sqlClause += " AND PROGRAM IN ('" + ptfPrograms.join("','") + "')";
                    }
                    if(params.ptfNetworks){
                        var ptfNetworks = JSON.parse(params.ptfNetworks);
                        sqlClause += " AND (";
                        for(var i = 0; i<ptfNetworks.length; i++){
                            if(i > 0){                            
                                sqlClause += " or ";
                            }
                            sqlClause += " NETWORK LIKE '%" + ptfNetworks[i] + "%'";
                        }
                        sqlClause += ")" ;
                    }
                    // If no specific clause, setting it back to null (uses the default where clause if specified in settings)
                    if(sqlClause == "1=1"){
                        sqlClause = null;
                    }
                    if(sqlClause){
                        this.filter = {"platform": sqlClause};
                    }
                }
            }

        } else {
            // Default settings
            this.projection = "102100";
            this.basemap = "basemapOceansNoLabel";
            this.theme = Config.THEME_INTEGRATED;
        }
    };

    /*
    *   Helper function returning a basemap for a given ID from the config file.
    */
    public getBasemapFromID = (basemapWKID: string | null): Basemap | null => {
        var result = null;
        if(basemapWKID){
            for(var i = 0; i < Config.basemaps.length; i++){
                if (Config.basemaps[i].wkid == basemapWKID) {
                    result = Config.basemaps[i].basemap;
                }
            }
        }

        return result;
    }


    /*
    *   Helper function returning a projection for a given ID from the config file.
    */
    public getProjectionFromID = (projectionID: string): any => {
        var result = null;
        result = Config.projections.find(x => x.ref === projectionID);

        return result;
    }

    /*
    *   Bridge function setting the basemap.
    */
    public setBasemap = (basemapWkid: string | null): void => {
        this.basemap = basemapWkid;
        this.changeUrlParam("basemap", basemapWkid);
    };

    /*
    *   Sets the projection in the URL and reloads the page.
    */
    public setProjection = (wkid: string): void => {
        this.projection = wkid;
        this.changeUrlParam("projection", wkid);
        if(Utils.isWebsiteVersion()){
            window.parent["App"].utils.setBackgroundMapProjectionParamInPermalink(wkid);
        }
        // Saving layers' visibility
        this.saveLayersVisibilityToSessionStorage();
        // Saving layers' state
        this.saveAllLayersToSessionStorage();

        location.reload();
    };

    /**
    *   Change the history state and sets the parameters in the URL.
    */
    public changeUrlParam = (param: string, value: string | null): void => {
        var stateObj = {
            theme: this.theme,
            projection: this.projection,
            basemap: this.basemap
        }

        if(this.activeLayers.length > 0){
            stateObj["layers"] = JSON.stringify(this.activeLayers);
        }
        if(typeof(this.highlight) != 'undefined'){
            stateObj["highlight"] = JSON.stringify(this.highlight);
        }
        if(typeof(this.platformTrack) != 'undefined'){
            stateObj["platformTrack"] = this.platformTrack;
        }
        else if(typeof(this.filter) != 'undefined'){
            stateObj["filter"] = JSON.stringify(this.filter);
        }

        history.pushState(stateObj, "", "?" + Utils.htmlSerialize(stateObj));
    };

    /**
    *   Saves the work layer definition to the local storage
    */
    public saveWorkLayerToLocalStorage = (newId: string, sourceLayerId: string, layerName: string, renderer: any, definitionExpression: string): void => {
        if(localStorage){
            var workLayers: any = localStorage.getItem("workLayers");
            if(!workLayers){
                workLayers = {};
            }
            else{
                workLayers = JSON.parse(workLayers);
            }
            workLayers[newId] = {sourceLayerId: sourceLayerId, name: layerName, renderer: renderer, definitionExpression: definitionExpression};
            localStorage.setItem("workLayers", JSON.stringify(workLayers));
        }
    };

    /**
    *   Update the work layer definition to the local storage (source layer can't be updated). 
    */
    public updateWorkLayerToLocalStorage = (id: string, layerName: string, renderer: any, definitionExpression: string): void => {
        if(localStorage){
            var workLayers: any = localStorage.getItem("workLayers");
            if(workLayers){
                workLayers = JSON.parse(workLayers);
                workLayers[id] = {sourceLayerId: workLayers[id].sourceLayerId, name: layerName, renderer: renderer, definitionExpression: definitionExpression};
                localStorage.setItem("workLayers", JSON.stringify(workLayers));
            }
        }
    };

    /**
    *   Restore all work layers
    */
    public restoreWorkLayersFromLocalStorage = (): void => {
        try{
            if(localStorage){
                var workLayers: any = localStorage.getItem("workLayers");
                if(workLayers){
                    workLayers = JSON.parse(workLayers);
                    for(var id in workLayers){
                        var layer = workLayers[id];
                        var visible = this.getLayerVisibilityFromSessionStorage(id);
                        if(typeof(visible) === 'undefined'){
                            visible = false;
                        }
                        this.map.addWorkLayer(id, layer.sourceLayerId, layer.name, rendererJsonUtils.fromJSON(layer.renderer), layer.definitionExpression, visible);
                    }
                }
            }
        }
        catch(error){
            // Error when embedded, cannot read localstorage
            console.error(error);
        }
    }

    /**
    *   Removes the work layer from the local storage.
    */
    public removeWorkLayerFromLocalStorage = (id: string): void => {
        if(localStorage){
            var workLayers: any = localStorage.getItem("workLayers");
            if(workLayers){
                workLayers = JSON.parse(workLayers);
                delete workLayers[id];
                localStorage.setItem("workLayers", JSON.stringify(workLayers));
            }

            this.removeLayerVisibilityFromSessionStorage(id);
        }
    };

    /**
    *   Saves all the layers definition to the session storage
    */
    public saveAllLayersToSessionStorage = (): void => {
        for(var i = 0; i < this.map.addedLayerIds.length; i++){
            // TODO handle default group ?
            var group: string | null = null;
            var layer = this.map.mapView.map.findLayerById(this.map.addedLayerIds[i]);

            // Testing layer category
            if(Config.operationalLayers.map(l => l.id).includes(layer.id)){
                group = "operationalLayers";
            }
            else if(Config.dynamicLayers.map(l => l.id).includes(layer.id)){
                group = "otherLayers";
            }
            if(group){
                if(layer instanceof FeatureLayer){
                    this.saveLayerToSessionStorage(layer.id, layer.renderer, layer.definitionExpression, group);
                }
                else{
                    this.saveLayerToSessionStorage(layer.id, null, null, group);
                }
            }
        }
    };

    /**
    *   Saves the layer definition to the session storage
    */
    public saveLayerToSessionStorage = (id: string, renderer: any, definitionExpression: string | null, group: string) => {
        if(sessionStorage){
            var layers: any = sessionStorage.getItem(group);
            if(!layers){
                layers = {};
            }
            else{
                layers = JSON.parse(layers);
            }
            layers[id] = {renderer: renderer, definitionExpression: definitionExpression};
            sessionStorage.setItem(group, JSON.stringify(layers));
        }
    };

    /**
    *   Update the layer definition to the session storage (source layer can't be updated). 
    */
    public updateLayerToSessionStorage = (id: string, renderer: any, definitionExpression: string, group: string) => {
        if(sessionStorage){
            var layers: any = sessionStorage.getItem(group);
            if(layers){
                layers = JSON.parse(layers);
                layers[id] = {renderer: renderer, definitionExpression: definitionExpression};
                sessionStorage.setItem(group, JSON.stringify(layers));
            }
        }
    };

    /**
    *   Restore all layers
    */
    public restoreLayersFromSessionStorage = (group: string) => {
            try{
                if(sessionStorage){
                    var layers: any = sessionStorage.getItem(group);
                    if(layers){
                        layers = JSON.parse(layers);
                        for(var id in layers){
                            var layer = layers[id];
                            var visible = this.getLayerVisibilityFromSessionStorage(id);
                            if(typeof(visible) === 'undefined'){
                                visible = true;
                            }
                            
                            if(group == "operationalLayers"){
                                var layerConfig = Config.operationalLayers.find(elt => elt.id == id);
                                if(layerConfig){
                                    if(layerConfig.theme == this.theme){
                                        this.map.addLayer(id, visible, layer.definitionExpression, rendererJsonUtils.fromJSON(layer.renderer));
                                    }
                                }
                            }
                            else{
                                this.map.addLayer(id, visible, layer.definitionExpression, rendererJsonUtils.fromJSON(layer.renderer));
                            }
                        }
                    }
                }
            }
            catch(error){
                // Error when embedded, cannot read sessionStorage
            }    
    }

    /**
    *   Removes the layer from the session storage.
    */
    public removeLayerFromSessionStorage = (id: string, group: string): void => {
        if(sessionStorage){
            var layers: any = sessionStorage.getItem(group);
            if(layers){
                layers = JSON.parse(layers);
                delete layers[id];
                sessionStorage.setItem(group, JSON.stringify(layers));
            }

            this.removeLayerVisibilityFromSessionStorage(id);
        }
    };

    /**
    *   Saves all layers visibility to the Session storage.
    */
    public saveLayersVisibilityToSessionStorage = (): void => {
        for(var i = 0; i < this.map.addedLayerIds.length; i++){
            var layer = this.map.mapView.map.findLayerById(this.map.addedLayerIds[i]);
            this.updateLayerVisibilityToSessionStorage(layer.id, layer.visible);
        }
    };

    /**
    *   Updates the layer visibility in the Session storage.
    */
    public updateLayerVisibilityToSessionStorage = (id: string, visible: boolean): void =>{
        if(sessionStorage){
            var visibility: any = sessionStorage.getItem("layersVisibility");
            if(!visibility){
                visibility = {};
            }
            else{
                visibility = JSON.parse(visibility);
            }
            var layer = this.map.mapView.map.findLayerById(id);
            if(layer instanceof MapImageLayer && layer.allSublayers && layer.allSublayers.length > 0){
                var subvisibility = {};
                for(var i = 0 ; i<layer.allSublayers.length ; i++){
                    subvisibility[layer.allSublayers[i].id] = layer.allSublayers[i].visible;
                }
                visibility[id] = {
                    root: visible,
                    sublayers: subvisibility
                };
            }
            else{
                visibility[id] = visible;
            }
            sessionStorage.setItem("layersVisibility", JSON.stringify(visibility));
        }
    };

    /**
    *   Remove the layer visibility info from the session storage.
    */
    public removeLayerVisibilityFromSessionStorage = (id: string): void => {
        if(sessionStorage){
            var visibility: any = sessionStorage.getItem("layersVisibility");
            if(visibility){
                visibility = JSON.parse(visibility);
                delete visibility[id];
                sessionStorage.setItem("layersVisibility", JSON.stringify(visibility));
            }
        }
    };

    /**
    *   Retrieves all layers visibility info from the sesison storage.
    */
    public getLayersVisibilityFromSessionStorage = (): any =>{
        var result: any = null;
        if(sessionStorage){
            var visibility = sessionStorage.getItem("layersVisibility");
            if(visibility){
                result = JSON.parse(visibility);
            }
            else{
                result = {};
            }
        }
        return result;
    };

    /**
     * Retrieves the layer renderer from the session storage
     */
    public getLayerRendererFromSessionStorage = function(id: string): Renderer | null{
        var renderer = null;
        try{
            if(sessionStorage){
                var layers: any = sessionStorage.getItem("operationalLayers");
                if(layers){
                    layers = JSON.parse(layers);
                    var layer: any = layers[id];
                    if(layer){
                        renderer = rendererJsonUtils.fromJSON(layer.renderer);
                    }
                }
            }
        }
        catch(error){
            // Error when embedded, cannot read sessionStorage
            renderer = null;
            console.error(error);
        }
        return renderer;
    }

    /**
    *   Retrieve the layer visbility info from the session storage.
    */
    public getLayerVisibilityFromSessionStorage = (id: string): boolean => {
        var visible: any;
        var layers: any = this.getLayersVisibilityFromSessionStorage();
        if(layers.hasOwnProperty(id)){
            visible = layers[id];
        }
        
        return visible;
    };


    /**
     * Hides the interface
     */
    public hideInterface = (enabled: boolean, restart: boolean): void => {
        var uiCorner: any = document.getElementsByClassName("esri-ui-corner");
        var i;
        for (i = 0; i < uiCorner.length; i++) {
            uiCorner[i].style.opacity = enabled ? "0": "1";
        }
        /*var uiLoader = document.getElementById("main-loader");
        uiLoader.style.opacity = enabled ? "0": "1";
*/
        if(enabled){

        }
        else{
            clearTimeout(this.mouseTimeoutHandler);
            if(restart){
                this.mouseTimeoutHandler = setTimeout(() => {
                    this.hideInterface(true, false);
                }, this.interfaceTimeout);
            }
        }
    }

    public activateAutoHide = (enabled: boolean): void => {
        if(enabled){
            this.mouseTimeoutHandler = setTimeout(() => {
                this.hideInterface(true, false);
            }, this.interfaceTimeout);
            document.addEventListener('mousemove', this.mouseMoveListener);
        }
        else{
            document.removeEventListener('mousemove', this.mouseMoveListener);
            this.hideInterface(false, false);
        }
    }
}

export default Settings;