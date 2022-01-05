import Accessor from "esri/core/Accessor";

import Layer from "esri/layers/Layer";

import { property, subclass } from "esri/core/accessorSupport/decorators";

@subclass("esri.widgets.OpacitySliderViewModel")
class OpacitySliderViewModel extends Accessor {

    constructor(props ?: any){
        super();
    }

    @property()
    layer: Layer;

    @property()
    get opacity(): number{
        return this.layer.opacity;
    };
    set opacity(value){
        this.layer.opacity = value;
    }
}

export = OpacitySliderViewModel;