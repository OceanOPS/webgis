import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.AnimationRotate")
class AnimationRotate extends Widget{
    /*
    *   Playing boolean, stores the animation state
    */
    @property()
    playing: boolean = true;
    /*
    *   Speed coefficient applied to the longitude step used to rotate the globe
    */
    @property()
    animationSpeed: number = 0.5;
    /*
    *   Time Interval used for the animation
    */
    private animationTimeInterval = 40;
    /*
    *   Handler on the animation event handler
    */
    private animationHandler: any;
    /*
    *   Reference to the view
    */
    private view: SceneView;
    /**
     * Keyboard listener
     */
    private keyboardListener: any;

    constructor(props?: any){
        super();
        this.view = props.view;
    }

    render(){
        return (
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <span class="esri-icon-collapse"></span>
                <input list="tickmarks" onchange={this.changeSpeed} type='range' min='0.01' max='1' step='0.01'/>
                <datalist id="tickmarks">
                    <option value="0" label="0%"></option>
                    <option value="0.1"></option>
                    <option value="0.2"></option>
                    <option value="0.3"></option>
                    <option value="0.4"></option>
                    <option value="0.5" label="50%"></option>
                    <option value="0.6"></option>
                    <option value="0.7"></option>
                    <option value="0.8"></option>
                    <option value="0.9"></option>
                    <option value="1" label="100%"></option>
                </datalist>
                <span class="esri-icon-expand"></span>
                <br/>
                <input class='btn btn-secondary' onclick={this.pauseAnimation} type='button' value={(this.playing && "Pause animation") || (!this.playing && "Play animation")}/>
            </div>
        );
    }

    postInitialize(){
        this.startAnimationRotate(this.animationSpeed);
        this.keyboardListener = document.addEventListener('keypress', this.pauseAnimationKeyboard);
    }

    destroy(){
        this.stopAnimation();        
        document.removeEventListener('keypress', this.keyboardListener);
        super.destroy();
    }

    
    /*
    *   Animation function
    */
    private animationListener = () => {
        // Clone the camera to modify its properties
        var camera = this.view.camera.clone();
        var long = camera.position.x;
        var newLong = long - 50000 * this.animationSpeed;

        // Set new values for heading and tilt
        camera.position.x = newLong;

        // Set the new properties on the view's camera
        this.view.camera = camera;
    }

    /*
    *   Listener when changing speed
    */
    private changeSpeed = (event: any) => {
        var val = event.target.value;
        this.startAnimationRotate(val);
    };
    /*
    *   Starts the animation
    */
    private startAnimationRotate = (speed: number) =>{
        if(this.animationHandler){
            this.stopAnimation();
        }

        this.animationSpeed = speed;

        this.animationHandler = setInterval(this.animationListener, this.animationTimeInterval);
        this.playing = true;
    };
    /*
    *   Stops the animation
    */
    private stopAnimation = () => {
        this.playing = false;
        window.clearInterval(this.animationHandler);
        this.animationHandler = null;
    };
    /*
    *   Pause/Unpause the animation
    */
    private pauseAnimation = () =>{
        this.playing = !this.playing;
        if(this.playing){
            this.animationHandler = setInterval(this.animationListener, this.animationTimeInterval);
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
}
export default AnimationRotate;