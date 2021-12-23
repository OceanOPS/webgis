import { subclass, property, aliasOf } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";
import OpacitySliderViewModel from "./OpacitySliderViewModel";

import { tsx } from "esri/widgets/support/widget";

const CSS = {
  base: "esri-widget",
  customDefault: "custom-widget-default"
};

@subclass("esri.widgets.OpacitySlider")
class OpacitySlider extends Widget {
   constructor(params?: any) {
    super(params);
  }

  @aliasOf("viewModel.layer")
  layer: OpacitySliderViewModel["layer"];

  @property()
  viewModel: OpacitySliderViewModel = new OpacitySliderViewModel();

  render(){
      var layerName = this._getLayerName();
      return (
        <div class={this.classes([CSS.base, CSS.customDefault])}>
            <span>Change opacity - {layerName}</span><br/>
            <form class='form-horizontal'>
                <input type='range' min='0' max='1' step='0.01'
                value={this.layer.opacity}
                onchange={this._handleOpacityChange}
                oninput={this._handleOpacityChange}
                />
            </form>
        </div>
      );
  }

  private _getLayerName(): string{
      return this.layer.title;
  }

  
  private _handleOpacityChange = (event: Event): void => {
    var input = event.currentTarget as HTMLInputElement;
    this.viewModel["opacity"] = parseFloat(input.value);
  };
}

export = OpacitySlider;