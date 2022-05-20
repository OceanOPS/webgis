import Config from "./Config";
import GISMap from "./Map";

class AddLayer{
    private map: GISMap;
    private modalContents: any;
    private customTypes = [
        {id: "wms", name: "WMS", formHTML: "<div class=\"form-group\"><label for=\"layer-name\">Name</label><input type=\"text\" class=\"form-control\" id=\"layer-name\"></div>" + 
            "<div class=\"form-group\"><label for=\"layer-url\">URL</label><input type=\"url\" class=\"form-control\" id=\"layer-url\"></div>"
        },
        {id: "kml", name: "KML", formHTML: "<div class=\"form-group\"><label for=\"layer-name\">Name</label><input type=\"text\" class=\"form-control\" id=\"layer-name\"></div>" + 
            "<div class=\"form-group\"><label for=\"layer-url\">URL</label><input type=\"url\" class=\"form-control\" id=\"layer-url\"></div>"
        },
        {id: "arcgis", name: "ArcGIS MapService", formHTML: "<div class=\"form-group\"><label for=\"layer-name\">Name</label><input type=\"text\" class=\"form-control\" id=\"layer-name\"></div>" + 
            "<div class=\"form-group\"><label for=\"layer-url\">URL</label><input type=\"url\" class=\"form-control\" id=\"layer-url\"></div>"
        },
        {id: "csv", name: "CSV", formHTML: "<p>After clicking the + button, another window will open helping you setting a name and a renderer.</p>" + 
            "<div class=\"form-group\"><label for=\"layer-url\">URL</label><input type=\"url\" class=\"form-control\" id=\"layer-url\"></div>" +
            "<div class=\"form-group\"><label for=\"layer-latfield\">Lat. field</label><input type=\"text\" class=\"form-control\" id=\"layer-latfield\"></div>" +
            "<div class=\"form-group\"><label for=\"layer-lonfield\">Lon. field</label><input type=\"text\" class=\"form-control\" id=\"layer-lonfield\"></div>"
        }
    ];

    constructor(mapInstance: GISMap){
        this.map = mapInstance;
        this.modalContents = document.querySelector('#addLayerModal .modal-body');
        var instr = document.createElement("p");
        instr.innerHTML = "<div class=\"alert alert-info\" role=\"alert\">Click on a layer to show its description, double click to add it on the map.</div>";
        this.modalContents.appendChild(instr);
        var panelGroup = document.createElement("div");
        panelGroup.id = "accordion";
        this.modalContents.appendChild(panelGroup);

        // Getting layer lists
        var operationalLayerList = Config.operationalLayers.filter(l => (this.map.getTheme() == l.theme || l.theme == Config.THEME_ALL) && l.type !== Config.TYPE_OBS_PTF);
        var otherLayerList = Config.dynamicLayers.filter(l => (this.map.getTheme() == Config.THEME_INTEGRATED && l.group == "analysis") || this.map.getTheme() == l.theme || l.theme == Config.THEME_ALL);

        // Filtering and ordering layer groups
        var layerGroups  = Config.layerGroups.filter(lg => otherLayerList.map(l => l.group).includes(lg.id)).concat(Config.layerGroups.filter(lg => operationalLayerList.map(l => l.group).includes(lg.id)));
        layerGroups = layerGroups.filter((lg, index, self) => index === self.findIndex((t) => ( t.id === lg.id )) );
        layerGroups = layerGroups.sort(function(a, b){
            return a.index - b.index;
        });
        var i = 0;
        // Adding Operational and Others sections
        layerGroups.forEach((item) =>{
            var panel = document.createElement("div");
            panel.classList.add("accordion-item");
            panelGroup.appendChild(panel);
            var panelHeading = document.createElement("div");
            panelHeading.classList.add("accordion-header");
            panelHeading.id = "heading-" + item.id;
            panelHeading.innerHTML = "<button type=\"button\" class=\"accordion-button " + (i > 0 ? "collapsed": "") + "\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse-" + item.id + "\" aria-expanded=\"" + (i == 0 ? "true": "false") + " aria-controls=\"#collapse-" + item.id + "\"" + "\">" + item.name + "</button>";
            panel.appendChild(panelHeading);
            var panelBodyContainer = document.createElement("div");
            panelBodyContainer.className = "accordion-collapse collapse " + (i === 0 ? "show": "");
            panelBodyContainer.setAttribute("aria-labelledby", "heading-" + item.id);
            panelBodyContainer.id = "collapse-" + item.id;
            panelBodyContainer.setAttribute("data-bs-parent", "#accordion");
            panel.appendChild(panelBodyContainer);
            var panelBody = document.createElement("div");
            panelBody.classList.add("accordion-body");
            panelBody.id = "body-" + item.id;
            panelBodyContainer.appendChild(panelBody);
            var row = document.createElement("div");
            row.classList.add("row");
            panelBody.appendChild(row);

            var currentOtherLayers = otherLayerList.filter(l => l.group === item.id);
            currentOtherLayers.forEach((layer) => {
                row.appendChild(this.createCardLayer(layer, panelBody));
            });

            var currentOperationalLayers = operationalLayerList.filter(l => l.group === item.id);
            currentOperationalLayers.forEach((layer) => {
                if(!layer.hideFromCollection){
                    row.appendChild(this.createCardLayer(layer, panelBody));
                }
            });
            
            var subrow = document.createElement("div");
            subrow.classList.add("subrow-description");
            panelBody.appendChild(subrow);
            i++;
        });

        // Adding Custom layers section
        var panel = document.createElement("div");
        panel.classList.add("accordion-item");
        panelGroup.appendChild(panel);
        var panelHeading = document.createElement("div");
        panelHeading.classList.add("accordion-header");
        panelHeading.id = "heading-custom";
        panelHeading.innerHTML = "<button type=\"button\" class=\"accordion-button collapsed\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse-custom\" aria-expanded=\"false\" aria-controls=\"collapse-custom\">Custom layer</button>";
        panel.appendChild(panelHeading);
        var panelBodyContainer = document.createElement("div");
        panelBodyContainer.className = "accordion-collapse collapse";
        panelBodyContainer.setAttribute("aria-labelledby", "heading-custom");
        panelBodyContainer.id = "collapse-custom";
        panelBodyContainer.setAttribute("data-bs-parent", "#accordion");
        panel.appendChild(panelBodyContainer);
        var panelBody = document.createElement("div");
        panelBody.classList.add("accordion-body");
        panelBody.id = "body-custom";
        panelBodyContainer.appendChild(panelBody);
        var row = document.createElement("div");
        row.classList.add("row");
        panelBody.appendChild(row);
        var divLeft = document.createElement("div");
        divLeft.className = "col-md-3";
        row.appendChild(divLeft);
        var divRight = document.createElement("div");
        divRight.className = "col-md-9";
        row.appendChild(divRight);
        var layerTypeSelect = document.createElement("select");
        layerTypeSelect.id = "custom-layer-typeselect";
        layerTypeSelect.name = "custom-layer-typeselect";
        divLeft.appendChild(layerTypeSelect);
        var option = document.createElement("option");
        option.innerHTML = "--";
        option.selected = true;
        option.disabled = true;
        layerTypeSelect.appendChild(option);
        this.customTypes.forEach((type) => {
            option = document.createElement("option");
            option.value = type.id;
            option.innerHTML = type.name;
            layerTypeSelect.appendChild(option);
        }); 
        layerTypeSelect.onchange = (evt: any) => {
            divRight.innerHTML = "";
            var layerType = evt.target.options[evt.target.selectedIndex].value;
            var customType = this.customTypes.find(t => t.id === layerType);
            if(customType){
                var html = customType.formHTML;
                var form = document.createElement("form");
                form.innerHTML = html;
                divRight.appendChild(form);
                var btn = document.createElement("button");
                btn.className = "btn btn-light";
                btn.type = "button";
                btn.innerHTML = "+";
                form.appendChild(btn);
                btn.onclick = (evtAdd: any) => {
                    this.addCustomLayer(layerType, evtAdd.target.form.elements);
                };
            }
        };

        // Adding basemaps section
        panel = document.createElement("div");
        panel.classList.add("accordion-item");
        panelGroup.appendChild(panel);
        panelHeading = document.createElement("div");
        panelHeading.classList.add("accordion-header");
        panelHeading.id = "heading-basemaps";
        panelHeading.innerHTML = "<button type=\"button\" class=\"accordion-button collapsed\" data-bs-toggle=\"collapse\" data-bs-target=\"#collapse-basemaps\" aria-expanded=\"false\" aria-controls=\"collapse-basemaps\">Change basemap</button>";
        panel.appendChild(panelHeading);
        panelBodyContainer = document.createElement("div");
        panelBodyContainer.id = "collapse-basemaps";
        panelBodyContainer.className = "accordion-collapse collapse";
        panelBodyContainer.setAttribute("aria-labelledby", "heading-basemaps");
        panelBodyContainer.setAttribute("data-bs-parent", "#accordion");
        panel.appendChild(panelBodyContainer);
        panelBody = document.createElement("div");
        panelBody.className = "accordion-body";
        panelBody.id = "body-basemaps";
        panelBodyContainer.appendChild(panelBody);
        var pElt = document.createElement("p");
        pElt.innerHTML = "You can only add one basemap at a time: changing it will replace the current one in use.";
        panelBody.appendChild(pElt);
        pElt = document.createElement("p");
        pElt.innerHTML = "<div class=\"alert alert-warning\" role=\"alert\">External basemaps might not support all the projections.</div>";
        panelBody.appendChild(pElt);
        row = document.createElement("div");
        row.className = "row";
        panelBody.appendChild(row);
        Config.basemaps.forEach((basemap) => {
            basemap.basemap.load().then(() => {
                var div = document.createElement("div");
                div.className = "col-xs-6 col-md-3";
                row.appendChild(div);
                var linkUrl;
                if(basemap.basemap.thumbnailUrl){
                    linkUrl = basemap.basemap.thumbnailUrl;
                }
                else if(basemap.thumbnailUrl){
                    linkUrl = basemap.thumbnailUrl;
                }
                else{
                    linkUrl = 'img/none.jpg';
                }
                link = document.createElement("a");
                link.href = "#";
                link.className = "thumbnail";
                link.innerHTML = "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' src='" + linkUrl + "' alt='" + basemap.basemap.title + "'>";
                div.appendChild(link);
                var pElt = document.createElement("p");
                pElt.innerHTML = basemap.basemap.title;
                div.appendChild(pElt);
                link.onclick = (evt: any) => {
                    this.map.setBasemapID(basemap.wkid);
                };
            });
        });
        var div = document.createElement("div");
        div.className = "col-xs-6 col-md-3";
        row.appendChild(div);
        var link = document.createElement("a");
        link.href = "#";
        link.className = "thumbnail";
        link.innerHTML = "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' alt='None' src='img/none.jpg'>";
        div.appendChild(link);
        var pElt = document.createElement("p");
        pElt.innerHTML = "None";
        div.appendChild(pElt);
        link.onclick = (evt: any) => {
            this.map.setBasemapID(null);
        };
    }

    //#region private methods

    /**
     * Creates a card in the layer group panel body of the add layer modal
     * @param layer (any) the current layer information
     * @param panelBody (HTMLElement) the panel body HTMLElement of the current layer group
     * @returns 
     */
    private createCardLayer = (layer: any, panelBody: HTMLElement): HTMLElement => {
        var div = document.createElement("div");
        div.className = "col-xs-6 col-md-3 addLayerCard";        
        var link = document.createElement("a");
        link.href = "#";
        link.classList.add("thumbnail");
        link.innerHTML = "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' src='" + (layer.thumbnailUrl || "img/layer-nopreview.jpg") + "' alt='" + layer.name + "'>";
        div.appendChild(link);
        var badgeContainer = document.createElement("div");
        badgeContainer.classList.add("badges");
        link.appendChild(badgeContainer);
        var badgeInfo = document.createElement("button");
        badgeInfo.className = "badge bg-info";
        badgeInfo.innerHTML = "Get info";
        badgeContainer.appendChild(badgeInfo);
        var badgeAdd = document.createElement("button");;
        badgeAdd.id = "badge-add-" + layer.id;
        badgeContainer.appendChild(badgeAdd);
        if(typeof(this.map.mapView.map.findLayerById(layer.id)) != 'undefined' ||
            (layer.id.includes("_GROUP_") && this.map.mapView.map.allLayers.find((elt) => elt.id.startsWith(layer.id)))    
            ){
            badgeAdd.className = "badge bg-success";
            badgeAdd.innerHTML = "Added";
            badgeAdd.disabled = true;
        }
        else{
            badgeAdd.className = "badge bg-light text-dark";
            badgeAdd.innerHTML = "Add";
        }
        var pName = document.createElement("p");
        pName.innerHTML = layer.name;
        div.appendChild(pName);
        link.onclick = () => {
            this.changeSelectedLayer(panelBody, layer);
        };
        link.ondblclick = () =>{
            this.addLayer(layer.id);
        };
        badgeInfo.onclick = () => {
            this.changeSelectedLayer(panelBody, layer);
        };
        badgeAdd.onclick = () => {
            this.addLayer(layer.id);
        };
        return div;
    }

    /**
     * Select a layer and displays its description. A button also appears aiming to add the layer to the map.
     * @param  {Object} panel Object where the row will be added
     * @param  {Object} layer Selected layer
     * @return {function}       The function
     */
    private changeSelectedLayer = (panel: any, layer: any): void => {
        var description = "No description set for this map service.";
        var panelElt = document.getElementById(panel.id);
        if(panelElt){
            var eltQuery = panelElt.querySelector(".subrow-description");
            if(eltQuery){
                var subrow: Element = eltQuery;
                subrow.innerHTML = "<hr>&nbsp;&nbsp;<span class=\"esri-icon-loader esri-icon-loading-indicator\" ></span>";
                var requestHeaders: HeadersInit = new Headers();
                requestHeaders.set('X-Requested-With', "");
                fetch(layer.url.substr(0,layer.url.indexOf('MapServer') + "MapServer".length) + "?f=json", {headers: requestHeaders})
                    .then((response: Response) => {
                    // Success
                    response.json().then((dataJson) => {
                        subrow.innerHTML = "<hr>";
                        var divDescription = document.createElement("div");
                        subrow.appendChild(divDescription);
                        description = dataJson.serviceDescription || description;
                        divDescription.innerHTML = description;
                        if(dataJson.layers && dataJson.layers.length > 0){
                            divDescription.innerHTML += "<p>Sub-layers (some might be disabled by default, use the layer list to enable them):</p><ul>";
                            var getLayerInfo = (inLayerId: string, allLayersInfo: any): string => {
                                var layerInfo = allLayersInfo.find((elt: any) => elt.id == inLayerId);
                                var result = "<li>" + layerInfo.name;
                                if(layerInfo.subLayerIds && layerInfo.subLayerIds.length > 0){
                                    result += "<ul>";
                                    for(var i = 0; i < layerInfo.subLayerIds.length; i++){
                                        result += getLayerInfo(layerInfo.subLayerIds[i], allLayersInfo);
                                    }
                                    result += "</ul>";
                                }
                                result += "</li>";
                                return result;
                            };
                            var rootLayers = dataJson.layers.filter((elt: any) => elt.parentLayerId == -1);
                            divDescription.innerHTML += "<ul>";
                            for(var j = 0; j < rootLayers.length; j++){
                                description = getLayerInfo(rootLayers[j].id, dataJson.layers);
                                divDescription.innerHTML += description;
                            }
                            divDescription.innerHTML += "</ul>";
                        }
                    });
                    
                }, (err) => {
                    // Error
                    subrow.innerHTML = "<hr>";
                    description = "Error while retrieving service information.";
                    var content = document.createElement("div");
                    content.classList.add("col-md-11");
                    content.innerHTML = description;
                    subrow.appendChild(content);
                });
            }
        }
    }

    /**
     * Adds a layer to the map and opens the layer list.
     */
    private addLayer = (layerId: string) => {
        this.map.switchLayerListVisibility(true);
        var btn = document.getElementById("layerListSwitch");
        if(btn){
            btn.className += " active";
            this.map.addLayer(layerId);
            var badgeAdd = <HTMLButtonElement>document.getElementById('badge-add-' + layerId);
            if(badgeAdd){
                badgeAdd.className = badgeAdd.className.replace('bg-light','bg-success');
                badgeAdd.classList.remove("text-dark");
                badgeAdd.disabled = true;
                badgeAdd.innerText = "Added";
            }
        }
    }

    /**
     * Adds a custom layer to the map. Custom layer must point to an URL hosted by a CORS enabled server.
     * @param {string} layerType    Type of the layer. Determines how to handle the form data.
     * @param {Object} formElements Form's values
     */
     private addCustomLayer = (layerType: string, formElements: any) => {
        var now = new Date();
        var layerId = "custom_" + now.toISOString().split('T')[1].split('Z')[0].replace(/:/g,'').replace(/\./g,'');

        if(layerType === "wms"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            this.map.addWMSLayer(layerId, layerName, layerUrl);
        }
        else if(layerType === "csv"){
            var layerUrl = formElements["layer-url"].value;
            var layerLatField = formElements["layer-latfield"].value;
            var layerLonField = formElements["layer-lonfield"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            this.map.addCSVLayer(layerId, layerUrl, layerLatField, layerLonField);
            $('#addLayerModal').modal('hide');
        }
        else if(layerType === "kml"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            this.map.addKMLLayer(layerId, layerName, layerUrl);
        }
        else if(layerType === "arcgis"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            this.map.addArcgisLayer(layerId, layerName, layerUrl);
        }
        // Displaying layer list
        this.map.switchLayerListVisibility(true);
        var btn = document.getElementById("layerListSwitch");
        if(btn){
            btn.className = "active";
        }
    }

    //#endregion
}

export default AddLayer;