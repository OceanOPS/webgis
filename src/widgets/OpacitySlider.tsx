import { subclass, property, aliasOf } from "@arcgis/core/core/accessorSupport/decorators";

import Widget from "@arcgis/core/widgets/Widget";
import OpacitySliderViewModel from "./OpacitySliderViewModel";

import { tsx } from "@arcgis/core/widgets/support/widget";

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

  @property()
  toClose: boolean = false;

  render(){
      var layerName = this._getLayerName();
      return (
        <div class={this.classes([CSS.base, CSS.customDefault])}>
            <form class="px-1 py-1">                
              <div class='row mb-3'>
                <div class='col'>
                  <label for='opacitySliderInput' class='form-label'>Change opacity - {layerName}</label>
                  <input class="form-range" type='range' min='0' max='1' step='0.01' id="opacitySliderInput" name="opacitySliderInput"
                    value={this.layer.opacity}
                    onchange={this._handleOpacityChange}
                    oninput={this._handleOpacityChange}
                  />
                </div>
              </div>        
              <div class='row mb-3'>
                <div class='col'>
                  <input class='btn btn-primary mt-3' type='button' value='Close' id='closeWidget' onclick={() => {this.toClose = true}}/>
                </div>
              </div>
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

export default OpacitySlider;