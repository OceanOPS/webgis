import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";
import { tsx } from "@arcgis/core/widgets/support/widget";

import Widget from "@arcgis/core/widgets/Widget";
import GISMap from "../Map";

const CSS = {
    base: "esri-widget",
    customDefault: "custom-widget-default"
  };
  
@subclass("esri.widgets.AddLogo")
class AddLogo extends Widget{

    /**
     * Reference to the GISMap
     */
    private map: GISMap;

    @property()
    url: string = "";

    constructor(props?: any){
        super();
        this.map = props.mapInstance;
    }

    render(){
        return (<div class={this.classes([CSS.base, CSS.customDefault])}>
            <form class='form-horizontal'>
                <input id='logoUrl' placeholder='URL' type='url' value={this.url} onchange={this.updateUrl}/>
                <input class='btn btn-secondary' type='button' value='Add' onclick={this.confirmLogo}/>
            </form>
        </div>);
    }

    private updateUrl = (event: any) => {
        this.url = event.target.value;
    }

    private confirmLogo = () => {
        this.map.addLogoToUI(this.url);
    }
}
export default AddLogo;