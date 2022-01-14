import { aliasOf, property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";
import Utils from "../Utils";
import AnimationWaypointViewModel from "./AnimationWaypointViewModel";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.AnimationWaypoint")
class AnimationWaypoint extends Widget{
    @property()
    viewModel: AnimationWaypointViewModel = new AnimationWaypointViewModel();

    @aliasOf("viewModel.defaultsWaypoints")
    defaultsWaypoints: AnimationWaypointViewModel["defaultsWaypoints"];

    @aliasOf("viewModel.cameraOptions")
    cameraOptions: AnimationWaypointViewModel["cameraOptions"];

    @aliasOf("viewModel.map")
    map: AnimationWaypointViewModel["map"];

    @aliasOf("viewModel.view")
    view: AnimationWaypointViewModel["view"];

    @aliasOf("viewModel.animationWaypoints")
    animationWaypoints: AnimationWaypointViewModel["animationWaypoints"];

    @aliasOf("viewModel.playing")
    playing: AnimationWaypointViewModel["playing"];

    @aliasOf("viewModel.usingDefaults")
    usingDefaults: AnimationWaypointViewModel["usingDefaults"];
    
    @property()
    animationConfirmed: boolean = false;

    /*
    *   Handler on the animation event handler
    */
    private animationHandler: any;
    /*
    *   Time Interval used for the animation
    */
    private animationTimeInterval = 8000;
    /**
     * Keyboard listener
     */
    private keyboardListener: any;

    constructor(props?: any){
        super();
        this.map = props.mapInstance;
        this.view = this.map.mapView as SceneView;
    }

    render(){
        if(this.animationConfirmed){
            return (<div class={this.classes([CSS.base, CSS.customDefault])}>{this.confirmedForm()}</div>);
        }
        else{
            return (<div class={this.classes([CSS.base, CSS.customDefault])}>{this.initialForm()}</div>);
        }
    }

    postInitialize(){
        this.keyboardListener = document.addEventListener('keypress', this.pauseAnimationKeyboard);
        this.startAnimationWaypoint(this.animationWaypoints, this.animationTimeInterval);
    }

    destroy(){
        this.stopAnimation();
        document.removeEventListener('keypress', this.keyboardListener);
        super.destroy();
    }

    /**
     * Returns the initial form
     */
    private initialForm = () => {
        return(
            <form key="initForm">
                <p>
                {
                    (this.usingDefaults && "Using default waypoints") || (!this.usingDefaults && ("Using " + this.animationWaypoints.length + " custom waypoints"))
                }
                </p>
                <hr/>
                <input class='btn btn-info' type='button' value='Use default waypoints' onclick={this.resetDefaults}/>
                <br/>
                <br/>
                <input class='btn btn-info' type='button' value='Add current view to custom list' onclick={this.addWaypoint}/>
                <br/>
                <br/>
                <input class='btn btn-info' type='button' value='View/edit waypoints as JSON' onclick={this.showWaypointsAsJSON}/>
                <hr/>
                <input class='btn btn-secondary' type='button' value={(this.playing && "Pause animation") || (!this.playing && "Play animation")} onclick={this.pauseAnimation}/>
                &nbsp;
                <input class='btn btn-primary' type='button' value='Confirm' onclick={this.confirmAnimation}/>
            </form>
        );
    }

    /**
     * Returns the confirmed animation form
     */
    private confirmedForm = () => {
        return(
            <form key="confirmedForm" >
                <label for='animationWaypointsSpeed'>Display time (s)</label>
                <input class='form-control' type='number' name='animationWaypointsSpeed' onchange={this.changeSpeed} id='animationWaypointsSpeed' min='3' value={(this.animationTimeInterval / 1000) }/>
                <hr/>
                <input class='btn btn-secondary' type='button' value={(this.playing && "Pause animation") || (!this.playing && "Play animation")} onclick={this.pauseAnimation}/>
                &nbsp;
                <input class='btn btn-secondary' type='button' value='Return' onclick={this.resetForm}/>
            </form>
        );
    }

    /*
    *   Changes the popup content and starts the animation
    */
    private resetForm = (event: any) => {
        if(this.map.isImmersiveViewActivated){
            this.map.activateImmersiveView();
        }
        this.animationConfirmed = false;
    };

    /*
    *   Changes the popup content and starts the animation
    */
    private confirmAnimation = (event: any) => {
        this.stopAnimation();
        this.startAnimationWaypoint(this.animationWaypoints, 5000);
        this.playing = true;
        this.animationConfirmed = true;
        if(!this.map.isImmersiveViewActivated){
            this.map.activateImmersiveView();
        }
    };

    /*
    *   Starts the animation
    */
    private startAnimationWaypoint = (iWaypoints: any, timeInterval: number) => {
        if(this.animationHandler){
            this.stopAnimation();
        }

        this.animationWaypoints = iWaypoints;
        this.animationTimeInterval = timeInterval;

        // Moving to the first waypoints
        this.viewModel.moveCamera();

        // Setting timer
        this.animationHandler = setInterval(this.viewModel.moveCamera, this.animationTimeInterval);
        this.playing = true;
    }

    /*
    *   Stops the animation
    */
    private stopAnimation = () => {
        window.clearInterval(this.animationHandler);
        this.playing = false;
        this.animationHandler = null;
    }

    /*
    *   Pause/Unpause the animation
    */
    private pauseAnimation = () =>{
        this.playing = !this.playing;
        if(this.playing){
            this.viewModel.moveCamera();
            this.animationHandler = setInterval(this.viewModel.moveCamera, this.animationTimeInterval);
        }
        else{
            window.clearInterval(this.animationHandler);
        }
    };
    /*
    *   Key listener function to handle space bar pausing
    */
    private pauseAnimationKeyboard = (evt: any) => {
        evt = evt || window.event;
        if(evt.keyCode === 32){
            this.pauseAnimation();
        }
    };
    /*
    *   Reset the animation to default waypoints
    */
    private resetDefaults = (event: any) => {
        this.viewModel.resetDefaults();
        this.pauseAnimation();
    };
    /*
    *   Add a custom waypoints to the current list. If defaults are used, a new set of waypoints is defined, starting with this first custom one.
    */
    private addWaypoint = (event: any) =>{
        this.viewModel.addWaypoint();
    };
    /*
    *   Listener to change the animation speed
    */
    private changeSpeed = (event: any) => {
        // Speed is user-defined in seconds
        this.animationTimeInterval = event.target.value * 1000;
        if(this.playing){
            this.startAnimationWaypoint(this.animationWaypoints, this.animationTimeInterval);
        }
    }
    
    /**
     * Displays a modal allowing the user to edit a JSON representation of the waypoints
     */
    private showWaypointsAsJSON = () => {
        var json = this.viewModel.getWaypointsAsJSON();
        Utils.displayAlert("Waypoints JSON", "Please find below the JSON representation of the waypoints<br>" + 
            "<textarea id='animateWaypointsJSONInput' class='form-control' rows='20'>" + json + "</textarea><br><br>" + 
            "<input class='btn btn-primary' type='button' value='Update' id='animateWaypointsJSONUpdate'/>");
        var elt = document.getElementById('animateWaypointsJSONUpdate');
        if(elt){
            elt.addEventListener("click", () => {
                var eltInput = document.getElementById('animateWaypointsJSONInput') as HTMLInputElement;
                if(eltInput){
                    var json = eltInput.value;
                    this.viewModel.loadWaypointsFromJSON(json);
                }
            });
        }
    }
}
export default AnimationWaypoint;