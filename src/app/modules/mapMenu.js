define([
    "dojo/dom",
    "dojo/on",
    "dojo/query",
    "dojo/dom-construct",
    "esri/widgets/Expand",
    "app/modules/addLayerModal",
    "app/modules/identifyTool",
    "app/modules/queryElevationTool",
    "app/modules/selectionTool",
    "app/modules/animationRotateTool",
    "app/modules/animationWaypointTool",
    "app/modules/playground3D",
    "app/modules/logoTool",
    "app/modules/bathyExaggerationTool",
    "app/modules/editTool",
    "app/modules/ScreenshotTool",
    "app/modules/heightTool"
], function(dom, on, query, domConstruct, Expand, addLayerModal, 
        identifyTool, queryElevationTool, 
        selectionTool, animationRotateTool, 
        animationWaypointTool, playground3D,
        logoTool, bathyExaggerationTool, editTool, ScreenshotTool, heightTool) {
    var self = {};

    // Private
    var app = null;
    // Expand widget for tools
    var expandToolsWidget = null;
    
    var setActive = function(target, isActive){
        if(isActive){
            target.classList.add("active");
        }
        else{
            target.classList.remove("active");
        }
    }

    // Public
    self.nbActiveTools = 0;
    // Time slider button 
    self.timeToolLink = domConstruct.create("div", {
        id: "timeToolToggle",
        title: "Time slider",
        role: "button",
        class: "esri-widget--button esri-widget esri-interactive",
        innerHTML: "<span class=\"esri-icon esri-icon-time-clock\" aria-label=\"time icon\"></span>"
    });
    self.init = function(appInstance){
        app = appInstance;

        // Menu items initialization
        // Add Layer modal
        addLayerModal.init(app);

        var projectionHtml = domConstruct.create("div",{
            class: "card"
        });
        for(var i = 0; i<app.config.projections.length;i++){
            let projection = app.config.projections[i];
            let link = domConstruct.create("a", {
                id: "projection-" + projection.ref,
                class: "dropdown-item",
                href: "#",
                innerHTML: projection.name
            }, projectionHtml);
            on(link, "click", function(){
                app.settings.setProjection(projection.ref);
            });
        }
        var projectionBtn = new Expand({
            expandIconClass: "esri-icon-globe",
            expandTooltip: "Change the projection of the map",
            group: "top-left-expands",
            autoCollapse: true,
            view: app.controllers.map.mapView,
            content: projectionHtml
        });
            
        var layerManagementHtml = domConstruct.create("div",{
            class: "card"
        });
        var layerSwitch = domConstruct.create("a", {
            id: "layerListSwitch",
            href: "#",
            class: "dropdown-item",
            title: "Open the list of layers currently added to the map",
            innerHTML: "<span class=\"esri-icon esri-icon-layer-list\" aria-label=\"layer list icon\"></span> layer list & legend"
        }, layerManagementHtml);

        
        var addLayer = domConstruct.create("a", {
            id: "addLayerLink",
            href: "#",
            class: "dropdown-item",
            title: "Browse and add layers to the map",
            "data-toggle": "modal",
            "data-target": "#addLayerModal",
            innerHTML: "<span ria-hidden=\"true\" class=\"esri-icon esri-icon-basemap\"></span> add layer"
        }, layerManagementHtml);
           
        // MORE TOOLS
        var moreToolsHtml = domConstruct.create("div",{
            id: "moreToolsContent",
            class: "card"
        });
        
        var editLink = null;
        if(app.settings.isWebsiteVersion || debug){
            editLink = domConstruct.create("a", {
                id: "editLink",
                href: "#",
                class: "dropdown-item",
                title: "Draw a point or a line and submit it alongside with metadata as a platform or a cruise",
                innerHTML: "<span class=\"esri-icon esri-icon-edit\" aria-label=\"edit icon\"></span> edit"
            }, moreToolsHtml);
        }

        var identifyLink = domConstruct.create("a", {
            id: "identifyLink",
            href: "#",
            class: "dropdown-item",
            title: "For non operational layers, query the value below the cursor",
            innerHTML: "<span class=\"esri-icon esri-icon-description\" aria-label=\"identify icon\"></span> identify"
        }, moreToolsHtml);

        var heightLink = domConstruct.create("a", {
            id: "heightLink",
            href: "#",
            class: "dropdown-item",
            title: "Add a filter to the operational layers having height/depth information",
            innerHTML: "<span class=\"esri-icon esri-icon-filter\" aria-label=\"height icon\"></span> height/depth filter"
        }, moreToolsHtml);
        
        /*var timeToolLink = domConstruct.create("a", {
            id: "timeToolLink",
            href: "#",
            class: "dropdown-item",
            title: "",
            innerHTML: "<span class=\"esri-icon esri-icon-time-clock\" aria-label=\"time icon\"></span> time slider"
        }, moreToolsHtml);*/
        on(self.timeToolLink, "click", function(evt){            
            if(app.controllers.map.isTimeWidgetActivated()){
                app.controllers.map.activateTimeWidget(false);
                setActive(evt.target, false);
            }
            else{
                app.controllers.map.activateTimeWidget(true);
                setActive(evt.target, true);
            }
        });
        
        var screenshotLink = domConstruct.create("a", {
            id: "screenshotLink",
            href: "#",
            class: "dropdown-item",
            title: "Take a screenshot",
            innerHTML: "<span class=\"esri-icon esri-icon-media\" aria-label=\"identify icon\"></span> screenshot"
        }, moreToolsHtml);

        var link = domConstruct.create("a", {
            id: "printLink",
            href: "#",
            class: "dropdown-item",
            title: "Print the map into a preset template, or just as a simple map",
            innerHTML: "<span class=\"esri-icon esri-icon-printer\" aria-label=\"print icon\"></span> print"
        }, moreToolsHtml);
        on(link, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activatePrintWidget(false);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activatePrintWidget(true);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });

        link = domConstruct.create("a", {
            id: "coordinatesLink",
            href: "#",
            class: "dropdown-item",
            title: "Display, convert and copy coordinates",
            innerHTML: "<span class=\"esri-icon esri-icon-applications\" aria-label=\"coordinates icon\"></span> coordinates"
        }, moreToolsHtml);
        on(link, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCoordinatesWidget(false);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCoordinatesWidget(true);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });
        
        link = domConstruct.create("a", {
            id: "queryElevationLink",
            href: "#",
            class: "dropdown-item",
            title: "Use this tool the query the map for elevation or depth values (by clicking anywhere on the map)",
            innerHTML: "<span class=\"esri-icon esri-icon-arrow-up\" aria-label=\"query elevation icon\"></span> query elevation"
        }, moreToolsHtml);
        on(link, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCustomWidget(false, queryElevationTool);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCustomWidget(true, queryElevationTool);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });

        var menuItem = domConstruct.create("span", {
            class: "dropdown-item",
        }, moreToolsHtml);
        link = domConstruct.create("a", {
            id: "selectionLink",
            class: "no-decoration",
            href: "#",
            title: "Use this tool to select features based on area or attribute queries",
            innerHTML: "<span class=\"esri-icon esri-icon-cursor\" aria-label=\"selection icon\"></span> select&nbsp;&nbsp;"
        }, menuItem);
        on(link, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCustomWidget(false, selectionTool);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCustomWidget(true, selectionTool);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });
        if(!app.settings.isWebsiteVersion){
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
        }

        if(app.settings.projection == "3D"){
            domConstruct.create("hr", {}, moreToolsHtml);

            link = domConstruct.create("a", {
                id: "playground3DLink",
                href: "#",
                class: "dropdown-item",
                title: "Facilitate the 3D navigation",
                innerHTML: "<span class=\"esri-icon esri-icon-navigation\" aria-label=\"3D playground icon\"></span> 3D playground"
            }, moreToolsHtml);
            on(link, "click", function(evt){
                if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, playground3D);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, playground3D);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }
            });

            link = domConstruct.create("a", {
                id: "animationRotateLink",
                href: "#",
                class: "dropdown-item",
                title: "Use this tool to customize and start a rotating animation",
                innerHTML: "<span class=\"esri-icon esri-icon-play-circled\" aria-label=\"animation rotate icon\"></span> animate view (rotate)"
            }, moreToolsHtml);
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
            });

            link = domConstruct.create("a", {
                id: "animationWaypointLink",
                href: "#",
                class: "dropdown-item",
                title: "Use this tool to customize and start a waypoint animation",
                innerHTML: "<span class=\"esri-icon esri-icon-play\" aria-label=\"animation waypoint icon\"></span> animate view (waypoints)"
            }, moreToolsHtml);
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
            });

            domConstruct.create("hr", {}, moreToolsHtml);
            link = domConstruct.create("a", {
                id: "exagerationBathyLink",
                href: "#",
                class: "dropdown-item",
                title: "Use this tool to modify how the bathymetry is exagerated",
                innerHTML: "<span class=\"esri-icon esri-icon-up-down-arrows\" aria-label=\"exaggeration icon\"></span> change bathymetry exaggeration"
            }, moreToolsHtml);
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
            });
        }

        
        link = domConstruct.create("a", {
            id: "logoLink",
            href: "#",
            class: "dropdown-item",
            title: "Use this tool to add a logo to the map",
            innerHTML: "<span class=\"esri-icon esri-icon-media\" aria-label=\"logo icon\"></span> add logo"
        }, moreToolsHtml);
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
        });
        
        var menuItem = domConstruct.create("span", {
            class: "dropdown-item",
        }, moreToolsHtml);
        domConstruct.create("span", {
            title: "Select one of the options below",
            innerHTML: "<span class=\"esri-icon esri-icon-expand2\" aria-label=\"measure icon\"></span> measure&nbsp;&nbsp;"
        }, menuItem);
        var btnGroup = domConstruct.create("div", {
            id: "measurementLink",
            class: "btn-group",
            role: "group",
            title: "Use this tool to measure distances and areas"
        }, menuItem);
        link = domConstruct.create("button", {
            type: "button",
            class: "btn btn-sm",
            innerHTML: "<span class=\"esri-icon esri-icon-polyline\" aria-label=\"measure icon\"></span>"
        }, btnGroup);
        on(link, "click", function(evt){
            if(evt.target.parentElement.classList.contains("active")){
                app.controllers.map.activateMeasurementsWidget(false, "distance");
                setActive(evt.target.parentElement, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateMeasurementsWidget(true, "distance");
                setActive(evt.target.parentElement, true);
                self.updateExpandLabelTools();
            }
        });
        link = domConstruct.create("button", {
            class: "btn btn-sm",
            title: "Use this tool to measure areas",
            innerHTML: "<span class=\"esri-icon esri-icon-polygon\" aria-label=\"measure icon\"></span>"
        }, btnGroup);
        on(link, "click", function(evt){
            if(evt.target.parentElement.classList.contains("active")){
                app.controllers.map.activateMeasurementsWidget(false, "area");
                setActive(evt.target.parentElement, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateMeasurementsWidget(true, "area");
                setActive(evt.target.parentElement, true);
                self.updateExpandLabelTools();
            }
        });
                
        expandToolsWidget = new Expand({
            expandIconClass: "esri-icon-handle-horizontal",
            expandTooltip: "More tools",
            group: "top-left-expands",
            autoCollapse: true,
            view: app.controllers.map.mapView,
            content: moreToolsHtml
        });

        
        var layerManagement = new Expand({
            expandIconClass: "esri-icon-layers",
            expandTooltip: "Layers",
            group: "top-left-expands",
            autoCollapse: true,
            view: app.controllers.map.mapView,
            content: layerManagementHtml
        });

        app.controllers.map.mapView.ui.add([projectionBtn, layerManagement, expandToolsWidget], "top-left");

        // Menu item events
        on(identifyLink, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCustomWidget(false, identifyTool);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCustomWidget(true, identifyTool);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });

        on(heightLink, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateCustomWidget(false, heightTool);
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateCustomWidget(true, heightTool);
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });

        on(screenshotLink, "click", function(evt){
            if(evt.target.classList.contains("active")){
                app.controllers.map.activateScreenshotTool();
                setActive(evt.target, false);
                self.updateExpandLabelTools();
            }
            else{
                app.controllers.map.activateScreenshotTool();
                setActive(evt.target, true);
                self.updateExpandLabelTools();
            }
        });
        
        on(layerSwitch, "click", function(evt){
            var layerList = document.getElementsByClassName("esri-layer-list")[0];
            if(layerList){
                app.controllers.map.switchLayerListVisibility(false);
                setActive(evt.target, false);
            }
            else{
                app.controllers.map.switchLayerListVisibility(true);
                setActive(evt.target, true);
            }
        });

        if(editLink){
            on(editLink, "click", function(evt){
                if(evt.target.classList.contains("active")){
                    app.controllers.map.activateCustomWidget(false, editTool);
                    setActive(evt.target, false);
                    self.updateExpandLabelTools();
                }
                else{
                    app.controllers.map.activateCustomWidget(true, editTool);
                    setActive(evt.target, true);
                    self.updateExpandLabelTools();
                }
            });
        }
    };
    

    /**
     * Activates a menu entry based on its HTML ID
     * @param {*} menuId The HTML identifier
     * @param {*} active True to activate, false to deactivate
     */
    self.activateMenuItem = function(menuId, active){
        var elt = document.getElementById(menuId);
        if(elt){
            setActive(elt, active);
            self.updateExpandLabelTools();
        }
    }
    
    /**
     * Adds/removes the icon number to the tool expand button
     */
    self.setExpandLabelTools = function(number){
        expandToolsWidget.iconNumber = number;
        // Collapse expand menu after click
        expandToolsWidget.collapse();
    }

    /**
     * Adds/removes the icon number to the tool expand button
     */
    self.updateExpandLabelTools = function(){
        self.nbActiveTools = 0;
        document.getElementById('moreToolsContent').querySelectorAll("a").forEach(function(elt){
            if(elt.classList.contains("active")){
                self.nbActiveTools++;
            }
        });
        expandToolsWidget.iconNumber = self.nbActiveTools;
        // Collapse expand menu after click
        expandToolsWidget.collapse();
    }

    return self;
});
