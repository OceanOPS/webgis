import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SceneView from "@arcgis/core/views/SceneView";
import Config from "../Config";
import DataDisplay from "../DataDisplay";
import GISMap from "../Map";
import SensorDisplay from "../SensorDisplay";

@subclass("esri.widgets.AnimationWaypointViewModel")
class AnimationWaypointViewModel extends Accessor{    
    /*
    *   Defaults are : Pacific, North Atlantic, South Atlantic, Indian, Arctic, Antarctic
    */
    private readonly defaultsWaypoints = [{x:-16875160.96978012, y:-1577014.508841366,z:25512562.377709474, heading: 0, tilt: 0}, 
        {x:-3362745.622155824,y:4001390.6247548247,z:15304641.42227937, heading: 0, tilt: 0}, 
        {x:-1638265.3552148296,y:-3068658.688164285,z:15304641.42227937, heading: 0, tilt: 0}, 
        {x:8498687.306306154,y:-959461.3010839195,z:15304048.644284151, heading: 0, tilt: 0}, 
        {x:19873970.441680975,y:21758937.30954646,z:9179692.239943344, heading: 0, tilt: 0}, 
        {x:9442854.998509483,y:-21594284.543054078,z:15307373.674849331, heading: 0, tilt: 0}];
    /*
    *   Current index of the waypoints loop
    */
    private animationCurrentWaypointIndex = 0;

    /**
     * Panning options
     */
    @property()
    cameraOptions: any = {duration: 2000};

    /*
    *   Reference to the GISMap
    */
    @property()
    map: GISMap;
    
    /**
     * Reference to the view
     */
    view: SceneView;

    /*
    *   Cloning defaults
    */
    @property()
    animationWaypoints: any = this.defaultsWaypoints.slice(0);
    
    /*
    *   Playing boolean, stores the animation state
    */
    @property()
    playing: boolean = true;

    /*
    *   Stores and indicates whether defaults are used or not
    */
    @property()
    usingDefaults = true;

    constructor(props?: any){
        super();
    }

    
    /*
    *   Reset the animation to default waypoints
    */
    resetDefaults = () => {
        this.animationWaypoints = this.defaultsWaypoints.slice(0);
        this.usingDefaults = true;
    };

    
    /*
    *   Add a custom waypoints to the current list. If defaults are used, a new set of waypoints is defined, starting with this first custom one.
    */
    addWaypoint = () =>{
        if(this.usingDefaults){
            this.animationWaypoints = [];
            this.animationCurrentWaypointIndex = 0;
            this.usingDefaults = false;
        }

        this.animationWaypoints.push({
            x: this.view.camera.position.x,
            y: this.view.camera.position.y,
            z: this.view.camera.position.z,
            tilt: this.view.camera.tilt,
            heading: this.view.camera.heading
        });
    };

    /**
     * Outputs waypoints as JSON
     */
    getWaypointsAsJSON = () => {
        return JSON.stringify(this.animationWaypoints);
    }

    
    /**
     * Loads waypoints from a JSON input
     */
    loadWaypointsFromJSON = (json: string) => {
        var wp = JSON.parse(json);
        this.animationWaypoints = wp;
        this.animationCurrentWaypointIndex = 0;
        this.usingDefaults = false;
    }

    /*
    *   Animation function
    */
    moveCamera = () => {
        // Clone the camera to modify its properties
        var camera;
        var currentWaypoint = this.animationWaypoints[this.animationCurrentWaypointIndex];
        this.view.popup.close();
        if(currentWaypoint.emptyWorkLayers){            
            this.map.removeAllWorkLayers();
        }
        if(currentWaypoint.objectRef && currentWaypoint.layerId){
            var layer = this.view.map.findLayerById(currentWaypoint.layerId);
            var layerConfig = Config.operationalLayers.find(l => l.id === currentWaypoint.layerId);
            if(layer && layer instanceof FeatureLayer && layerConfig){
                var query = layer.createQuery();
                if(layerConfig.idField != "ID" && layerConfig.idField != "OBJECTID"){
                    query.where = layerConfig.idField + " = '" + currentWaypoint.objectRef + "'";
                }
                else{
                    query.where = layerConfig.idField + " = " + currentWaypoint.objectRef + "";
                }
                this.view.whenLayerView(layer).then((layerView) => {
                    layerView.queryFeatures(query).then((results) => {
                        var zoom: number | null = 10;
                        var tilt = 40;
                        if(results.features[0].geometry.type == "polygon" || results.features[0].geometry.type == "polyline"){
                            zoom = null;
                            tilt = 20;
                        }
                        camera = {target: results.features, zoom: zoom, tilt: tilt};
                        this.nextWaypointIndex();
                        // Opens the popup
                        this.view.popup.dockEnabled = true;
                        this.view.popup.open({
                            features: results.features
                        });
                        // Set the new properties on the view's camera
                        this.view.goTo(camera, this.cameraOptions);
                    }).catch((e) => {
                        this.nextWaypointIndex();
                    });
                });
            }
        }
        else if(currentWaypoint.action && currentWaypoint.action == "argo-data-display"){
                var dataDisplay = new DataDisplay({map: this.map});
                dataDisplay.displayDataArgo(currentWaypoint.objectRef, "SEA TEMPERATURE");
                
                this.nextWaypointIndex();
        }
        else if(currentWaypoint.action && currentWaypoint.action == "argo-track-display"){
            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === "argo" && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                this.map.showTrackline(fLayerTrackline, currentWaypoint.objectRef);
            }
            
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "argo" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }

            this.nextWaypointIndex();
        }
        else if(currentWaypoint.action && currentWaypoint.action == "os-sensor-display"){ 
            var sensorDisplay = new SensorDisplay({map: this.map});
            sensorDisplay.displaySensorsOceanSITES(currentWaypoint.objectRef);
            this.nextWaypointIndex();
        }
        else if(currentWaypoint.action && currentWaypoint.action == "dbcp-track-display"){
            var fLayerTrackline = Config.operationalLayers.find(x => x.theme === "dbcp" && x.type === Config.TYPE_TRACKLINE);
            if(fLayerTrackline){
                this.map.showTrackline(fLayerTrackline, currentWaypoint.objectRef);
            }
            
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "dbcp" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }

            this.nextWaypointIndex();
        }
        else if(currentWaypoint.action && currentWaypoint.action == "sot-track-display"){
            // Show observations SOT PTF
            var fLayerObs = Config.operationalLayers.find(x => x.theme === "sot" && x.type === Config.TYPE_OBS_PTF);
            if(fLayerObs){
                this.map.showObservations(fLayerObs, currentWaypoint.objectRef);
            }
            
            this.nextWaypointIndex();
        }
        else if(currentWaypoint.action && currentWaypoint.action == "empty-worklayers"){
            this.map.removeAllWorkLayers();
            
            this.nextWaypointIndex();
        }
        else{
            camera = this.view.camera.clone();
            // Set new values
            camera.position.x = currentWaypoint.x;
            camera.position.y = currentWaypoint.y;
            camera.position.z = currentWaypoint.z;
            camera.heading = currentWaypoint.heading;
            camera.tilt = currentWaypoint.tilt;

            this.nextWaypointIndex();
            // Set the new properties on the view's camera
            this.view.goTo(camera, this.cameraOptions);
        }

    };

    private nextWaypointIndex = () => {
        // Increment index
        this.animationCurrentWaypointIndex++;
        if(this.animationCurrentWaypointIndex == this.animationWaypoints.length){
            this.animationCurrentWaypointIndex = 0;
        }
    }
}
export default AnimationWaypointViewModel;