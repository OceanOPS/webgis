import "./resources/libs.css"
import "./resources/main.css"
import "./resources/widgets.css"

import $ from "jquery";
import 'bootstrap'

import esriConfig from "@arcgis/core/config.js";
import Settings from "./Settings";
import AppInterface from "./AppInterface";
import GISMap from "./Map";


class App {
    //@todo auto debug based on vite dev/build
    private static readonly debug: boolean = true;
    public static settings: Settings;
    public static controllers: any = {};
    public static models: any = {};

    private static _initialize = ((): void => {
        window["$"] = $; 
        esriConfig.apiKey = "AAPKf6a32120e7cf4d41a162ac6c50fa5967HltTnCUtjomc2AIm9Y7OSlszYv2BO3eGHV2M7i5PBjBt4j1xnRpUGWlUgkaN9McP";
        esriConfig.request.useIdentity = false;
        if(esriConfig.request.trustedServers){
            //esriConfig.request.trustedServers.push("www.jcommops.org", "gis.jcommops.org", "www.ifremer.fr", "www.ocean-ops.org");
        }
        if(this.debug){
            esriConfig.log.level = "info";
        }

        // /!\ The following order of elements instanciation is important
        // Maybe find a better way to load those modules...
        // Settings instance needed by the GISMap constructor... but Map needed by some Settings methods
        App.settings = new Settings();
        App.controllers["map"] = new GISMap(App.settings);
        App.settings.setMap(App.controllers.map);
        
        // If debug, exposing the whole app
        if(this.debug){
            window["debug"] = this.debug;
            window["appli"] = App;
        }
        // Interface for OceanOPS dashboard
        window["GISViewer"] = AppInterface;
    })();

    
    
}

export default App;