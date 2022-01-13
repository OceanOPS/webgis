import Config from "./Config";
import GISMap from "./Map";
import Expand from "@arcgis/core/widgets/Expand";
import Utils from "./Utils";
import AddLayer from "./AddLayer";
import {Modal} from 'bootstrap';

class MapMenu{
    private expandToolsWidget: Expand;
    private nbActiveTools: number = 0;
    private map: GISMap;

    constructor(mapInstance: GISMap){
        this.map = mapInstance;
        new AddLayer(this.map);

        var projectionHtml = document.createElement("div");
        projectionHtml.classList.add("card");

        for(var i = 0; i<Config.projections.length;i++){
            let projection = Config.projections[i];
            let link = document.createElement("a");
            link.id = "projection-" + projection.ref;
            link.classList.add("dropdown-item");
            link.href = "#";
            link.innerHTML = projection.name;
            projectionHtml.appendChild(link);
            link.onclick = () => {
                this.map.setProjection(projection.ref);
            };
        }
        var projectionBtn = new Expand({
            expandIconClass: "esri-icon-globe",
            expandTooltip: "Change the projection of the map",
            group: "top-left-expands",
            autoCollapse: true,
            view: this.map.mapView,
            content: projectionHtml
        });
            
        var layerManagementHtml = document.createElement("div");
        layerManagementHtml.classList.add("card");
        var layerSwitch = document.createElement("a");
        layerSwitch.id = "layerListSwitch";
        layerSwitch.href = "#";
        layerSwitch.classList.add("dropdown-item");
        layerSwitch.title = "Open the list of layers currently added to the map";
        layerSwitch.innerHTML = "<span class=\"esri-icon esri-icon-layer-list\" aria-label=\"layer list icon\"></span> layer list & legend";
        layerManagementHtml.appendChild(layerSwitch);        
        layerSwitch.onclick = (evt: any) => {
            var layerList = document.getElementsByClassName("esri-layer-list")[0];
            if(layerList){
                this.map.switchLayerListVisibility(false);
                this.setActive(evt.target, false);
            }
            else{
                this.map.switchLayerListVisibility(true);
                this.setActive(evt.target, true);
            }
        };
        
        var addLayer = document.createElement("a");
        addLayer.id = "addLayerLink";
        addLayer.href = "#";
        addLayer.classList.add("dropdown-item");
        addLayer.title = "Browse and add layers to the map";
        addLayer.innerHTML = "<span ria-hidden=\"true\" class=\"esri-icon esri-icon-basemap\"></span> add layer";
        layerManagementHtml.appendChild(addLayer);
        addLayer.onclick = () => {
            var modal = new Modal("#addLayerModal");
            modal.show();
        }
           
        // MORE TOOLS
        var moreToolsHtml = document.createElement("div");
        moreToolsHtml.classList.add("card");
        moreToolsHtml.id = "moreToolsContent";
        
        
        if(Utils.isWebsiteVersion() || window["debug"]){   
            var editLink = null;         
            editLink = document.createElement("a");
            editLink.id = "editLink";
            editLink.href = "#";
            editLink.classList.add("dropdown-item");
            editLink.title = "Draw a point or a line and submit it alongside with metadata as a platform or a cruise";
            editLink.innerHTML = "<span class=\"esri-icon esri-icon-edit\" aria-label=\"edit icon\"></span> edit";
            moreToolsHtml.appendChild(editLink);            
            editLink.onclick = (evt: any) => {
                this.map.activateEditGraphic();
                this.setActive(evt.target, this.map.isEditGraphicDisplayed());                
                this.updateExpandLabelTools();
            };
        }

        var identifyLink = document.createElement("a");
        identifyLink.id = "identifyLink";
        identifyLink.href = "#";
        identifyLink.classList.add("dropdown-item");
        identifyLink.title = "For non operational layers, query the value below the cursor";
        identifyLink.innerHTML = "<span class=\"esri-icon esri-icon-description\" aria-label=\"identify icon\"></span> identify";
        moreToolsHtml.appendChild(identifyLink);
        identifyLink.onclick = (evt: any) => {
            this.map.activateIdentify();
            this.setActive(evt.target, this.map.isIdentifyDisplayed());
            this.updateExpandLabelTools();
        };

        var heightLink = document.createElement("a");
        heightLink.id = "heightLink";
        heightLink.href = "#";
        heightLink.classList.add("dropdown-item");
        heightLink.title = "Add a filter to the operational layers having height/depth information";
        heightLink.innerHTML = "<span class=\"esri-icon esri-icon-filter\" aria-label=\"height icon\"></span> height/depth filter";
        moreToolsHtml.appendChild(heightLink);
        heightLink.onclick = (evt: any) => {
            this.map.activateHeightFilter();
            this.setActive(evt.target, this.map.isHeightFilterDisplayed());
            this.updateExpandLabelTools();
        };
        
        var screenshotLink = document.createElement("a");
        screenshotLink.id = "screenshotLink";
        screenshotLink.href = "#";
        screenshotLink.classList.add("dropdown-item");
        screenshotLink.title = "Take a screenshot";
        screenshotLink.innerHTML = "<span class=\"esri-icon esri-icon-media\" aria-label=\"identify icon\"></span> screenshot";
        moreToolsHtml.appendChild(screenshotLink);
        screenshotLink.onclick = (evt: any) => {
            if(evt.target.classList.contains("active")){
                this.map.activateScreenshotTool();
                this.setActive(evt.target, false);
                this.updateExpandLabelTools();
            }
            else{
                this.map.activateScreenshotTool();
                this.setActive(evt.target, true);
                this.updateExpandLabelTools();
            }
        };

        
        var printLink = document.createElement("a");
        printLink.id = "printLink";
        printLink.href = "#";
        printLink.classList.add("dropdown-item");
        printLink.title = "Print the map into a preset template, or just as a simple map";
        printLink.innerHTML = "<span class=\"esri-icon esri-icon-printer\" aria-label=\"print icon\"></span> print";
        moreToolsHtml.appendChild(printLink);
        printLink.onclick = (evt: any) => {
            if(evt.target.classList.contains("active")){
                this.map.activatePrintWidget(false);
                this.setActive(evt.target, false);
                this.updateExpandLabelTools();
            }
            else{
                this.map.activatePrintWidget(true);
                this.setActive(evt.target, true);
                this.updateExpandLabelTools();
            }
        };

        var coordinatesLink = document.createElement("a");
        coordinatesLink.id = "coordinatesLink";
        coordinatesLink.href = "#";
        coordinatesLink.classList.add("dropdown-item");
        coordinatesLink.title = "Display, convert and copy coordinates";
        coordinatesLink.innerHTML = "<span class=\"esri-icon esri-icon-applications\" aria-label=\"coordinates icon\"></span> coordinates";
        moreToolsHtml.appendChild(coordinatesLink);
        coordinatesLink.onclick = (evt: any) => {
            if(evt.target.classList.contains("active")){
                this.map.activateCoordinatesWidget(false);
                this.setActive(evt.target, false);
                this.updateExpandLabelTools();
            }
            else{
                this.map.activateCoordinatesWidget(true);
                this.setActive(evt.target, true);
                this.updateExpandLabelTools();
            }
        };
        
        var queryElevationLink = document.createElement("a");
        queryElevationLink.id = "queryElevationLink";
        queryElevationLink.href = "#";
        queryElevationLink.classList.add("dropdown-item");
        queryElevationLink.title = "Use this tool the query the map for elevation or depth values (by clicking anywhere on the map)";
        queryElevationLink.innerHTML = "<span class=\"esri-icon esri-icon-arrow-up\" aria-label=\"query elevation icon\"></span> query elevation";
        moreToolsHtml.appendChild(queryElevationLink);
        queryElevationLink.onclick = (evt: any) => {
            if(evt.target.classList.contains("active")){
                //@todo this.map.activateCustomWidget(false, queryElevationTool);
                this.setActive(evt.target, false);
                this.updateExpandLabelTools();
            }
            else{
                //@todo this.map.activateCustomWidget(true, queryElevationTool);
                this.setActive(evt.target, true);
                this.updateExpandLabelTools();
            }
        };

        // Selection tools sub container
        var menuItem = document.createElement("span");
        menuItem.classList.add("dropdown-item");
        moreToolsHtml.appendChild(menuItem);

        var selectionLink = document.createElement("a");
        selectionLink.id = "selectionLink";
        selectionLink.href = "#";
        selectionLink.classList.add("no-decoration");
        selectionLink.title = "Use this tool to select features based on area or attribute queries";
        selectionLink.innerHTML = "<span class=\"esri-icon esri-icon-cursor\" aria-label=\"selection icon\"></span> select&nbsp;&nbsp;";
        menuItem.appendChild(selectionLink);
        
        selectionLink.onclick = (evt: any) => {
            if(evt.target.classList.contains("active")){
                //@todo this.map.activateCustomWidget(false, selectionTool);
                this.setActive(evt.target, false);
                this.updateExpandLabelTools();
            }
            else{
                //@todo this.map.activateCustomWidget(true, selectionTool);
                this.setActive(evt.target, true);
                this.updateExpandLabelTools();
            }
        };
        /*if(!Utils.isWebsiteVersion()){
            var btnGroup = domConstruct.create("div", {
                id: "selectionLinkOptions",
                class: "btn-group",
                role: "group"
            }, menuItem);
            link = domConstruct.create("button", {
                type: "button",
                class: "btn btn-sm",
                innerHTML: "<span class=\"esri-icon esri-icon-table\" aria-label=\"attributes table\"></span>",
                title: "Show selection's attributes"
            }, btnGroup);
            on(link, "click", function(){
                selectionTool.showAttributesTable();
            });
        }*/

        if(this.map.getProjection() == "3D"){
            moreToolsHtml.appendChild(document.createElement("hr"));
            
            var playground3DLink = document.createElement("a");
            playground3DLink.id = "playground3DLink";
            playground3DLink.href = "#";
            playground3DLink.classList.add("dropdown-item");
            playground3DLink.title = "Facilitate the 3D navigation";
            playground3DLink.innerHTML = "<span class=\"esri-icon esri-icon-navigation\" aria-label=\"3D playground icon\"></span> 3D playground";
            moreToolsHtml.appendChild(playground3DLink);
            playground3DLink.onclick = (evt: any) => {
                // @todo
                /*if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, playground3D);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, playground3D);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }*/
            };

            var animationRotateLink = document.createElement("a");
            animationRotateLink.id = "animationRotateLink";
            animationRotateLink.href = "#";
            animationRotateLink.classList.add("dropdown-item");
            animationRotateLink.title = "Use this tool to customize and start a rotating animation";
            animationRotateLink.innerHTML = "<span class=\"esri-icon esri-icon-play-circled\" aria-label=\"animation rotate icon\"></span> animate view (rotate)";
            moreToolsHtml.appendChild(animationRotateLink);
            /*@todo
            on(link, "click", function(evt){
                if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, animationRotateTool);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, animationRotateTool);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }
            });*/
            
            var animationWaypointLink = document.createElement("a");
            animationWaypointLink.id = "animationWaypointLink";
            animationWaypointLink.href = "#";
            animationWaypointLink.classList.add("dropdown-item");
            animationWaypointLink.title = "Use this tool to customize and start a waypoint animation";
            animationWaypointLink.innerHTML = "<span class=\"esri-icon esri-icon-play\" aria-label=\"animation waypoint icon\"></span> animate view (waypoints)";
            moreToolsHtml.appendChild(animationWaypointLink);
            /*@todo
            on(link, "click", function(evt){
                if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, animationWaypointTool);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, animationWaypointTool);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }
            });*/

            moreToolsHtml.appendChild(document.createElement("hr"));

            var exagerationBathyLink = document.createElement("a");
            exagerationBathyLink.id = "exagerationBathyLink";
            exagerationBathyLink.href = "#";
            exagerationBathyLink.classList.add("dropdown-item");
            exagerationBathyLink.title = "Use this tool to modify how the bathymetry is exagerated";
            exagerationBathyLink.innerHTML = "<span class=\"esri-icon esri-icon-up-down-arrows\" aria-label=\"exaggeration icon\"></span> change bathymetry exaggeration";
            moreToolsHtml.appendChild(exagerationBathyLink);
            /*@todo
            on(link, "click", function(evt){
                if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, bathyExaggerationTool);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, bathyExaggerationTool);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }
            });*/
        }

        var logoLink = document.createElement("a");
        logoLink.id = "logoLink";
        logoLink.href = "#";
        logoLink.classList.add("dropdown-item");
        logoLink.title = "Use this tool to add a logo to the map";
        logoLink.innerHTML = "<span class=\"esri-icon esri-icon-media\" aria-label=\"logo icon\"></span> add logo";
        moreToolsHtml.appendChild(logoLink);
        /*@todo
        on(link, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCustomWidget(false, logoTool);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCustomWidget(true, logoTool);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });*/
        
        menuItem = document.createElement("span");
        menuItem.classList.add("dropdown-item");
        moreToolsHtml.appendChild(menuItem);
        
        var subspan = document.createElement("span");
        subspan.title = "Select one of the options below";
        subspan.innerHTML = "<span class=\"esri-icon esri-icon-expand2\" aria-label=\"measure icon\"></span> measure&nbsp;&nbsp;";
        menuItem.appendChild(subspan);

        var btnGroup = document.createElement("div");
        btnGroup.id = "measurementLink";
        btnGroup.classList.add("btn-group");
        btnGroup.setAttribute("role", "group");
        btnGroup.title = "Use this tool to measure distances and areas";
        menuItem.appendChild(btnGroup);
        
        var subBtn = document.createElement("button");
        subBtn.type = "button";
        subBtn.classList.add("btn");
        subBtn.classList.add("btn-sm");
        subBtn.title = "Use this tool to measure distances";
        subBtn.innerHTML = "<span class=\"esri-icon esri-icon-polyline\" aria-label=\"measure icon\"></span>";
        btnGroup.appendChild(subBtn);
        subBtn.onclick = (evt: any) => {
            if(evt.target.parentElement.classList.contains("active")){
                this.map.activateMeasurementsWidget(false, "distance");
                this.setActive(evt.target.parentElement, false);
                this.updateExpandLabelTools();
            }
            else{
                this.map.activateMeasurementsWidget(true, "distance");
                this.setActive(evt.target.parentElement, true);
                this.updateExpandLabelTools();
            }
        };
        subBtn = document.createElement("button");
        subBtn.type = "button";
        subBtn.classList.add("btn");
        subBtn.classList.add("btn-sm");
        subBtn.title = "Use this tool to measure areas";
        subBtn.innerHTML = "<span class=\"esri-icon esri-icon-polygon\" aria-label=\"measure icon\"></span>";
        btnGroup.appendChild(subBtn);
        subBtn.onclick = (evt: any) => {
            if(evt.target.parentElement.classList.contains("active")){
                this.map.activateMeasurementsWidget(false, "area");
                this.setActive(evt.target.parentElement, false);
                this.updateExpandLabelTools();
            }
            else{
                this.map.activateMeasurementsWidget(true, "area");
                this.setActive(evt.target.parentElement, true);
                this.updateExpandLabelTools();
            }
        };
                
        this.expandToolsWidget = new Expand({
            expandIconClass: "esri-icon-handle-horizontal",
            expandTooltip: "More tools",
            group: "top-left-expands",
            autoCollapse: true,
            view: this.map.mapView,
            content: moreToolsHtml
        });

        
        var layerManagement = new Expand({
            expandIconClass: "esri-icon-layers",
            expandTooltip: "Layers",
            group: "top-left-expands",
            autoCollapse: true,
            view: this.map.mapView,
            content: layerManagementHtml
        });

        this.map.mapView.ui.add([projectionBtn, layerManagement, this.expandToolsWidget], "top-left");
    }

    /**
     * Activates a menu entry based on its HTML ID
     * @param {*} menuId The HTML identifier
     * @param {*} active True to activate, false to deactivate
     */
    public activateMenuItem = (menuId: string, active: boolean) => {
        var elt = document.getElementById(menuId);
        if(elt){
            this.setActive(elt, active);
            this.updateExpandLabelTools();
        }
    }
    
    /**
     * Adds/removes the icon number to the tool expand button
     */
    public setExpandLabelTools = (number: number) => {
        this.expandToolsWidget.iconNumber = number;
        // Collapse expand menu after click
        this.expandToolsWidget.collapse();
    }

    /**
     * Adds/removes the icon number to the tool expand button
     */
    public updateExpandLabelTools = () => {
        this.nbActiveTools = 0;
        var moreTools = document.getElementById('moreToolsContent')
        if(moreTools){
            moreTools.querySelectorAll("a").forEach((elt) => {
                if(elt.classList.contains("active")){
                    this.nbActiveTools++;
                }
            });
        }
        this.expandToolsWidget.iconNumber = this.nbActiveTools;
        // Collapse expand menu after click
        this.expandToolsWidget.collapse();
    }


    private setActive = (target: HTMLElement, isActive: boolean) => {
        if(isActive){
            target.classList.add("active");
        }
        else{
            target.classList.remove("active");
        }
    }

}

export default MapMenu;