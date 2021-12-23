define([
    "esri/renderers/support/jsonUtils"
], function(rendererJsonUtils) {
    var settings = {};
    // ========================================================================
    // Private
    // ========================================================================
    var app = null;

    // ========================================================================
    // Public
    // ========================================================================
    // Contains ID of the current projection
    settings.projection;
    // Contains the list of all active layers
    settings.activeLayers = [];
    // Contains current basemap ID
    settings.basemap;
    // Current theme
    settings.theme;
    // Filtering clauses
    settings.filter = null;
    // Platform track mode
    settings.platformTrack = null;
    // Highlighting options
    settings.highlight = null;

    settings.isEmbedded = window.parent && window.parent != window;
    try{
		settings.isWebsiteVersion = settings.isEmbedded && window.parent.document.domain == document.domain;
		settings.emptyGisSample = settings.isWebsiteVersion && window.parent.App.config.emptyGisSample;
	}
	catch(error){
        // If CROSS origin policy violated, setting parameters to false
		settings.isWebsiteVersion = false;
		settings.emptyGisSample = false;
	}

    /*
    *   Timeout defining when the interface fades out
     */
    var interfaceTimeout = 5000;
    var mouseTimeoutHandler = null;
    var mouseMoveListener = function(){
        settings.hideInterface(false, true);
    };

    /*
    *   Initializes the settings.
    */
    settings.init = function(appInstance){
        app = appInstance;
        settings.readFromURL();
    }

    /*
    *   Reads initialization parameters from the URL.
    */
    settings.readFromURL = function() {
        ioQuery = require("dojo/io-query");
        var uri = location.search;
        if (uri) {
            var query = uri.substring(uri.indexOf("?") + 1, uri.length);
            var queryObject = ioQuery.queryToObject(query);

            if (queryObject.projection) {
                settings.projection = queryObject.projection;
            }
            else if (queryObject.system){
                var proj = app.config.projections.find(i => i.number == queryObject.system);
                if(proj){
                    settings.projection = proj.ref;
                }
                else{
                    settings.projection = "102100";
                }
            } else {
                settings.projection = "102100";
            }

            if (queryObject.basemap) {
                settings.basemap = queryObject.basemap;
            } else {
                settings.basemap = "basemapOceansNoLabel";
            }

            if(queryObject.theme){
                settings.theme = queryObject.theme.toLowerCase();
                if(settings.theme === "jcommops" || settings.theme === "all"){
                    settings.theme = app.config.THEME_ALL;
                }
                else if(settings.theme === "oceangliders"){
                    settings.theme = "gliders";
                }
            }
            else{
                if(queryObject.t){
                    settings.theme = queryObject.t.toLowerCase();
                    if(settings.theme === "jcommops" || settings.theme === "all"){
                        settings.theme = app.config.THEME_ALL;
                    }
                    else if(settings.theme === "oceangliders"){
                        settings.theme = "gliders";
                    }
                }
                else{
                    settings.theme = app.config.THEME_ALL;
                }
            }

            if(queryObject.highlight){
                settings.highlight = JSON.parse(queryObject.highlight);
            }

            if(queryObject.platformTrack){
                var ref = queryObject.platformTrack;
                settings.platformTrack = ref;
                sqlClause = "PTF_REF = '" + ref + "'";
                settings.filter = {"platform": sqlClause};
            }
            else{
                if(queryObject.filter){
                    try{
                        settings.filter = JSON.parse(queryObject.filter);
                    }
                    catch(err){
                        
                    }
                }
                else{
                    // Clause for backward compatibility
                    var sqlClause = "1=1";
                    if(queryObject.ptfRefs){
                        var refs = JSON.parse(queryObject.ptfRefs);
                        sqlClause += " AND PTF_REF IN ('" + refs.join("','") + "')";
                    }
                    if(queryObject.ptfCountries){
                        var ptfCountries = JSON.parse(queryObject.ptfCountries);
                        sqlClause += " AND COUNTRY_ISO_CODE2 IN ('" + ptfCountries.join("','") + "')";
                    }
                    if(queryObject.ptfStatuses){
                        var ptfStatuses = JSON.parse(queryObject.ptfStatuses);
                        sqlClause += " AND PTF_STATUS IN ('" + ptfStatuses.join("','") + "')";
                    }
                    if(queryObject.ptfPrograms){
                        var ptfPrograms = JSON.parse(queryObject.ptfPrograms);
                        sqlClause += " AND PROGRAM IN ('" + ptfPrograms.join("','") + "')";
                    }
                    if(queryObject.ptfNetworks){
                        var ptfNetworks = JSON.parse(queryObject.ptfNetworks);
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
                    settings.filter = {"platform": sqlClause};
                }
            }

        } else {
            // Default settings
            settings.projection = "102100";
            settings.basemap = "basemapOceansNoLabel";
            settings.theme = app.config.THEME_ALL;
        }
    };

    /*
    *   Helper function returning a basemap for a given ID from the config file.
    */
    settings.getBasemapFromID = function(basemapWKID){
        var result = null;
        for(var i = 0; i < app.config.basemaps.length; i++){
            if (app.config.basemaps[i].wkid == basemapWKID) {
                result = app.config.basemaps[i].basemap;
            }
        }

        return result;
    }

    /*
    *   Helper function returning a projection for a given ID from the config file.
    */
    settings.getProjectionFromID = function(projectionID){
        var result = null;
        result = app.config.projections.find(x => x.ref === projectionID);

        return result;
    }

    /*
    *   Bridge function setting the basemape.
    */
    settings.setBasemap = function(basemapWkid) {
        settings.basemap = basemapWkid;
        app.controllers.map.setBasemap(settings.getBasemapFromID(basemapWkid));
        settings.changeUrlParam("basemap", basemapWkid);
    };

    /*
    *   Sets the projection in the URL and reloads the page.
    */
    settings.setProjection = function(wkid) {
        settings.projection = wkid;
        settings.changeUrlParam("projection", wkid);
        if(settings.isWebsiteVersion){
            parent.App.utils.setBackgroundMapProjectionParamInPermalink(wkid);
        }
        // Saving layers' visibility
        settings.saveLayersVisibilityToSessionStorage();
        // Saving layers' state
        settings.saveAllLayersToSessionStorage();

        location.reload();
    };

    /**
    *   Change the history state and sets the parameters in the URL.
    */
    settings.changeUrlParam = function(param, value) {
        var stateObj = {
            theme: settings.theme,
            projection: settings.projection,
            basemap: settings.basemap,
            layers: JSON.stringify(settings.activeLayers)
        }

        history.pushState(stateObj, "", "?" + $.param(stateObj));
    };

    /**
    *   Saves the work layer definition to the local storage
    */
    settings.saveWorkLayerToLocalStorage = function(newId, sourceLayerId, layerName, renderer, definitionExpression){
        if(localStorage){
            var workLayers = localStorage.getItem("workLayers");
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
    settings.updateWorkLayerToLocalStorage = function(id, layerName, renderer, definitionExpression){
        if(localStorage){
            var workLayers = localStorage.getItem("workLayers");
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
    settings.restoreWorkLayersFromLocalStorage = function(){
        try{
            if(localStorage){
                var workLayers = localStorage.getItem("workLayers");
                if(workLayers){
                    workLayers = JSON.parse(workLayers);
                    for(var id in workLayers){
                        var layer = workLayers[id];
                        var visible = settings.getLayerVisibilityFromSessionStorage(id);
                        if(typeof(visible) === 'undefined'){
                            visible = false;
                        }
                        app.controllers.map.addWorkLayer(id, layer.sourceLayerId, layer.name, rendererJsonUtils.fromJSON(layer.renderer), layer.definitionExpression, visible);
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
    settings.removeWorkLayerFromLocalStorage = function(id){
        if(localStorage){
            var workLayers = localStorage.getItem("workLayers");
            if(workLayers){
                workLayers = JSON.parse(workLayers);
                delete workLayers[id];
                localStorage.setItem("workLayers", JSON.stringify(workLayers));
            }

            settings.removeLayerVisibilityFromSessionStorage(id);
        }
    };

    /**
    *   Saves all the layers definition to the session storage
    */
    settings.saveAllLayersToSessionStorage = function(){
        for(var i = 0; i < app.controllers.map.addedLayerIds.length; i++){
            var group;
            var layer = app.controllers.map.mapView.map.findLayerById(app.controllers.map.addedLayerIds[i]);

            // Testing layer category
            if(app.config.operationalLayers.map(l => l.id).includes(layer.id)){
                group = "operationalLayers";
            }
            else if(app.config.dynamicLayers.map(l => l.id).includes(layer.id)){
                group = "otherLayers";
            }

            settings.saveLayerToSessionStorage(layer.id, layer.renderer, layer.definitionExpression, group);
        }
    };

    /**
    *   Saves the layer definition to the session storage
    */
    settings.saveLayerToSessionStorage = function(id, renderer, definitionExpression, group){
        if(sessionStorage){
            var layers = sessionStorage.getItem(group);
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
    settings.updateLayerToSessionStorage = function(id, renderer, definitionExpression, group){
        if(sessionStorage){
            var layers = sessionStorage.getItem(group);
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
    settings.restoreLayersFromSessionStorage = function(group){
            try{
                if(sessionStorage){
                    var layers = sessionStorage.getItem(group);
                    if(layers){
                        layers = JSON.parse(layers);
                        for(var id in layers){
                            var layer = layers[id];
                            var visible = settings.getLayerVisibilityFromSessionStorage(id);
                            if(typeof(visible) === 'undefined'){
                                visible = true;
                            }
                            
                            if(group == "operationalLayers"){
                                var layerTheme = app.config.operationalLayers.find(elt => elt.id == id).theme;
                                if(layerTheme == settings.theme){
                                    app.controllers.map.addLayer(id, visible, layer.definitionExpression, rendererJsonUtils.fromJSON(layer.renderer));
                                }
                            }
                            else{
                                app.controllers.map.addLayer(id, visible, layer.definitionExpression, rendererJsonUtils.fromJSON(layer.renderer));
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
    settings.removeLayerFromSessionStorage = function(id, group){
        if(sessionStorage){
            var layers = sessionStorage.getItem(group);
            if(layers){
                layers = JSON.parse(layers);
                delete layers[id];
                sessionStorage.setItem(group, JSON.stringify(layers));
            }

            settings.removeLayerVisibilityFromSessionStorage(id);
        }
    };

    /**
    *   Saves all layers visibility to the Session storage.
    */
    settings.saveLayersVisibilityToSessionStorage = function(){
        for(var i = 0; i < app.controllers.map.addedLayerIds.length; i++){
            var layer = app.controllers.map.mapView.map.findLayerById(app.controllers.map.addedLayerIds[i]);
            settings.updateLayerVisibilityToSessionStorage(layer.id, layer.visible);
        }
    };

    /**
    *   Updates the layer visibility in the Session storage.
    */
    settings.updateLayerVisibilityToSessionStorage = function(id, visible){
        if(sessionStorage){
            var visibility = sessionStorage.getItem("layersVisibility");
            if(!visibility){
                visibility = {};
            }
            else{
                visibility = JSON.parse(visibility);
            }
            var layer = app.controllers.map.mapView.map.findLayerById(id);
            if(layer.allSublayers && layer.allSublayers.length > 0){
                var subvisibility = {};
                for(var i = 0 ; i<layer.allSublayers.length ; i++){
                    subvisibility[layer.allSublayers.items[i].id] = layer.allSublayers.items[i].visible;
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
    settings.removeLayerVisibilityFromSessionStorage = function(id){
        if(sessionStorage){
            var visibility = sessionStorage.getItem("layersVisibility");
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
    settings.getLayersVisibilityFromSessionStorage = function(){
        var result = null;
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
    settings.getLayerRendererFromSessionStorage = function(id){
        var renderer = null;
        try{
            if(sessionStorage){
                var layers = sessionStorage.getItem("operationalLayers");
                if(layers){
                    layers = JSON.parse(layers);
                    var layer = layers[id];
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
    settings.getLayerVisibilityFromSessionStorage = function(id){
        var visible;
        var layers = settings.getLayersVisibilityFromSessionStorage();
        if(layers.hasOwnProperty(id)){
            visible = layers[id];
        }
        
        return visible;
    };


    /**
     * Hides the interface
     */
    settings.hideInterface = function(enabled, restart){
        var uiCorner = document.getElementsByClassName("esri-ui-corner");
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
            clearTimeout(mouseTimeoutHandler);
            if(restart){
                mouseTimeoutHandler = setTimeout(function(){
                    settings.hideInterface(true);
                }, interfaceTimeout);
            }
        }
    }

    settings.activateAutoHide = function(enabled){
        if(enabled){
            mouseTimeoutHandler = setTimeout(function(){
                settings.hideInterface(true);
            }, interfaceTimeout);
            document.addEventListener('mousemove', mouseMoveListener);
        }
        else{
            document.removeEventListener('mousemove', mouseMoveListener);
            settings.hideInterface(false, false);
        }
    }

    return settings;
});
