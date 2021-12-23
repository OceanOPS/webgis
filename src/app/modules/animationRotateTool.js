define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app module
    var app = null;
    /*
    *   Playing boolean, stores the animation state
    */
    var playing = true;
    /*
    *   Time Interval used for the animation
    */
    var animationTimeInterval = 40;
    /*
    *   Speed coefficient applied to the longitude step used to rotate the globe
    */
    var animationSpeed = 0.5;
    /*
    *   Handler on the animation event handler
    */
    var animationHandler = null;
    /*
    *   Animation function
    */
    var animationListener = function(){
        // Clone the camera to modify its properties
        var camera = app.controllers.map.mapView.camera.clone();
        var long = camera.position.x;
        var newLong = long - 50000 * animationSpeed;

        // Set new values for heading and tilt
        camera.position.x = newLong;

        // Set the new properties on the view's camera
        app.controllers.map.mapView.camera = camera;
    }
    /*
    *   Listener when changing speed
    */
    var changeSpeed = function(event){
        var val = event.target.value;
        startAnimationRotate(val);
    };
    /*
    *   Starts the animation
    */
    var startAnimationRotate = function(speed){
        if(animationHandler){
            stopAnimation();
        }

        animationSpeed = speed;

        animationHandler = setInterval(animationListener, animationTimeInterval);
        playing = true;
    };
    /*
    *   Stops the animation
    */
    var stopAnimation = function(){
        playing = false;
        window.clearInterval(animationHandler);
        animationHandler = null;
    };
    /*
    *   Pause/Unpause the animation
    */
    var pauseAnimation = function(event){
        playing = !playing;
        if(playing){
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

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance){
        app = appInstance;
        app.setLoadingEnabled(false);

        var html = "<form class='form-horizontal'>" + 
                "<div class='form-group row'><label for='speedSlider' class='col-sm-4 control-label'>Speed</label><div class='col-sm-8'><input id='speedSlider' type='range' min='0.01' max='1' value='0.5' step='0.01'/></div></div>" +
                "<input class='btn btn-block btn-default' type='button' value='Pause animation' id='animateWaypointsPause'/>" + 
                "</form>";

        // Adding info panel to the UI
        var infoPanelContent = null;
        var toolResultPanelContent = {"title": "Animate", "htmlContent": "<div class='.container'>" + html + "</div>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        startAnimationRotate(0.5);
        document.getElementById('speedSlider').addEventListener("change", changeSpeed);
        document.getElementById('animateWaypointsPause').addEventListener("click", pauseAnimation);
        document.addEventListener('keypress', pauseAnimationKeyboard);

        app.settings.activateAutoHide(true);
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
