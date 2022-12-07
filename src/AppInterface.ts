import Config from "./Config";
import App from "./main";
import Utils from "./Utils";

class AppInterface{
    public static objectsChanged = (objectRefs: string[], objectType: string): void => {
        if(!AppInterface.getEmptyGisSample()){
            App.map.applyFilterLayers(objectRefs, objectType);
        }
    }

    public static selectionObjectsChanged = (selectedObjectsRef: string[], featureType: string): void => {
        if(!featureType){
            featureType = "platform";
        }

        App.map.selectionLayer.applySelectionLayers(selectedObjectsRef, featureType);
    }

    public static sendSelectionToDashboard = (selectedObjectsRef: string[], featureType: string): void => {
        if (Utils.isWebsiteVersion()) {
            parent["App"].session.selections.set(featureType, selectedObjectsRef, true);
        }
    }

    public static getObjectsRefs = (featureType: string): any => {
        var listObjects: any[] | null = [];
        if (Utils.isWebsiteVersion()) {
            ///Get from Dashboard
            if(featureType === Config.TYPE_PTF || featureType === Config.TYPE_TRACKLINE){
                listObjects = window.parent["App"].session.samples['platform'];
            }
            else if(featureType === Config.TYPE_OBS){
                listObjects = window.parent["App"].session.samples['observation'];
            }
            else if(featureType === Config.TYPE_CRUISE){
                listObjects = window.parent["App"].session.samples['cruise'];
            }
            else if(featureType === Config.TYPE_LINE){
                listObjects = window.parent["App"].session.samples['line'];
            }
            else if(featureType === Config.TYPE_SITE){
                listObjects = window.parent["App"].session.samples['site'];
            }

            if(!listObjects || listObjects.length == 0){
                listObjects = [-1];
            }
        }
        else {
            listObjects = null;
        }
        
        return listObjects;
    }

    public static setEmptyGisSample = (isEmpty: boolean): void => {
        try{
            window.parent["App"].config.emptyGisSample = isEmpty;
        }
        catch(error){
            console.error(error);
            //return false;
        }
    }
    
    public static getEmptyGisSample = (): boolean =>{
        try{
            return window.parent["App"].config.emptyGisSample;
        }
        catch(error){
            return false;
        }
    }

    public static openCruiseForm = (wkt: string): void => {
        if(Utils.isWebsiteVersion()){
            window.parent["openRegisterCruise"](wkt);
        }
    }


    public static openPtfForm = (draftID: string, wmo: string, lat: string, lon: string, internalId: string): void => {
        if (Utils.isWebsiteVersion()){
            window.parent["App"].utils.submitPtfFromGIS({draftId: draftID, attributes: {wmo: wmo, lat: lat, lon: lon, internalId: internalId}});
        }
    }    


    public static processDraftPtfsFromDashboard = (arrayOfObjects: any[]): void =>{
        App.map.processDraftPtfs(arrayOfObjects);
    }


    // New functions for draft management
    public static addDraftFromGIS = (lat: number, lon: number): string | null => {
        if (Utils.isWebsiteVersion()){
            return window.parent["App"].modules.ptfDrafts.addDraft(lat, lon);
        }
        else{
            return null;
        }
    }

    public static updateDraftsFromGIS = (draftsArray: any): void =>{
        if (Utils.isWebsiteVersion()){
            window.parent["App"].modules.ptfDrafts.editDrafts(draftsArray);
        }
    }
    
    public static deleteDraftsFromGIS = (draftsArray: any): void => {
        if (Utils.isWebsiteVersion()){
            window.parent["App"].modules.ptfDrafts.deleteDrafts(draftsArray);
        }
    }

    public static showUploader = (): void => {
        if (Utils.isWebsiteVersion()){
            window.parent["App"].modules.ptfDrafts.showUploader();
        }
    }

    // Calls from dashboard to GIS
    public static displayDrafts = (draftsArray: any): void => {
        App.map.processDraftPtfs(draftsArray);
    }

    public static deleteDrafts = (draftsArray: any): void => {
        App.map.deleteDraftPtfs(draftsArray);
    }

    public static selectDrafts = (draftsArray: any): void => {
        App.map.selectDraftPtfs(draftsArray);
    }


    public static activateCruiseEditingMode = () : void => {
        App.map.activateCruiseEditingMode();
    }

}

export default AppInterface;