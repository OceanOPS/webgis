define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    var OpacitySliderViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(OpacitySliderViewModel, _super);
        function OpacitySliderViewModel(props) {
            return _super.call(this) || this;
        }
        Object.defineProperty(OpacitySliderViewModel.prototype, "opacity", {
            get: function () {
                return this.layer.opacity;
            },
            set: function (value) {
                this.layer.opacity = value;
            },
            enumerable: false,
            configurable: true
        });
        ;
        tslib_1.__decorate([
            decorators_1.property()
        ], OpacitySliderViewModel.prototype, "layer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], OpacitySliderViewModel.prototype, "opacity", null);
        OpacitySliderViewModel = tslib_1.__decorate([
            decorators_1.subclass("esri.widgets.OpacitySliderViewModel")
        ], OpacitySliderViewModel);
        return OpacitySliderViewModel;
    }(Accessor));
    return OpacitySliderViewModel;
});
//# sourceMappingURL=OpacitySliderViewModel.js.map