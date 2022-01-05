define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor_1, decorators_1) {
    "use strict";
    Accessor_1 = (0, tslib_1.__importDefault)(Accessor_1);
    var OpacitySliderViewModel = /** @class */ (function (_super) {
        (0, tslib_1.__extends)(OpacitySliderViewModel, _super);
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
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], OpacitySliderViewModel.prototype, "layer", void 0);
        (0, tslib_1.__decorate)([
            (0, decorators_1.property)()
        ], OpacitySliderViewModel.prototype, "opacity", null);
        OpacitySliderViewModel = (0, tslib_1.__decorate)([
            (0, decorators_1.subclass)("esri.widgets.OpacitySliderViewModel")
        ], OpacitySliderViewModel);
        return OpacitySliderViewModel;
    }(Accessor_1.default));
    return OpacitySliderViewModel;
});
//# sourceMappingURL=OpacitySliderViewModel.js.map