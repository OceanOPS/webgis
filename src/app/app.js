define([
    "app/modules/map",
    "app/modules/mapMenu",
    "app/modules/settings",
    "app/modules/config",
    "app/modules/utils",
    "app/modules/appInterface",
    "esri/config"
], function(map, mapMenu, settings, config, utils, appInterface, esriConfig) {
    var app = {};
    var loadingCount = null;
    var loadingEnabled = true;

    app.controllers = {
        map: map,
        mapMenu: mapMenu
    };

    app.settings = settings;
    app.config = config;
    app.utils = utils;
    app.appInterface = appInterface;

    app.models = {
        draftPtfs: [],
        draftCruises: []
    };

    app.init = function() {
        esriConfig.apiKey = "AAPKf6a32120e7cf4d41a162ac6c50fa5967HltTnCUtjomc2AIm9Y7OSlszYv2BO3eGHV2M7i5PBjBt4j1xnRpUGWlUgkaN9McP";

        app.settings.init(app);
        app.utils.init(app);
        app.appInterface.init(app);

        app.controllers.map.init(app);
        if(debug){
            appli = app;
        }
        GISViewer = appInterface;
        esriConfig.request.trustedServers.push("www.jcommops.org", "gis.jcommops.org", "www.ifremer.fr", "www.ocean-ops.org");
    }

    app.addCorsEnabledServer = function(hostname){
        if(esriConfig.request.corsEnabledServers.indexOf(hostname) === -1){
            esriConfig.request.corsEnabledServers.push(hostname);
        }
    }

    app.setMainLoading = function(activated){
        // Checking if loading enabled (or disabled with remaining loader)
        if(activated){
            if(loadingCount){
                loadingCount++;
            }
            else{
                loadingCount = 1;
            }
            if(loadingCount === 1){
                if(loadingEnabled){
                    document.getElementById("main-loader").style.visibility = "visible";
                }
            }
        }
        else{
            if(loadingCount){
                loadingCount--;
                if(loadingCount === 0){
                    document.getElementById("main-loader").style.visibility = "hidden";
                }
            }
            else{
                loadingCount = 0;
                document.getElementById("main-loader").style.visibility = "hidden";
            }
        }
    }

    app.setLoadingEnabled = function(enabled){
        loadingEnabled = enabled;
    }

    app.displayAlert = function(title, content){
        $("#alertModal h4.modal-title").html(title);
        $("#alertModal div.modal-body").html(content);
        $('#alertModal').modal({show: true});
    }

    app.mapLoaded = function(){
        if(!app.settings.isWebsiteVersion){
            $(".esri-ui-corner").css("visibility", "visible");
        }
        else if(!app.appInterface.getEmptyGisSample()){
            $(".esri-ui-corner").css("visibility", "visible");
        }
    }

    $('#footerDrawer .toggle').on('click', function() {
        $('#footerDrawer .content').slideToggle();
    });

    // Now that the app is loaded, we'll add an extra CSS class to the body to hide the loading message. Note that we
    // could also have used `dojo/dom-class` to do this, but for very simple one-off operations like these there is
    // usually no good reason to load an extra module.
    document.body.className += ' loaded';

    // Returning a value from an AMD module means that it becomes the value of the module. In this case, we return
    // the `app` object, which means that other parts of the application that require `app/main` could get a reference
    // to the dialog
    return app;
});
