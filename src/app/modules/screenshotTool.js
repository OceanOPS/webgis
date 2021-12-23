define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./ScreenshotToolViewModel", "esri/widgets/support/widget"], function (require, exports, tslib_1, decorators_1, Widget_1, ScreenshotToolViewModel_1, widget_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    ScreenshotToolViewModel_1 = tslib_1.__importDefault(ScreenshotToolViewModel_1);
    var CSS = {
        base: "esri-widget",
        customDefault: "custom-widget-default"
    };
    var ScreenshotTool = /** @class */ (function (_super) {
        tslib_1.__extends(ScreenshotTool, _super);
        function ScreenshotTool(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new ScreenshotToolViewModel_1.default();
            _this.fileName = "screenshot";
            _this.downloadLinkText = "Take a screenshot to download";
            _this._updatePixelRatio = function (event) {
                var input = event.currentTarget;
                _this.viewModel["pixelRatio"] = parseFloat(input.value);
            };
            _this._takeScreenshotWholeView = function (event) {
                _this.viewModel.takeScreenshotWholeView();
            };
            _this._takeScreenshotArea = function (event) {
                _this.viewModel.initSketchViewModel();
            };
            _this._updateLink = function () {
                if (_this.viewModel.dataUrl != null) {
                    var d = new Date();
                    _this.fileName = "OceanOPS-screenshot-" + d.toISOString() + ".png";
                    _this.downloadLinkText = "Download screenshot";
                }
            };
            _this._updateLink = _this._updateLink.bind(_this);
            return _this;
        }
        ScreenshotTool.prototype.postInitialize = function () {
            var handle = this.viewModel.watch("dataUrl", this._updateLink);
            // Helper used for cleaning up resources once the widget is destroyed
            this.own(handle);
        };
        ScreenshotTool.prototype.render = function () {
            return (widget_1.tsx("div", { class: this.classes([CSS.base, CSS.customDefault]) },
                widget_1.tsx("span", null,
                    "Capture the current view\u00A0",
                    widget_1.tsx("button", { id: 'screenshotButton', class: 'action-button esri-icon-maximize', type: 'button', title: 'Capture the whole view', onclick: this._takeScreenshotWholeView }),
                    "\u00A0or a drawn area\u00A0",
                    widget_1.tsx("button", { class: 'action-button esri-icon-sketch-rectangle screenshot-draw-button', id: 'screenshotDrawButton', type: 'button', title: 'Draw rectangle', onclick: this._takeScreenshotArea })),
                widget_1.tsx("br", null),
                widget_1.tsx("label", { for: 'screenshotPixelRatio' }, "Magnifying factor:\u00A0"),
                widget_1.tsx("input", { id: 'screenshotPixelRatio', type: 'number', min: '1', max: '5', value: '1', step: '0.5', onchange: this._updatePixelRatio }),
                widget_1.tsx("div", null,
                    widget_1.tsx("a", { href: this.viewModel.dataUrl, download: this.fileName }, this.downloadLinkText))));
        };
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view")
        ], ScreenshotTool.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.sketchLayer")
        ], ScreenshotTool.prototype, "sketchLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ScreenshotTool.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ScreenshotTool.prototype, "fileName", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ScreenshotTool.prototype, "downloadLinkText", void 0);
        ScreenshotTool = tslib_1.__decorate([
            decorators_1.subclass("esri.widgets.ScreenshotTool")
        ], ScreenshotTool);
        return ScreenshotTool;
    }(Widget_1.default));
    return ScreenshotTool;
});
//# sourceMappingURL=ScreenshotTool.js.map