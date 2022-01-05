define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/widgets/Sketch/SketchViewModel"], function (require, exports, tslib_1, Accessor_1, decorators_1, SketchViewModel_1) {
    "use strict";
    Accessor_1 = (0, tslib_1.__importDefault)(Accessor_1);
    SketchViewModel_1 = (0, tslib_1.__importDefault)(SketchViewModel_1);
    var ScreenshotToolViewModel = /** @class */ (function (_super) {
        (0, tslib_1.__extends)(ScreenshotToolViewModel, _super);
        function ScreenshotToolViewModel(props) {
            var _this = _super.call(this) || this;
            _this.takeScreenshotWholeView = function () {
                _this.view.takeScreenshot({
                    format: "png",
                    width: _this.view.width * _this.pixelRatio,
                    height: _this.view.height * _this.pixelRatio
                }).then(function (screenshot) {
                    _this.dataUrl = screenshot.dataUrl;
                });
            };
            _this.initSketchViewModel = function () {
                // create a new sketch view model
                _this.sketchViewModel = new SketchViewModel_1.default({
                    view: _this.view,
                    updateOnGraphicClick: false,
                    layer: _this.sketchLayer,
                    pointSymbol: {
                        type: "simple-marker",
                        style: "cross",
                        color: "#FFFFFF",
                        size: "16px",
                        outline: {
                            color: "#202020",
                            width: 1
                        }
                    },
                    polylineSymbol: {
                        type: "simple-line",
                        color: "#FF8000",
                        width: "4",
                        style: "dash"
                    },
                    polygonSymbol: {
                        type: "simple-fill",
                        color: "rgba(138,43,226, 0.5)",
                        style: "solid",
                        outline: {
                            color: "white",
                            width: 1
                        }
                    }
                });
                _this.sketchViewModel.create('rectangle', { mode: "freehand" });
                // Listen the sketchViewModel's update-complete and update-cancel events
                _this.sketchViewModel.on("create", _this._handleSketchVMCreate);
            };
            _this._handleSketchVMCreate = function (event) {
                if (event.state === "complete") {
                    _this._takeScreenshotForGraphic(event.graphic);
                }
            };
            _this._takeScreenshotForGraphic = function (graphic) {
                // Determining the area to capture
                var xmin = -1, ymin = -1, xmax = -1, ymax = -1;
                for (var i = 0; i < 4; i++) {
                    var geom = graphic.geometry;
                    var screenPoint = _this.view.toScreen(geom.getPoint(0, i));
                    if (xmin == -1 || xmin > screenPoint.x) {
                        xmin = screenPoint.x;
                    }
                    if (ymin == -1 || ymin > screenPoint.y) {
                        ymin = screenPoint.y;
                    }
                    if (xmax == -1 || xmax < screenPoint.x) {
                        xmax = screenPoint.x;
                    }
                    if (ymax == -1 || ymax < screenPoint.y) {
                        ymax = screenPoint.y;
                    }
                }
                // Removing sketch before taking the screenshot
                var sketchLayerId = _this.sketchLayer.id;
                var layers = _this.view.map.allLayers.filter(function (l) {
                    return l.id != sketchLayerId;
                }).toArray();
                // Taking the screenshot
                var self = _this;
                _this.view.takeScreenshot({
                    layers: layers,
                    width: (xmax - xmin) * _this.pixelRatio,
                    height: (ymax - ymin) * _this.pixelRatio,
                    area: {
                        x: xmin,
                        y: ymin,
                        width: xmax - xmin,
                        height: ymax - ymin
                    }
                }).then(function (screenshot) {
                    self.dataUrl = screenshot.dataUrl;
                });
            };
            _this.pixelRatio = 1;
            _this._handleSketchVMCreate = _this._handleSketchVMCreate.bind(_this);
            return _this;
        }
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], ScreenshotToolViewModel.prototype, "view", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], ScreenshotToolViewModel.prototype, "sketchViewModel", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], ScreenshotToolViewModel.prototype, "sketchLayer", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], ScreenshotToolViewModel.prototype, "pixelRatio", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], ScreenshotToolViewModel.prototype, "dataUrl", void 0);
        ScreenshotToolViewModel = (0, tslib_1.__decorate)([
            (0, decorators_1.subclass)("esri.widgets.ScreenshotToolViewModel")
        ], ScreenshotToolViewModel);
        return ScreenshotToolViewModel;
    }(Accessor_1.default));
    return ScreenshotToolViewModel;
});
//# sourceMappingURL=ScreenshotToolViewModel.js.map