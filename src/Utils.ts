import { Modal } from "bootstrap";
import AppInterface from "./AppInterface";

class Utils{
    private static loadingCount: number = 0;
    private static loadingEnabled: boolean = true;

    public static buildWhereClause = (filterField: string, objectsRef: string[]): string => {
        var arrays = Utils.sliceArray(objectsRef, 1000);
        var whereClause = "(";

        for(var i = 0; i < arrays.length; i++){
            if(i > 0){
                whereClause += " OR ";
            }
            whereClause += filterField + " IN (";
            for(var j = 0 ; j < arrays[i].length ; j++){
                if(j > 0){
                    whereClause += ",";
                }
                if(filterField == "ID" || filterField.endsWith("_ID")){
                    whereClause += arrays[i][j];
                }
                else{
                    whereClause += "'" + arrays[i][j] + "'";
                }
            }
            whereClause += ")"
        }

        whereClause += ")";

        return whereClause;
    }

    public static sliceArray = (array: any[], nbElements: number): any[][] => {
        var arrays = [], currentArray, endIndex;

        for(var i = 0; i < array.length; i += nbElements){
            endIndex = Math.min(array.length, i + nbElements);
            currentArray = array.slice(i, endIndex);

            arrays.push(currentArray);
        }

        return arrays;
    }

    public static polylineJsonToWKT = (arcgisJsonObject: any): string => {
        var shape = arcgisJsonObject.paths;
        var lat, lon;

        var wkt = "MULTILINESTRING(";
        for (var j = 0; j < shape.length; j++) {
            var lines = shape[j];
            if (j != 0) {
                wkt = wkt + ",";
            }
            var wkt = wkt + "(";
            for (var i = 0; i < lines.length; i++) {
                if (i != 0) {
                    wkt = wkt + ",";
                }
                var coordinates = lines[i];
                lon = Math.round(coordinates[0] * 10000) / 10000;
                lat = Math.round(coordinates[1] * 10000) / 10000;
                wkt = wkt + lon + " " + lat;
            }
            wkt = wkt + ")";
        }
        wkt = wkt + ")";

        return wkt;
    }

    public static isTreeVisible = (sublayer: any): boolean => {
        var currentLayer = sublayer.parent;
        while(currentLayer && currentLayer.id){
            if(!currentLayer.visible){
                return false;
            }
            currentLayer = currentLayer.parent;
        }

        return sublayer.visible;
    }


    public static setLoadingEnabled = (enabled: boolean): void => {
        Utils.loadingEnabled = enabled;
    }

    public static setMainLoading = (activated: boolean): void => {
        // Checking if loading enabled (or disabled with remaining loader)
        var mainLoader = document.getElementById("main-loader");
        if(activated){
            Utils.loadingCount++;
            if(Utils.loadingCount === 1){
                if(Utils.loadingEnabled){
                    if(mainLoader){
                        mainLoader.style.visibility = "visible";
                    }
                }
            }
        }
        else{
            Utils.loadingCount--;
            if(Utils.loadingCount === 0){
                if(mainLoader){
                    mainLoader.style.visibility = "hidden";
                }
            }
        }
    }


    public static displayAlert = (title: string, content: string): void => {     
        var modalElt = document.querySelector("#alertModal");
        if(modalElt){
            var titleElt = modalElt.querySelector("h4.modal-title");
            var bodyElt = modalElt.querySelector("div.modal-body");
            if(titleElt && bodyElt){
                titleElt.innerHTML = title;
                bodyElt.innerHTML = content;
                var modal = new Modal(modalElt);
                modal.show();
            }
        }
    }

    public static mapLoaded = (): void => {
        document.body.classList.add("loaded");
        if(!Utils.isWebsiteVersion()){
            $(".esri-ui-corner").css("visibility", "visible");
        }
        else if(!AppInterface.getEmptyGisSample()){
            $(".esri-ui-corner").css("visibility", "visible");
        }
    }

    public static isEmbedded = (): boolean => {
        try{
            return window.parent && window.parent != window;
        }
        catch(error){
            return false;
        }
    }
    public static isWebsiteVersion = (): boolean => {
        try{
            return this.isEmbedded() && window.parent.document.domain == document.domain && typeof(window.parent["App"]) != 'undefined';
        }
        catch(error){
            return false;
        }
    }

    public static htmlSerialize = (array: {}): string => {
        return Object.keys(array).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(array[k])
        }).join('&');
    }

    public static changeCursor = (cursorType?: "crosshair" | "auto" | "wait" | null) => {
        var mapDiv = document.getElementById("mapViewDiv");
        if(mapDiv){
            if(cursorType){
                mapDiv.style.cursor = cursorType;
            }
            else{
                mapDiv.style.cursor = "auto";
            }
        }
    }
}

export default Utils;