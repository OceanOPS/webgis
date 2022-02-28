import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";

import Widget from "@arcgis/core/widgets/Widget";
import PinLayerViewModel from "./PinLayerViewModel";

import { tsx } from "@arcgis/core/widgets/support/widget";
import SceneView from "@arcgis/core/views/SceneView";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GISMap from "../Map";

const CSS = {
  base: "esri-widget",
  customDefault: "custom-widget-default"
};

@subclass("esri.widgets.PinLayer")
class PinLayer extends Widget {
    @aliasOf("viewModel.map")
    map: PinLayerViewModel["map"];

    @aliasOf("viewModel.layer")
    layer: PinLayerViewModel["layer"];

    @aliasOf("viewModel.useGivenLayer")
    useGivenLayer: PinLayerViewModel["useGivenLayer"];

    @property()
    viewModel: PinLayerViewModel = new PinLayerViewModel();

    @property()
    toClose: boolean = false;
    
    constructor(params: {map: GISMap, layer: FeatureLayer, useGivenLayer: boolean}) {
        super();
        this.map = params.map;
        this.layer = params.layer;
        this.useGivenLayer = params.useGivenLayer;
    }

    private _pinLayer = (event: Event): void => {
        var input = event.currentTarget as HTMLFormElement;
        if(input){
            var formFields = input.form.elements;
            this.viewModel.pinLayer(formFields);
            this.toClose = true;
        }
        else{
            console.error(event);
        }
    }
    

    render() {
        return (<div class={this.classes([CSS.base, CSS.customDefault])}><div class='.container'>{this._getHtmlForm(this.layer.geometryType)}</div></div>);
    }

    private _getSymbolList(geometryType: string){
        if(geometryType === "point" || geometryType === "multipoint"){
            return (
            <select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>
                <option value='circle'>Circle</option>
                <option value='cross'>Cross</option>
                <option value='diamond'>Diamond</option>
                <option value='square'>Square</option>
                <option value='x'>X</option>
            </select>
            );
        }
        else if(geometryType === "polyline"){
            return (
            <select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>
                <option value='solid'>Solid</option>
                <option value='dash'>Dash</option>
                <option value='dash-dot'>Dash Dot</option>
                <option value='dot'>Dot</option>
                <option value='long-dash'>Long dash</option>
                <option value='long-dash-dot'>Long dash dot</option>
                <option value='long-dash-dot-dot'>Long dash dot dot</option>
                <option value='short-dash'>Short dash</option>
                <option value='short-dash-dot'>Short dash dot</option>
                <option value='short-dash-dot-dot'>Short dash dot dot</option>
                <option value='short-dot'>Short dot</option>
            </select>
            );
        }
        else if(geometryType === "polygon"){
            return (
            <select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>
                <option value='backward-diagonal'>Backward diagonal</option>
                <option value='cross'>Cross</option>
                <option value='diagonal-cross'>Diagonal cross</option>
                <option value='forward-diagonal'>Forward diagonal</option>
                <option value='horizontal'>Horizontal</option>
                <option value='solid'>Solid</option>
                <option value='vertical'>Vertical</option>
            </select>
            );
        }
        else if(!geometryType){
            return (
            <select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>
                <option value='circle'>Circle</option>
                <option value='cross'>Cross</option>
                <option value='diamond'>Diamond</option>
                <option value='square'>Square</option>
                <option value='x'>X</option>
            </select>
            );
        }
    }

    private _getHtmlForm(geometryType: string){        
        if(geometryType === "point" || geometryType === "multipoint"){
            return (
            <form class="px-1 py-1">
                <input class='form-control' type='text' placeholder='New name' id='layerNameToSave' name='layerNameToSave' maxlength='40'/>
                <hr/>
                <div class='row mb-3'>                    
                    <div class='col'>
                        <label for='layerStyleToSave' class='form-label'>Style</label>{this._getSymbolList(geometryType)}
                    </div>
                    <div class='col'>
                        <label for='layerSizeToSave' class='form-label'>Size</label>
                        <input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/>
                    </div>
                </div>
                <div class='row mb-3'>                    
                    <div class='col'>
                        <label for='layerColorToSave' class='form-label'>Color</label>
                        <input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/>
                    </div>
                    <div class='col form-check'>
                        <input type='checkbox' class='form-check-input' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>
                        <label class='form-check-label'>No color</label>
                    </div>
                </div>
                <div class='row'>
                    <div class='col'>
                        <label for='layerOutlineToSave' class='form-label'>Outline</label>
                        <input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/>
                    </div>
                    <div class='col'>
                        <label for='layerOutlineSizeToSave' class='form-label'>Width</label>
                        <input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/>
                    </div>
                </div>
                <div class='form-text'>Cross and X styles use the outline parameters.</div>
                <hr/>
                <div class='form-check'>
                    <input type='checkbox' class='form-check-input' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>
                    <label for='layerKeepOriginalRendererToSave' class='form-check-label'>Keep Original Symbology</label>
                </div>
                <div class='form-text'>Checking this option will ignore all the styling fields above to take the original layer style.</div>
                <input class='btn btn-primary mt-3' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/>
            </form>);
        }
        else if(geometryType === "polyline"){
            return (
            <form class="px-1 py-1">
                <input class='form-control' type='text' placeholder='New name' id='layerNameToSave' name='layerNameToSave' maxlength='40'/>
                <hr/>
                <div class='row mb-3'>                    
                    <div class='col'>
                        <label for='layerStyleToSave' class='form-label'>Style</label>{this._getSymbolList(geometryType)}
                    </div>
                    <div class='col'>
                        <label for='layerSizeToSave' class='form-label'>Size</label>
                        <input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/>
                    </div>
                </div>
                <div class='row mb-3'>
                    <div class="col">
                        <label for='layerColorToSave' class='form-label'>Color</label>
                        <input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/>
                    </div>
                    <div class='col form-check'>
                        <input type='checkbox' class='form-check-input' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>
                        <label class='form-check-label'>No color</label>
                    </div>
                </div>
                <hr/>
                <div class='form-check'>
                    <input type='checkbox' class='form-check-input' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>
                    <label for='layerKeepOriginalRendererToSave' class='form-check-label'>Keep Original Symbology</label>
                </div>
                <div class='form-text'>Checking this option will ignore all the styling fields above to take the original layer style.</div>
                <input class='btn btn-primary mt-3' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/>
            </form>);
        }
        else if(geometryType === "polygon"){
            return (
            <form class="px-1 py-1">
                
                <input class='form-control' type='text' placeholder='New name' id='layerNameToSave' name='layerNameToSave' maxlength='40'/>
                <hr/>
                <div class='row mb-3'>   
                    <div class="col">
                        <label for='layerStyleToSave' class='form-label'>Style</label>{this._getSymbolList(geometryType)}
                    </div>
                </div>
                <div class='row mb-3'>
                    <div class="col">
                        <label for='layerColorToSave' class='form-label'>Color</label>
                        <input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/>
                    </div>
                    <div class='col form-check'>
                        <input type='checkbox' class='form-check-input' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>
                        <label class='form-check-label'>No color</label>
                    </div>
                </div>
                <div class='row'>
                    <div class='col'>
                        <label for='layerOutlineToSave' class='form-label'>Outline</label>
                        <input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/>
                    </div>
                    <div class='col'>
                        <label for='layerOutlineSizeToSave' class='form-label'>Width</label>
                        <input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/>
                    </div>
                </div>
                <hr/>
                <div class='form-check'>
                    <input type='checkbox' class='form-check-input' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>
                    <label for='layerKeepOriginalRendererToSave' class='form-check-label'>Keep Original Symbology</label>
                </div>
                <div class='form-text'>Checking this option will ignore all the styling fields above to take the original layer style.</div>
                <input class='btn btn-primary mt-3' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/>
            </form>);
        }
        else if(!geometryType){
            return (
                <form class="px-1 py-1">
                
                <input class='form-control' type='text' placeholder='New name' id='layerNameToSave' name='layerNameToSave' maxlength='40'/>
                <hr/>
                <div class='row mb-3'>                    
                    <div class='col'>
                        <label for='layerStyleToSave' class='form-label'>Style</label>{this._getSymbolList(geometryType)}
                    </div>
                    <div class='col'>
                        <label for='layerSizeToSave' class='form-label'>Size</label>
                        <input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/>
                    </div>
                </div>
                <div class='row mb-3'>
                    <div class="col">
                        <label for='layerColorToSave' class='form-label'>Color</label>
                        <input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/>
                    </div>
                    <div class='col form-check'>
                        <input type='checkbox' class='form-check-input' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>
                        <label class='form-check-label'>No color</label>
                    </div>
                </div>
                <div class='row'>
                    <div class='col'>
                        <label for='layerOutlineToSave' class='form-label'>Outline</label>
                        <input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/>
                    </div>
                    <div class='col'>
                        <label for='layerOutlineSizeToSave' class='form-label'>Width</label>
                        <input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/>
                    </div>
                </div>
                <hr/>
                <div class='form-check'>
                    <input type='checkbox' class='form-check-input' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>
                    <label for='layerKeepOriginalRendererToSave' class='form-check-label'>Keep Original Symbology</label>
                </div>
                <div class='form-text'>Checking this option will ignore all the styling fields above to take the original layer style.</div>
                <input class='btn btn-primary mt-3' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/>
            </form>);
        }
    }
}

export default PinLayer;

