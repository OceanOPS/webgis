import Accessor from "@arcgis/core/core/Accessor";
import Layer from "@arcgis/core/layers/Layer";
import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";

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

export default OpacitySliderViewModel;