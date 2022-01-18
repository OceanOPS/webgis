import { aliasOf, property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import SceneView from "@arcgis/core/views/SceneView";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";
import Config from "../Config";
import ElevationExaggerationViewModel from "./ElevationExaggerationViewModel";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.ElevationExaggeration")
class ElevationExaggeration extends Widget{
    @property()
    viewModel: ElevationExaggerationViewModel = new ElevationExaggerationViewModel();

    @aliasOf("viewModel.view")
    view: ElevationExaggerationViewModel["view"];

    @aliasOf("viewModel.exaggeration")
    exaggeration: ElevationExaggerationViewModel["exaggeration"];

    @aliasOf("viewModel.withElevationInfoLayerIDs")
    withElevationInfoLayerIDs: ElevationExaggerationViewModel["withElevationInfoLayerIDs"];

    constructor(props: {view: SceneView, exaggeration?: number}){
        super();
        this.view = props.view;
        if(typeof(props.exaggeration) != 'undefined'){
            this.exaggeration = props.exaggeration;
        }
        else{
            this.exaggeration = Config.DEFAULT_ELEVATION_EXAGGERATION;
        }
    }
        
    render(){
        return(
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <p>This coefficient will be applied as an exaggeration to the elevation layer (bathymetry)</p>
                <input id='exaggerationCoef' value={this.exaggeration} type='number' min='1' max='100' onchange={this.changeBathyExaggerationCoef} step='1'/>
                &nbsp;
                <label for='exaggerationCoef'>times actual depth</label>
                <br/><br/>
                <button type='button' class="btn btn-primary" onclick={this.viewModel.changeExaggeration}>Apply</button>
            </div>
        );
    }

    /**
     * Changes exaggeration coefficient and regenerates the elevation layer
     * @param coef (number) Exaggeration coefficient
     */
    public changeBathyExaggerationCoef = (evt: any): void =>{
        this.exaggeration = evt.target.value;
    };

}
export default ElevationExaggeration;
