import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.LayerElevationExpr")
class LayerElevationExpr extends Widget{
    // Current layer being processed
    @property()
    layer: FeatureLayer;
    @property()
    currentElevationInfo: any = {
        mode: "relative-to-ground",
        offset: 0,
        featureExpressionInfo: {
            expression: "0"
        },
        unit: "meters"
    };

    constructor(props: {layer: FeatureLayer}){
        super();
        this.layer = props.layer;
        
        this.currentElevationInfo.mode = this.layer.elevationInfo.mode;
        if(this.layer.elevationInfo.featureExpressionInfo){
            this.currentElevationInfo.featureExpressionInfo.expression = this.layer.elevationInfo.featureExpressionInfo.expression;
        }
        this.currentElevationInfo.offset = this.layer.elevationInfo.offset;
        
    }

    render(){
        return(
            <div class={this.classes([CSS.base, CSS.customDefault])}>
                <form>
                    <label class="form-label">Mode</label>
                    &nbsp;
                    <select class="form-control" afterCreate={this._selectInit} onchange={this._modeChanged} id='elevationMode'>
                        <option key='on-the-ground' value='on-the-ground'>on-the-ground</option>
                        <option key='relative-to-ground' value='relative-to-ground'>relative-to-ground</option>
                        <option key='relative-to-scene' value='relative-to-scene'>relative-to-scene</option>
                        <option key='absolute-height' value='absolute-height'>absolute-height</option>
                    </select>
                    <br/>
                    <label class="form-label">Offset</label>&nbsp;<input class="form-control" id='elevationOffset' type='number' value={this.layer.elevationInfo.offset} onchange={this._offsetChanged}/><br/>
                    <label class="form-label">Expression</label>&nbsp;<input class="form-control" id='elevationExpr' type='text' onchange={this._expressionChanged}
                        value={this.layer.elevationInfo.featureExpressionInfo && this.layer.elevationInfo.featureExpressionInfo.expression}/>
                </form>
            </div>
        );
    }

    private _selectInit = (html: any) => {
        var select = html as HTMLSelectElement;
        if(this.layer.elevationInfo.mode == 'on-the-ground')
            {select.selectedIndex = 0;}
        if(this.layer.elevationInfo.mode == 'relative-to-ground')
            {select.selectedIndex = 1;}
        if(this.layer.elevationInfo.mode == 'relative-to-scene')
            {select.selectedIndex = 2;}
        if(this.layer.elevationInfo.mode == 'absolute-height')
            {select.selectedIndex = 3;}
    }

    private _expressionChanged = (event: any) => {
        var val = event.target.value;
        this.currentElevationInfo.featureExpressionInfo.expression = val;
        this.layer.elevationInfo = this.currentElevationInfo;
    };
    private _modeChanged = (event: any) =>{
        var select = event.target;
        var val = select.options[select.selectedIndex].value;
        this.currentElevationInfo.mode = val;
        this.layer.elevationInfo = this.currentElevationInfo;
    };
    private _offsetChanged = (event: any) => {
        var val = event.target.value;
        this.currentElevationInfo.offset = val;
        this.layer.elevationInfo = this.currentElevationInfo;
    };

}
export default LayerElevationExpr;