define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "./OpacitySliderViewModel", "esri/widgets/support/widget"], function (require, exports, tslib_1, decorators_1, Widget_1, OpacitySliderViewModel_1, widget_1) {
    "use strict";
    Widget_1 = (0, tslib_1.__importDefault)(Widget_1);
    OpacitySliderViewModel_1 = (0, tslib_1.__importDefault)(OpacitySliderViewModel_1);
    var CSS = {
        base: "esri-widget",
        customDefault: "custom-widget-default"
    };
    var OpacitySlider = /** @class */ (function (_super) {
        (0, tslib_1.__extends)(OpacitySlider, _super);
        function OpacitySlider(params) {
            var _this = _super.call(this, params) || this;
            _this.viewModel = new OpacitySliderViewModel_1.default();
            _this._handleOpacityChange = function (event) {
                var input = event.currentTarget;
                _this.viewModel["opacity"] = parseFloat(input.value);
            };
            return _this;
        }
        OpacitySlider.prototype.render = function () {
            var layerName = this._getLayerName();
            return ((0, widget_1.tsx)("div", { class: this.classes([CSS.base, CSS.customDefault]) },
                (0, widget_1.tsx)("span", null,
                    "Change opacity - ",
                    layerName),
                (0, widget_1.tsx)("br", null),
                (0, widget_1.tsx)("form", { class: 'form-horizontal' },
                    (0, widget_1.tsx)("input", { type: 'range', min: '0', max: '1', step: '0.01', value: this.layer.opacity, onchange: this._handleOpacityChange, oninput: this._handleOpacityChange }))));
        };
        OpacitySlider.prototype._getLayerName = function () {
            return this.layer.title;
        };
        (0, tslib_1.__decorate)([
            (0, decorators_1.aliasOf)("viewModel.layer")
        ], OpacitySlider.prototype, "layer", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], OpacitySlider.prototype, "viewModel", void 0);
        OpacitySlider = (0, tslib_1.__decorate)([
            (0, decorators_1.subclass)("esri.widgets.OpacitySlider")
        ], OpacitySlider);
        return OpacitySlider;
    }(Widget_1.default));
    return OpacitySlider;
});
//# sourceMappingURL=OpacitySlider.js.map