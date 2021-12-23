define([
    "esri/Graphic",
    "esri/geometry/geometryEngine",
    "esri/geometry/support/webMercatorUtils"
], function (Graphic, geometryEngine, webMercatorUtils) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Reference to the sketch widget
    var sketchWidget = null;
    // References to the different hnadler attached to the widget
    var onCreateCompleteHandler = null;
    var onUpdateCompleteHandler = null;
    var onDeleteCompleteHandler = null;

    // drafts counter
    var countPoints = 0;
    var countPolyline = 0;

    /**
     * Event function called when a graphic is created or being created
     * @param {*} event 
     */
    var createGraphicEvent = function(event){
        var graphic = event.graphic;

        if (event.state === "complete") {
            if(graphic.geometry.type == "point"){
                countPoints++;
                var draftId = app.appInterface.addDraftFromGIS(graphic.geometry.latitude, graphic.geometry.longitude);
                app.models.draftPtfs.push({"draftId": draftId, "lat": graphic.geometry.latitude, "lon": graphic.geometry.longitude});
                if(!draftId){
                    draftId = "error!" +  countPoints;
                }
                graphic.attributes = {"draftId": draftId};
            }
            else if(graphic.geometry.type == "polyline"){
                countPolyline++;
                if(countPolyline == 1){
                    sketchWidget.availableCreateTools = ["point"];
                    sketchWidget.cancel();
                }
                graphic.attributes = {"draftId": "cruise" + countPolyline};
            }
            
            updateDraftHtml(countPoints, countPolyline);
        }
    };

    /**
     * Event function called when a graphic is updated or being updated
     * @param {*} event 
     */
    var updateGraphicEvent = function(event){        
        var graphics = event.graphics;
        var draftsToUpdate = [];
        var idsSelected = [];
        for(var i = 0; i < graphics.length; i++){
            var graphic = graphics[i];
            idsSelected.push(graphic.attributes.draftId);
            if (event.state === "complete") {
                if(graphic.geometry.type == "point"){
                    for(var j=0; j<app.models.draftPtfs.length;j++) {
                        if(app.models.draftPtfs[j].draftId === graphic.attributes.draftId)
                        {
                            app.models.draftPtfs[j].lon = graphic.geometry.longitude;
                            app.models.draftPtfs[j].lat = graphic.geometry.latitude;
                        }
                    }
                    draftsToUpdate.push({"draftId": graphic.attributes.draftId, "lon": graphic.geometry.longitude, "lat": graphic.geometry.latitude});
                }
                else if(graphic.geometry.type == "polyline"){
                }
            }
        }
        if (event.state === "complete") {
            idsSelected = [];
        }
        app.appInterface.updateDraftsFromGIS(draftsToUpdate);
        updateDraftHtml(countPoints, countPolyline, idsSelected);       
        
    };

    /**
     * Event function called when a graphic is deleted
     * @param {*} event 
     */
    var deleteGraphicEvent = function(event){
        var graphics = event.graphics;
        
        var draftsToDelete = [];
        for(var i = 0; i < graphics.length; i++){
            if(graphics[i].geometry.type == "point"){                
                draftsToDelete.push({"draftId": graphics[i].attributes.draftId});
                app.models.draftPtfs = app.models.draftPtfs.filter(item => graphics[i].attributes.draftId != item.draftId);
                countPoints--;
            }
            else if(graphics[i].geometry.type == "polyline"){
                countPolyline--;
            }
        }
        app.appInterface.deleteDraftsFromGIS(draftsToDelete);
        updateDraftHtml(countPoints, countPolyline);
    };

    /**
     * Updates the HTML content in the tool panel
     * @param {integer} countPoints the number of draft points drawn on the map
     * @param {integer} countPolyline the number of draft polylines drawn on the map (should be no more than 1)
     * @param {array<integer>} idsSelected the array of selected draft IDs
     */
    var updateDraftHtml = function(countPoints, countPolyline, idsSelected){
        // Counters HTML
        document.getElementById('pointsCounter').innerHTML = countPoints;
        document.getElementById('polylinesCounter').innerHTML = countPolyline;
        if(countPoints > 0){
            document.getElementById('pointDrafts').style.display = "block";
        }
        if(countPolyline > 0){
            document.getElementById('polylineDrafts').style.display = "block";
        }
        if(countPoints == 0 && countPolyline == 0){
            document.getElementById('noDraft').style.display = "block";
            document.getElementById('pointDrafts').style.display = "none";
            document.getElementById('polylineDrafts').style.display = "non";
        }
        else{
            document.getElementById('noDraft').style.display = "none";
        }

        // Selection HTML
        if(idsSelected){
            if(idsSelected.length > 0){
                var html = "Selected draft(s): ";
                for(var i = 0; i < idsSelected.length; i++){
                    var id = idsSelected[i];
                    if(i > 0){
                        html += ", "
                    }
                    html += "#" + id;
                }
            }
            else{
                html = "No draft selected";
            }
            document.getElementById('selectionIDs').innerHTML = html;
        }
        else{
            document.getElementById('selectionIDs').innerHTML = "No draft selected";
        }
    }

    /**
     * Computes the initial HTML required for the tool panel
     * @param {integer} countPoints initial count of draft points
     * @param {integer} countPolyline initial count of draft polylines
     */
    var getDraftHtml = function(countPoints, countPolyline){
        var res = "";
        res += "<p id='selectionIDs'>No draft selected</p>";
        res += "<hr>";
        res += "<p id='pointDrafts' style='display: " + (countPoints > 0 ? "block" : "none") + ";'><span id='pointsCounter'>" + countPoints + "</span> unsaved draft deployment(s). Click <a id='showUploaderLink' href='javascript:void(0)'>here</a> to save it/them." + "</p>";
        res += "<hr>";
        res += "<div id='polylineDrafts' style='display: " + (countPolyline > 0 ? "block" : "none") + ";'><p><span id='polylinesCounter'>" + countPolyline + "</span> unsaved draft cruise plan. Click <a id='cruiseFormLink' href='javascript:void(0)'>here</a> to save it." + "</p>";
        res += "<p>" + "<a id='cruiseOrthodromy' href='javascript:void(0)'><span class='esri-icon-globe'></span> orthodromy</a>" + "</p>";
        res += "<p>" + "<a id='cruiseDensify' href='javascript:void(0)'><span class='esri-icon-globe'></span> densify</a>" + "</p>";
        res += "</div>";

        res += "<p id='noDraft' style='display: " + ((countPoints == 0 && countPolyline == 0) ? "block" : "none") + ";'>Add draft to continue, use the bottom right panel to select a drawing tool</p>";

        return res;
    };

    /**
     * Helper function opening the cruise form and passing through it the WKT of the polyline drawn
     */
    var openCruiseForm = function(){
        for(var i = 0; i < sketchWidget.layer.graphics.length; i++){
            if(sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var geom = webMercatorUtils.webMercatorToGeographic(sketchWidget.layer.graphics.getItemAt(i).geometry);
                var wkt = app.utils.polylineJsonToWKT(geom);
                app.appInterface.openCruiseForm(wkt);
            }
        }
    }

    /*
    *   Computes the geodesic route for a given polyline and updates the feature's geometry
    */
    var cruiseGeodesicDensify = function(){
        for(var i = 0; i < sketchWidget.layer.graphics.length; i++){
            if(sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var densifiedGeom = geometryEngine.geodesicDensify(sketchWidget.layer.graphics.getItemAt(i).geometry, 10000);
                sketchWidget.layer.graphics.getItemAt(i).geometry = densifiedGeom;
            }
        }
    }

    /*
    *   Computes a densified route for a given polyline and updates the feature's geometry
    */
    var cruiseDensify = function(){
        for(var i = 0; i < sketchWidget.layer.graphics.length; i++){
            if(sketchWidget.layer.graphics.getItemAt(i).geometry.type == "polyline"){
                var densifiedGeom = geometryEngine.densify(sketchWidget.layer.graphics.getItemAt(i).geometry, 10000);
                sketchWidget.layer.graphics.getItemAt(i).geometry = densifiedGeom;
            }
        }
    }

    // ========================================================================
    // Public
    // ========================================================================
    self.init = function(appInstance){
        app = appInstance;

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Draft edit", "htmlContent": "<div class='.container'>" + getDraftHtml(countPoints,countPolyline) + "</div>", position: "bottom-leading"};
        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        sketchWidget = app.controllers.map.activateSketchWidget(true);
        if(!onCreateCompleteHandler){
            onCreateCompleteHandler = sketchWidget.on("create", createGraphicEvent);
        }
        if(!onUpdateCompleteHandler){
            onUpdateCompleteHandler = sketchWidget.on("update", updateGraphicEvent);
        }
        if(!onDeleteCompleteHandler){
            onDeleteCompleteHandler = sketchWidget.on("delete", deleteGraphicEvent);
        }
        if(document.getElementById('showUploaderLink')){
            document.getElementById('showUploaderLink').addEventListener("click", app.appInterface.showUploader);
        }
        if(document.getElementById('cruiseFormLink')){
            document.getElementById('cruiseFormLink').addEventListener("click", openCruiseForm);
        }
        if(document.getElementById('cruiseOrthodromy')){
            document.getElementById('cruiseOrthodromy').addEventListener("click", cruiseGeodesicDensify);
        }
        if(document.getElementById('cruiseDensify')){
            document.getElementById('cruiseDensify').addEventListener("click", cruiseDensify);
        }
    }

    
    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        app.controllers.map.activateSketchWidget(false);
        sketchWidget.cancel();
        onCreateCompleteHandler.remove();
        onUpdateCompleteHandler.remove();
        onDeleteCompleteHandler.remove();
        onCreateCompleteHandler = null;
        onUpdateCompleteHandler = null;
        onDeleteCompleteHandler = null;
    }

    /**
     * Synchronises the draft points between the map and the array of draft platforms, potentially updated by the dashboard
     */
    self.syncDraftPtfs = function(){
        var drafts = app.models.draftPtfs;

        if(drafts.length == 0){
            var graphicsToRemove = [];
            for(var i = 0; i < sketchWidget.layer.graphics.length;i++){
                if(sketchWidget.layer.graphics.getItemAt(i).geometry.type == "point"){
                    graphicsToRemove.push(sketchWidget.layer.graphics.getItemAt(i));
                }
            }
            sketchWidget.layer.removeMany(graphicsToRemove);
            countPoints = 0;
        }
        else{
            // Adding/updating drafts
            for(var i = 0; i < drafts.length; i++){
                // Checking if draft exists in GIS, updating if so
                var found = false; 
                var j = 0;
                while(!found && j < sketchWidget.layer.graphics.length){
                    var currentGraphic = sketchWidget.layer.graphics.getItemAt(j);
                    if(currentGraphic){
                        if(currentGraphic.attributes.draftId == drafts[i].draftId){
                            found = true;
                            var newGeom = sketchWidget.layer.graphics.getItemAt(j).geometry.clone();
                            newGeom.latitude = drafts[i].lat;
                            newGeom.longitude = drafts[i].lon;
                            sketchWidget.layer.graphics.getItemAt(j).geometry = newGeom;
                        }
                    }
                    j++;
                }

                // Adding
                if(!found){
                    var geom = webMercatorUtils.geographicToWebMercator({
                        type: "point", 
                        longitude: drafts[i].lon,
                        latitude: drafts[i].lat
                    });
                    var graphic = new Graphic({
                        attributes: {
                            "draftId": drafts[i].draftId
                        },
                        geometry : geom,
                        popupTemplate: {
                            title: "{draftId}"
                        },
                        symbol: sketchWidget.viewModel.pointSymbol 
                    });
                    sketchWidget.layer.add(graphic);
                    countPoints++;
                }
            }

            // Removing outdated drafts
            var graphicsToRemove = [];
            for(var i = 0; i < sketchWidget.layer.graphics.length;i++){
                var elt = drafts.find(item => item.draftId === sketchWidget.layer.graphics.getItemAt(i).attributes.draftId);
                if(!elt){
                    if(sketchWidget.layer.graphics.getItemAt(i).geometry.type == "point"){
                        graphicsToRemove.push(sketchWidget.layer.graphics.getItemAt(i));
                    }
                    countPoints--;
                }
            }
            sketchWidget.layer.removeMany(graphicsToRemove);
        }

        updateDraftHtml(countPoints, countPolyline);
    }

    return self;
});
