import { subclass, property, aliasOf } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";
import ScreenshotToolViewModel from "./ScreenshotToolViewModel";

import { tsx } from "esri/widgets/support/widget";

const CSS = {
  base: "esri-widget",
  customDefault: "custom-widget-default"
};

@subclass("esri.widgets.ScreenshotTool")
class ScreenshotTool extends Widget {
  constructor(params?: any) {
    super(params);
    this._updateLink = this._updateLink.bind(this);
  }

  @aliasOf("viewModel.view")
  view: ScreenshotToolViewModel["view"];

  @aliasOf("viewModel.sketchLayer")
  sketchLayer: ScreenshotToolViewModel["sketchLayer"];

  @property()
  viewModel: ScreenshotToolViewModel = new ScreenshotToolViewModel();

  @property()
  fileName: string = "screenshot";

  @property()
  downloadLinkText: string = "Take a screenshot to download";

  postInitialize() {
    const handle = this.viewModel.watch("dataUrl", this._updateLink);

    // Helper used for cleaning up resources once the widget is destroyed
    this.own(handle);
  }

  render() {
    return (
      <div class={this.classes([CSS.base, CSS.customDefault])}>
        <span>Capture the current view&nbsp;
          <button id='screenshotButton' class='action-button esri-icon-maximize' type='button' title='Capture the whole view'
            onclick={this._takeScreenshotWholeView}></button>
          &nbsp;or a drawn area&nbsp;
          <button class='action-button esri-icon-sketch-rectangle screenshot-draw-button' id='screenshotDrawButton' type='button'
            title='Draw rectangle' onclick={this._takeScreenshotArea}></button>
        </span>
        <br />
        <label for='screenshotPixelRatio'>Magnifying factor:&nbsp;</label>
        <input id='screenshotPixelRatio' type='number' min='1' max='5' value='1' step='0.5'
          onchange={this._updatePixelRatio}
        />
        <div><a href={this.viewModel.dataUrl} download={this.fileName}>{this.downloadLinkText}</a></div>
      </div>
    );
  }

  private _updatePixelRatio = (event: Event): void => {
    var input = event.currentTarget as HTMLInputElement;
    this.viewModel["pixelRatio"] = parseFloat(input.value);
  };

  private _takeScreenshotWholeView = (event: Event): void => {
    this.viewModel.takeScreenshotWholeView();
  }

  private _takeScreenshotArea = (event: Event): void => {
    this.viewModel.initSketchViewModel();
  }

  private _updateLink = (): void => {
    if (this.viewModel.dataUrl != null) {
      var d = new Date();
      this.fileName = "OceanOPS-screenshot-" + d.toISOString() + ".png";
      this.downloadLinkText = "Download screenshot";
    }
  }

}

export = ScreenshotTool;