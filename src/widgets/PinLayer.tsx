import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";

import Widget from "@arcgis/core/widgets/Widget";
import PinLayerViewModel from "./PinLayerViewModel";

import { tsx } from "@arcgis/core/widgets/support/widget";

const CSS = {
  base: "esri-widget",
  customDefault: "custom-widget-default"
};

@subclass("esri.widgets.PinLayer")
class PinLayer extends Widget {

    @aliasOf("viewModel.layer")
    layer: PinLayerViewModel["layer"];

    @aliasOf("viewModel.useGivenLayer")
    useGivenLayer: PinLayerViewModel["useGivenLayer"];

    @property()
    viewModel: PinLayerViewModel = new PinLayerViewModel();
    
    constructor(params?: any) {
        super(params);
        this.layer = params.layerInstance;
        this.useGivenLayer = params.useGivenLayerParam;        
    }

    private _pinLayer = (event: Event): void => {
        var input = event.currentTarget as HTMLFormElement;
        if(input){
            var formFields = input.form.elements;
            this.viewModel.pinLayer(formFields);
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
            <form class='form-horizontal'>
                <div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' /></div></div>
                <div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'>{this._getSymbolList(geometryType)}</div>
                <div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>
                <div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>
                <div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>No color</label></div></div>
                <div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>
                <div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>" +
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-8'><label class='checkbox-inline'><input type='checkbox' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>Keep Original Symbology</label></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-4'><input class='btn btn-default' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/></div></div>
            </form>);
        }
        else if(geometryType === "polyline"){
            return (
            <form class='form-horizontal'>
                <div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' /></div></div>
                <div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'>{this._getSymbolList(geometryType)}</div>
                <div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>
                <div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>
                <div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>No color</label></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-8'><label class='checkbox-inline'><input type='checkbox' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>Keep Original Symbology</label></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-4'><input class='btn btn-default' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/></div></div>
            </form>);
        }
        else if(geometryType === "polygon"){
            return (
            <form class='form-horizontal'>
                <div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40'/></div></div>
                <div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style</label><div class='col-sm-8'>{this._getSymbolList(geometryType)}</div></div>
                <div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>
                <div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>No color</label></div></div>
                <div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>
                <div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-8'><label class='checkbox-inline'><input type='checkbox' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>Keep Original Symbology</label></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-4'><input class='btn btn-default' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/></div></div>
            </form>);
        }
        else if(!geometryType){
            return (
            <form class='form-horizontal'>
                <div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' /></div></div>
                <div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'>{this._getSymbolList(geometryType)}</div>
                <div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>
                <div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>
                <div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'/>No color</label></div></div>
                <div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>
                <div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-8'><label class='checkbox-inline'><input type='checkbox' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'/>Keep Original Symbology</label></div></div>
                <div class='form-group row'><div class='col-sm-offset-4 col-sm-4'><input class='btn btn-default' type='button' value='Pin it!' id='pinLayerSubmit' onclick={this._pinLayer}/></div></div>
            </form>);
        }
    }
}

export default PinLayer;

