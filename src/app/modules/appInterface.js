define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    var app = null;

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the settings.
    */
    self.init = function(appInstance){
        app = appInstance;
    }

    self.objectsChanged = function(objectRefs, objectType){
        if(!app.appInterface.getEmptyGisSample()){
            app.controllers.map.applyFilterLayers(objectRefs, objectType);
        }
    }

    self.selectionObjectsChanged = function(selectedObjectsRef, featureType){
        if(!featureType){
            featureType = "platform";
        }
        require([
            "app/modules/selectionTool"
        ], function(selectionTool){
            selectionTool.init(app, true);
            selectionTool.applySelectionLayers(selectedObjectsRef, featureType);
        });
    }

    self.sendSelectionToDashboard = function(selectedObjectsRef, featureType){
        if (app.settings.isWebsiteVersion) {
            parent.App.session.selections.set(featureType, selectedObjectsRef, true);
        }
    }

    self.getObjectsRefs = function(featureType){
        var listObjects = [];
        if (app.settings.isWebsiteVersion) {
            ///Get from Dashboard
            if(featureType === app.config.TYPE_PTF || featureType === app.config.TYPE_TRACKLINE){
                listObjects = window.parent.App.session.samples['platform'];
            }
            else if(featureType === app.config.TYPE_OBS){
                listObjects = window.parent.App.session.samples['observation'];
            }
            else if(featureType === app.config.TYPE_CRUISE){
                listObjects = window.parent.App.session.samples['cruise'];
            }
            else if(featureType === app.config.TYPE_LINE){
                listObjects = window.parent.App.session.samples['line'];
            }
            else if(featureType === app.config.TYPE_SITE){
                listObjects = window.parent.App.session.samples['site'];
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

    self.setEmptyGisSample = function(isEmpty){
        try{
            window.parent.App.config.emptyGisSample = isEmpty;
        }
        catch(error){
            return false;
        }
    }
    
    self.getEmptyGisSample = function(){
        try{
            return window.parent.App.config.emptyGisSample;
        }
        catch(error){
            return false;
        }
    }

    self.openCruiseForm = function(wkt){
        if (app.settings.isWebsiteVersion){
            window.parent.openRegisterCruise(wkt);
        }
    }


    self.openPtfForm = function(draftID, wmo, lat, lon, internalId){
        if (app.settings.isWebsiteVersion){
            window.parent.App.utils.submitPtfFromGIS({draftId: draftID, attributes: {wmo: wmo, lat: lat, lon: lon, internalId: internalId}});
        }
    }    


    self.processDraftPtfsFromDashboard = function(arrayOfObjects){
        app.controllers.map.processDraftPtfs(arrayOfObjects);
    }


    // New functions for draft management
    self.addDraftFromGIS = function(lat, lon){
        if (app.settings.isWebsiteVersion){
            return parent.App.modules.ptfDrafts.addDraft(lat, lon);
        }
    }

    self.updateDraftsFromGIS = function(draftsArray){
        if (app.settings.isWebsiteVersion){
            parent.App.modules.ptfDrafts.editDrafts(draftsArray);
        }
    }
    
    self.deleteDraftsFromGIS = function(draftsArray){
        if (app.settings.isWebsiteVersion){
            parent.App.modules.ptfDrafts.deleteDrafts(draftsArray);
        }
    }

    self.showUploader = function(){
        if (app.settings.isWebsiteVersion){
            parent.App.modules.ptfDrafts.showUploader();
        }
    }

    // Calls from dashboard to GIS
    self.displayDrafts = function(draftsArray){
        app.controllers.map.processDraftPtfs(draftsArray);
    }

    self.deleteDrafts = function(draftsArray){
        app.controllers.map.deleteDraftPtfs(draftsArray);
    }

    self.selectDrafts = function(draftsArray){
        app.controllers.map.selectDraftPtfs(draftsArray);
    }


    return self;
});
