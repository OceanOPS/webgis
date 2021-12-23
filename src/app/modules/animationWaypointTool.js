define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app module
    var app = null;
    /*
    *   Defaults are : Pacific, North Atlantic, South Atlantic, Indian, Arctic, Antarctic
    */
    var defaultsWaypoints = [{x:-16875160.96978012, y:-1577014.508841366,z:25512562.377709474, heading: 0, tilt: 0}, 
    {x:-3362745.622155824,y:4001390.6247548247,z:15304641.42227937, heading: 0, tilt: 0}, 
    {x:-1638265.3552148296,y:-3068658.688164285,z:15304641.42227937, heading: 0, tilt: 0}, 
    {x:8498687.306306154,y:-959461.3010839195,z:15304048.644284151, heading: 0, tilt: 0}, 
    {x:19873970.441680975,y:21758937.30954646,z:9179692.239943344, heading: 0, tilt: 0}, 
    {x:9442854.998509483,y:-21594284.543054078,z:15307373.674849331, heading: 0, tilt: 0}];
    /**
     * Panning options
     */
    var cameraOptions = {duration: 2000};
    /*
    *   Cloning defaults
    */
    var animationWaypoints = defaultsWaypoints.slice(0);
    /*
    *   Playing boolean, stores the animation state
    */
    var playing = true;
    /*
    *   Stores and indicates whether defaults are used or not
    */
    var usingDefaults = true;
    /*
    *   Handler on the animation event handler
    */
    var animationHandler = null;
    /*
    *   Animation function
    */
    var animationListener = function(){
        // Clone the camera to modify its properties
        var camera;
        var currentWaypoint = animationWaypoints[animationCurrentWaypointIndex];
        app.controllers.map.mapView.popup.close();
        if(currentWaypoint.emptyWorkLayers){            
            app.controllers.map.removeAllWorkLayers();
        }
        if(currentWaypoint.objectRef && currentWaypoint.layerId){
            var layer = app.controllers.map.mapView.map.findLayerById(currentWaypoint.layerId);
            var layerConfig = app.config.operationalLayers.find(l => l.id === currentWaypoint.layerId);
            if(layer){
                var query = layer.createQuery();
                if(layerConfig.idField != "ID" && layerConfig.idField != "OBJECTID"){
                    query.where = layerConfig.idField + " = '" + currentWaypoint.objectRef + "'";
                }
                else{
                    query.where = layerConfig.idField + " = " + currentWaypoint.objectRef + "";
                }
                //var layerView = app.controllers.map.mapView.allLayerViews.find(v => v.layer.id === layer.id);
                app.controllers.map.mapView.whenLayerView(layer).then(function(layerView){
                    layerView.queryFeatures(query).then(function(results){
                        var zoom = 10;
                        var tilt = 40;
                        if(results.features[0].geometry.type == "polygon" || results.features[0].geometry.type == "polyline"){
                            zoom = null;
                            tilt = 20;
                        }
                        camera = {target: results.features, zoom: zoom, tilt: tilt};
                        // Increment index
                        animationCurrentWaypointIndex++;
                        if(animationCurrentWaypointIndex == animationWaypoints.length){
                            animationCurrentWaypointIndex = 0;
                        }
                        // Opens the popup
                        app.controllers.map.mapView.popup.dockEnabled = true;
                        app.controllers.map.mapView.popup.open({
                            features: results.features
                        });
                        // Set the new properties on the view's camera
                        app.controllers.map.mapView.goTo(camera, cameraOptions);
                    }).otherwise(function(e){
                        // Increment index
                        animationCurrentWaypointIndex++;
                        if(animationCurrentWaypointIndex == animationWaypoints.length){
                            animationCurrentWaypointIndex = 0;
                        }
                    });
                });
            }
        }
        else if(currentWaypoint.action && currentWaypoint.action == "argo-data-display"){
            require([
                "app/modules/dataDisplay"
            ], function(dataDisplay){
                dataDisplay.init(app);
                dataDisplay.displayDataArgo(currentWaypoint.objectRef, "SEA TEMPERATURE");
                
                // Increment index
                animationCurrentWaypointIndex++;
                if(animationCurrentWaypointIndex == animationWaypoints.length){
                    animationCurrentWaypointIndex = 0;
                }
            });
        }
        else if(currentWaypoint.action && currentWaypoint.action == "argo-track-display"){
            var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === "argo" && x.type === app.config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                app.controllers.map.showTrackline(fLayerTrackline, currentWaypoint.objectRef);
            }
            
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "argo" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                app.controllers.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }

            // Increment index
            animationCurrentWaypointIndex++;
            if(animationCurrentWaypointIndex == animationWaypoints.length){
                animationCurrentWaypointIndex = 0;
            }
        }
        else if(currentWaypoint.action && currentWaypoint.action == "os-sensor-display"){
            require([
                "app/modules/sensorDisplay"
            ], function(sensorDisplay){
                sensorDisplay.init(app);
                sensorDisplay.displaySensorsOceanSITES(currentWaypoint.objectRef);  
                // Increment index
                animationCurrentWaypointIndex++;
                if(animationCurrentWaypointIndex == animationWaypoints.length){
                    animationCurrentWaypointIndex = 0;
                }                  
            });
        }
        else if(currentWaypoint.action && currentWaypoint.action == "dbcp-track-display"){
            var fLayerTrackline = app.config.operationalLayers.find(x => x.theme === "dbcp" && x.type === app.config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                app.controllers.map.showTrackline(fLayerTrackline, currentWaypoint.objectRef);
            }
            
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "dbcp" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                app.controllers.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }

            // Increment index
            animationCurrentWaypointIndex++;
            if(animationCurrentWaypointIndex == animationWaypoints.length){
                animationCurrentWaypointIndex = 0;
            }
        }
        else if(currentWaypoint.action && currentWaypoint.action == "sot-track-display"){
            // Show observations SOT PTF
            var fLayerObs = app.config.operationalLayers.find(x => x.theme === "sot" && x.type === app.config.TYPE_OBS_PTF);
            if(fLayerObs){
                app.controllers.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }
            
            // Increment index
            animationCurrentWaypointIndex++;
            if(animationCurrentWaypointIndex == animationWaypoints.length){
                animationCurrentWaypointIndex = 0;
            }
        }
        else if(currentWaypoint.action && currentWaypoint.action == "empty-worklayers"){
            app.controllers.map.removeAllWorkLayers();
            
            // Increment index
            animationCurrentWaypointIndex++;
            if(animationCurrentWaypointIndex == animationWaypoints.length){
                animationCurrentWaypointIndex = 0;
            }
        }
        else{
            camera = app.controllers.map.mapView.camera.clone();
            // Set new values
            camera.position.x = currentWaypoint.x;
            camera.position.y = currentWaypoint.y;
            camera.position.z = currentWaypoint.z;
            camera.heading = currentWaypoint.heading;
            camera.tilt = currentWaypoint.tilt;

            // Increment index
            animationCurrentWaypointIndex++;
            if(animationCurrentWaypointIndex == animationWaypoints.length){
                animationCurrentWaypointIndex = 0;
            }
            // Set the new properties on the view's camera
            app.controllers.map.mapView.goTo(camera, cameraOptions);
        }

    };
    /*
    *   Time Interval used for the animation
    */
    var animationTimeInterval = 8000;
    /*
    *   Current index of the waypoints loop
    */
    var animationCurrentWaypointIndex = 0;
    /*
    *   Pause/Unpause the animation
    */
    var pauseAnimation = function(event){
        playing = !playing;
        if(playing){
            animationListener();
            animationHandler = setInterval(animationListener, animationTimeInterval);
            document.getElementById('animateWaypointsPause').value = "Pause animation";
        }
        else{
            window.clearInterval(animationHandler);
            document.getElementById('animateWaypointsPause').value = "Play animation";
        }
    };
    /*
    *   Key listener function to handle space bar pausing
    */
    var pauseAnimationKeyboard = function(evt) {
        evt = evt || window.event;
        if(evt.keyCode === 32){
            pauseAnimation();
        }
    };
    /*
    *   Reset the animation to default waypoints
    */
    var resetDefaults = function(event){
        animationWaypoints = defaultsWaypoints;
        usingDefaults = true;
        document.getElementById('animateWaypointsLabel').innerHTML = "Using default waypoints";
        pauseAnimation();
    };
    /*
    *   Add a custom waypoints to the current list. If defaults are used, a new set of waypoints is defined, starting with this first custom one.
    */
    var addWaypoint = function(event){
        if(usingDefaults){
            animationWaypoints = [];
            animationCurrentWaypointIndex = 0;
            usingDefaults = false;
        }

        animationWaypoints.push({
            x: app.controllers.map.mapView.camera.position.x,
            y: app.controllers.map.mapView.camera.position.y,
            z: app.controllers.map.mapView.camera.position.z,
            tilt: app.controllers.map.mapView.camera.tilt,
            heading: app.controllers.map.mapView.camera.heading
        });

        document.getElementById('animateWaypointsLabel').innerHTML = "Using " + animationWaypoints.length + " custom waypoints";
    };
    /*
    *   Listener to change the animation speed
    */
    var changeSpeed = function(event){
        // Speed is user-defined in seconds
        animationTimeInterval = event.target.value * 1000;
        if(playing){
            startAnimationWaypoint(animationWaypoints, animationTimeInterval);
        }
    }
    /*
    *   Changes the popup content and starts the animation
    */
    var confirmAnimation = function(event){

        var html = "<form>" + 
                "<label for='animationWaypointsSpeed'>Display time (s)</label><input class='form-control' type='number' name='animationWaypointsSpeed' id='animationWaypointsSpeed' min='3' value='" + (animationTimeInterval / 1000) + "'/>" +
                "<hr>" +
                "<input class='btn btn-block btn-default' type='button' value='Pause animation' id='animateWaypointsPause'/>" + 
                "<input class='btn btn-block btn-default' type='button' value='Return' id='animateWaypointsReturn'/>" + 
                "</form>";

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Animate - Waypoints", "htmlContent": "<div class='.container'>" + html + "</div>"};

        app.controllers.map.setToolPanels(infoPanelContent, toolResultPanelContent);

        stopAnimation();
        playing = true;
        startAnimationWaypoint(animationWaypoints, 5000);

        document.getElementById('animationWaypointsSpeed').addEventListener("change", changeSpeed);
        document.getElementById('animateWaypointsPause').addEventListener("click", pauseAnimation);
        document.getElementById('animateWaypointsReturn').addEventListener("click", initialForm);
        document.addEventListener('keypress', pauseAnimationKeyboard);
        app.settings.activateAutoHide(true);
    };

    /**
     * Reset the form to the initial form
     */
    var initialForm = function(){
        var html = "<form>" + 
                "<label id='animateWaypointsLabel'>" + (usingDefaults ? "Using default waypoints" : ("Using " + animationWaypoints.length + " custom waypoints")) + "</label>" +
                "<input class='btn btn-block btn-default' type='button' value='Pause animation' id='animateWaypointsPause'/>" + 
                "<hr>" +
                "<input class='btn btn-block btn-info' type='button' value='Use default waypoints' id='animateWaypointsDefault'/>" +
                "<input class='btn btn-block btn-info' type='button' value='Add current view to custom list' id='animateWaypointsAddCustom'/>" +
                "<input class='btn btn-block btn-info' type='button' value='View/edit waypoints as JSON' id='animateWaypointsGetLoadJSON'/>" +
                "<hr>" +
                "<input class='btn btn-block btn-default' type='button' value='Confirm' id='animateWaypointsSubmit'/>" +
                "</form>";

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Animate - Waypoints", "htmlContent": "<div class='.container'>" + html + "</div>"};

        app.controllers.map.setToolPanels(infoPanelContent, toolResultPanelContent);
        
        document.getElementById('animateWaypointsPause').addEventListener("click", pauseAnimation);
        document.getElementById('animateWaypointsDefault').addEventListener("click", resetDefaults);
        document.getElementById('animateWaypointsAddCustom').addEventListener("click", addWaypoint);
        document.getElementById('animateWaypointsSubmit').addEventListener("click", confirmAnimation);
        document.getElementById('animateWaypointsGetLoadJSON').addEventListener("click", showWaypointsAsJSON);
    }

    /*
    *   Starts the animation
    */
    var startAnimationWaypoint = function(iWaypoints, timeInterval){
        if(animationHandler){
            stopAnimation();
        }

        animationWaypoints = iWaypoints;
        animationTimeInterval = timeInterval;

        // Moving to the first waypoints
        animationListener();

        // Setting timer
        animationHandler = setInterval(animationListener, animationTimeInterval);
        playing = true;
    }

    /*
    *   Stops the animation
    */
    var stopAnimation = function(){
        window.clearInterval(animationHandler);
        playing = false;
        animationHandler = null;
    }

    
    /**
     * Outputs waypoints as JSON
     */
    var getWaypointsAsJSON = function(){
        return JSON.stringify(animationWaypoints);
    }

    /**
     * Loads waypoints from a JSON input
     */
    var loadWaypointsFromJSON = function(json){
        var wp = JSON.parse(json);
        animationWaypoints = wp;
        animationCurrentWaypointIndex = 0;
        
        document.getElementById('animateWaypointsLabel').innerHTML = "Using " + animationWaypoints.length + " custom waypoints";
        usingDefaults = false;
    }

    var showWaypointsAsJSON = function(){
        var json = getWaypointsAsJSON();
        app.displayAlert("Waypoints JSON", "Please find below the JSON representation of the waypoints<br>" + "<textarea id='animateWaypointsJSONInput' class='form-control' rows='20'>" + json + "</textarea><br><br>" + "<input class='btn btn-block btn-default' type='button' value='Update' id='animateWaypointsJSONUpdate'/>");
        
        document.getElementById('animateWaypointsJSONUpdate').addEventListener("click", function(){
            var json = document.getElementById('animateWaypointsJSONInput').value;
            loadWaypointsFromJSON(json);
        });
    }

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance){
        app = appInstance;
        app.setLoadingEnabled(false);

        var html = "<form>" + 
                "<label id='animateWaypointsLabel'>" + (usingDefaults ? "Using default waypoints" : ("Using " + animationWaypoints.length + " custom waypoints")) + "</label>" +
                "<input class='btn btn-block btn-default' type='button' value='Pause animation' id='animateWaypointsPause'/>" + 
                "<hr>" +
                "<input class='btn btn-block btn-info' type='button' value='Use default waypoints' id='animateWaypointsDefault'/>" +
                "<input class='btn btn-block btn-info' type='button' value='Add current view to custom list' id='animateWaypointsAddCustom'/>" +
                "<input class='btn btn-block btn-info' type='button' value='View/edit waypoints as JSON' id='animateWaypointsGetLoadJSON'/>" +
                "<hr>" +
                "<input class='btn btn-block btn-default' type='button' value='Confirm' id='animateWaypointsSubmit'/>" +
                "</form>";

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Animate - Waypoints", "htmlContent": "<div class='.container'>" + html + "</div>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        
        document.getElementById('animateWaypointsPause').addEventListener("click", pauseAnimation);
        document.getElementById('animateWaypointsDefault').addEventListener("click", resetDefaults);
        document.getElementById('animateWaypointsAddCustom').addEventListener("click", addWaypoint);
        document.getElementById('animateWaypointsSubmit').addEventListener("click", confirmAnimation);
        document.getElementById('animateWaypointsGetLoadJSON').addEventListener("click", showWaypointsAsJSON);

        startAnimationWaypoint(animationWaypoints, animationTimeInterval);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        stopAnimation();
        document.removeEventListener('keypress', pauseAnimationKeyboard);
        app.setLoadingEnabled(true);
        app.settings.activateAutoHide(false);
    }

    return self;
});
