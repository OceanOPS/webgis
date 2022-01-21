import Accessor from "@arcgis/core/core/Accessor";

import { property, subclass } from "@arcgis/core/core/accessorSupport/decorators";

interface DraftPtf {
    draftId: string, lat: number, lon: number
};

@subclass("esri.widgets.EditGraphicViewModel")
class EditGraphicViewModel extends Accessor{
    // drafts counter
    @property()
    idsSelected: string[] = [];
    @property()
    cruiseIdSelected: string | null = null;
    @property()
    countPoints = 0;
    @property()
    countPolyline = 0;

    @property()
    draftPtfs: DraftPtf[] = [];

    constructor(props?: any){
        super(props);
    }

}

export {EditGraphicViewModel, DraftPtf};