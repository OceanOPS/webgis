define([
    "dojo/dom",
    "dojo/on",
    "dojo/query",
    "dojo/dom-construct", 
    "dojo/request",
    "dojo/NodeList-traverse"
], function(dom, on, query, domConstruct, request) {
    var self = {};

    // Private
    var app = null;
    var modalContents;
    var customTypes = [
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

    /**
     * Select a layer and displays its description. A button also appears aiming to add the layer to the map.
     * @param  {Object} panel Object where the row will be added
     * @param  {Object} layer Selected layer
     * @return {function}       The function
     */
    var changeSelectedLayer = function(panel, layer){
        var description = "No description set for this map service.";
        var subrow = query("#" + panel.id).children(".subrow-description")[0];
        subrow.innerHTML = "<hr>&nbsp;&nbsp;<span class=\"esri-icon-loader esri-icon-loading-indicator\" ></span>";
        request(
            layer.url.substr(0,layer.url.indexOf('MapServer') + "MapServer".length) + "?f=json", {
                headers: {
                    "X-Requested-With": null
                }
            }
        ).then(function(data){
            // Success
            subrow.innerHTML = "<hr>";
            var dataJson = JSON.parse(data);
            var divDescription = domConstruct.create("div", {class: ""}, subrow);
            description = dataJson.serviceDescription || description;
            divDescription.innerHTML = description;
            if(dataJson.layers && dataJson.layers.length > 0){
                divDescription.innerHTML += "<p>Sub-layers (some might be disabled by default, use the layer list to enable them):</p><ul>";
                var getLayerInfo = function(inLayerId, allLayersInfo){
                    var layerInfo = allLayersInfo.find(elt => elt.id == inLayerId);
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
                var rootLayers = dataJson.layers.filter(elt => elt.parentLayerId == -1);
                divDescription.innerHTML += "<ul>";
                for(var j = 0; j < rootLayers.length; j++){
                    description = getLayerInfo(rootLayers[j].id, dataJson.layers);
                    divDescription.innerHTML += description;
                }
                divDescription.innerHTML += "</ul>";
            }
        }, function(err){
            // Error
            subrow.innerHTML = "<hr>";
            description = "Error while retrieving service information.";
            domConstruct.create("div", {class: "col-md-11", innerHTML: description}, subrow);
        }, function(evt){
        // handle a progress event
        });
        
    }

    /**
     * Adds a layer to the map and opens the layer list.
     * @return {function}       The function
     */
    var addLayer = function(layerId){
        app.controllers.map.switchLayerListVisibility(true);
        var btn = dom.byId("layerListSwitch");
        btn.className += " active";
        app.controllers.map.addLayer(layerId);
        var badgeAdd = document.getElementById('badge-add-' + layerId);
        badgeAdd.className = badgeAdd.className.replace('badge-dark','badge-success');
        badgeAdd.innerText = "Added!";
    }

    /**
     * Adds a custom layer to the map. Custom layer must point to an URL hosted by a CORS enabled server.
     * @param {string} layerType    Type of the layer. Determines how to handle the form data.
     * @param {Object} formElements Form's values
     */
    var addCustomLayer = function(layerType, formElements){
        var now = new Date();
        var layerId = "custom_" + now.toISOString().split('T')[1].split('Z')[0].replace(/:/g,'').replace(/\./g,'');

        if(layerType === "wms"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            app.addCorsEnabledServer(a.hostname);
            app.controllers.map.addWMSLayer(layerId, layerName, layerUrl);
        }
        else if(layerType === "csv"){
            var layerUrl = formElements["layer-url"].value;
            var layerLatField = formElements["layer-latfield"].value;
            var layerLonField = formElements["layer-lonfield"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            app.addCorsEnabledServer(a.hostname);
            app.controllers.map.addCSVLayer(layerId, layerUrl, layerLatField, layerLonField);
            $('#addLayerModal').modal('hide');
        }
        else if(layerType === "kml"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            app.addCorsEnabledServer(a.hostname);
            app.controllers.map.addKMLLayer(layerId, layerName, layerUrl);
        }
        else if(layerType === "arcgis"){
            var layerName = formElements["layer-name"].value;
            var layerUrl = formElements["layer-url"].value;
            var a = document.createElement('a');
            a.href = layerUrl;
            app.addCorsEnabledServer(a.hostname);
            app.controllers.map.addArcgisLayer(layerId, layerName, layerUrl);
        }
        // Displaying layer list
        app.controllers.map.switchLayerListVisibility(true);
        var btn = dom.byId("layerListSwitch");
        btn.className = "active";
    }


    // Public
    self.init = function(appInstance){
        app = appInstance;
        modalContents = query('.modal-body', 'addLayerModal')[0];
        domConstruct.create("p", {innerHTML: "<div class=\"alert alert-info\" role=\"alert\">Click on a layer to show its description, double click to add it on the map.</div>"}, modalContents);
        var panelGroup = domConstruct.create("div", {id: "accordion"}, modalContents);

        // Getting layer lists
        var operationalLayerList = app.config.operationalLayers.filter(l => (app.settings.theme == l.theme || l.theme == app.config.THEME_ALL) && l.type !== app.config.TYPE_OBS_PTF);
        var otherLayerList = app.config.dynamicLayers.filter(l => app.settings.theme == app.config.THEME_ALL || app.settings.theme == l.theme || l.theme == app.config.THEME_ALL);

        // Filtering and ordering layer groups
        var layerGroups  = app.config.layerGroups.filter(lg => otherLayerList.map(l => l.group).includes(lg.id)).concat(app.config.layerGroups.filter(lg => operationalLayerList.map(l => l.group).includes(lg.id)));
        layerGroups = layerGroups.filter((lg, index, self) => index === self.findIndex((t) => ( t.id === lg.id )) );
        layerGroups = layerGroups.sort(function(a, b){
            return a.index - b.index;
        });
        var i = 0;
        // Adding Operational and Others sections
        layerGroups.forEach(function(item){
            var panel = domConstruct.create("div", {class: "card"}, panelGroup);
            var panelHeading = domConstruct.create("div", {class: "card-header", id: "heading-" + item.id,
                innerHTML: "<button class=\"btn btn-link btn-sm " + (i > 0 ? "collapsed": "") + "\" data-toggle=\"collapse\" data-target=\"#collapse-" + item.id + "\" aria-expanded=\"true\" aria-controls=\"collapse-" + item.id + "\">" + item.name + "</button>"
            }, panel);
            var panelBodyContainer = domConstruct.create("div", {class: "collapse " + (i === 0 ? "show": ""), "aria-labelledby": "heading-" + item.id, id: "collapse-" + item.id, "data-parent": "#accordion"}, panel);
            var panelBody = domConstruct.create("div", {class: "card-body", id: "body-" + item.id}, panelBodyContainer);
            var row = domConstruct.create("div", {class: "row"}, panelBody);

            var currentOtherLayers = otherLayerList.filter(l => l.group === item.id);
            currentOtherLayers.forEach(function(layer){
                var div = domConstruct.create("div", {class: "col-xs-6 col-md-3"}, row);
                var link = domConstruct.create("a", {href:"#", class: "thumbnail", innerHTML: "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' src='" + (layer.thumbnailUrl || "app/resources/img/layer-nopreview.jpg") + "' alt='" + layer.name + "'>"}, div);
                var badgeContainer = domConstruct.create("div", {class: "badges"}, link);
                var badgeInfo = domConstruct.create("a", {class: "badge badge-info", href: "#", innerHTML: "Get info"}, badgeContainer);
                var badgeAdd;
                var badgeAddId = "badge-add-" + layer.id;
                if(app.controllers.map.mapView.map.findLayerById(layer.id)){
                    badgeAdd = domConstruct.create("a", {id: badgeAddId, class: "badge badge-success disabled", href: "#", innerHTML: "Added!"}, badgeContainer);
                }
                else{
                    badgeAdd = domConstruct.create("a", {id: badgeAddId, class: "badge badge-dark", href: "#", innerHTML: "Add"}, badgeContainer);
                }
                domConstruct.create("p", {innerHTML: layer.name}, div);
                on(link, "click", function(){
                    changeSelectedLayer(panelBody, layer);
                });
                on(link, "dblclick", function(){
                    addLayer(layer.id);
                });
                on(badgeInfo, "click", function(){
                    changeSelectedLayer(panelBody, layer);
                });
                on(badgeAdd, "click", function(){
                    addLayer(layer.id);
                });
            });

            var currentOperationalLayers = operationalLayerList.filter(l => l.group === item.id);
            currentOperationalLayers.forEach(function(layer){
                if(!layer.hideFromCollection){
                    var div = domConstruct.create("div", {class: "col-xs-6 col-md-3"}, row);
                    var link = domConstruct.create("a", {href:"#", class: "thumbnail", innerHTML: "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' src='" + (layer.thumbnailUrl || "app/resources/img/layer-nopreview.jpg") + "' alt='" + layer.name + "'>"}, div);
                    var badgeContainer = domConstruct.create("div", {class: "badges"}, link);
                    var badgeInfo = domConstruct.create("a", {class: "badge badge-info", href: "#", innerHTML: "Get info"}, badgeContainer);
                    var badgeAdd;
                    var badgeAddId = "badge-add-" + layer.id;
                    if(app.controllers.map.mapView.map.findLayerById(layer.id)){
                        badgeAdd = domConstruct.create("a", {id: badgeAddId, class: "badge badge-success disabled", href: "#", innerHTML: "Added!"}, badgeContainer);
                    }
                    else{
                        badgeAdd = domConstruct.create("a", {id: badgeAddId, class: "badge badge-dark", href: "#", innerHTML: "Add"}, badgeContainer);
                    }
                    domConstruct.create("p", {innerHTML: layer.name}, div);
                    on(link, "click", function(){
                        changeSelectedLayer(panelBody, layer);
                    });
                    on(link, "dblclick", function(){
                        addLayer(layer.id);
                    });
                    on(badgeInfo, "click", function(){
                        changeSelectedLayer(panelBody, layer);
                    });
                    on(badgeAdd, "click", function(){
                        addLayer(layer.id);
                    });
                }
            });
            
            var subrow = domConstruct.create("div", {class: "subrow-description"}, panelBody);
            i++;
        });

        // Adding Custom layers section
        var panel = domConstruct.create("div", {class: "card"}, panelGroup);
        var panelHeading = domConstruct.create("div", {class: "card-header", id: "heading-custom",
            innerHTML: "<button class=\"btn btn-link btn-sm collapsed\" data-toggle=\"collapse\" data-target=\"#collapse-custom\" aria-expanded=\"true\" aria-controls=\"collapse-custom\">Custom layer</button>"
        }, panel);
        var panelBodyContainer = domConstruct.create("div", {class: "collapse ", "aria-labelledby": "heading-custom", id: "collapse-custom", "data-parent": "#accordion" }, panel);
        var panelBody = domConstruct.create("div", {class: "card-body", id: "body-custom"}, panelBodyContainer);
        var row = domConstruct.create("div", {class: "row"}, panelBody);
        var divLeft = domConstruct.create("div", {class: "col-md-3"}, row);
        var divRight = domConstruct.create("div", {class: "col-md-9"}, row);
        var layerTypeSelect = domConstruct.create("select", {id: "custom-layer-typeselect", name: "custom-layer-typeselect"}, divLeft);
        domConstruct.create("option", {value: null, innerHTML: "--", selected: "selected", disabled: "disabled"}, layerTypeSelect);
        customTypes.forEach(function(type){
            domConstruct.create("option", {value: type.id, innerHTML: type.name}, layerTypeSelect);
        }); 
        on(layerTypeSelect, "change", function(evt){
            divRight.innerHTML = "";
            var layerType = evt.target.options[evt.target.selectedIndex].value;
            var html = customTypes.find(t => t.id === layerType).formHTML;
            var form = domConstruct.create("form", {innerHTML: html}, divRight);
            var btn = domConstruct.create("button", {class: "btn btn-default", type:"button", innerHTML: "+"}, form);
            on(btn, "click", function(evtAdd){
                addCustomLayer(layerType, evtAdd.target.form.elements);
            });
        });

        // Adding basemaps section
        panel = domConstruct.create("div", {class: "card"}, panelGroup);
        panelHeading = domConstruct.create("div", {class: "card-header", id: "heading-basemaps",
            innerHTML: "<button class=\"btn btn-link btn-sm collapsed\" data-toggle=\"collapse\" data-target=\"#collapse-basemaps\" aria-expanded=\"true\" aria-controls=\"collapse-basemaps\">Change basemap</button>"
        }, panel);
        panelBodyContainer = domConstruct.create("div", {class: "collapse ", "aria-labelledby": "heading-basemaps", id: "collapse-basemaps", "data-parent": "#accordion" }, panel);
        panelBody = domConstruct.create("div", {class: "card-body", id: "body-basemaps"}, panelBodyContainer);
        domConstruct.create("p", {innerHTML: "You can only add one basemap at a time: changing it will replace the current one in use."}, panelBody);
        domConstruct.create("p", {innerHTML: "<div class=\"alert alert-warning\" role=\"alert\">External basemaps might not support all the projections.</div>"}, panelBody);
        row = domConstruct.create("div", {class: "row"}, panelBody);
        app.config.basemaps.forEach(function(basemap){
            var div = domConstruct.create("div", {class: "col-xs-6 col-md-3"}, row);
            var linkUrl;
            if(basemap.basemap.thumbnailUrl){
                linkUrl = basemap.basemap.thumbnailUrl;
            }
            else if(basemap.thumbnailUrl){
                linkUrl = basemap.thumbnailUrl;
            }
            else{
                linkUrl = 'app/resources/img/none.jpg';
            }
            link = domConstruct.create("a", {href:"#", class: "thumbnail", innerHTML: "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' src='" + linkUrl + "' alt='" + basemap.basemap.title + "'>"}, div);
            domConstruct.create("p", {innerHTML: basemap.basemap.title}, div);
            on(link, "click", function(evt){
                app.settings.setBasemap(basemap.wkid);
            });
        });
        var div = domConstruct.create("div", {class: "col-xs-6 col-md-3", innerHTML: ""}, row);
        var link = domConstruct.create("a", {href:"#", class: "thumbnail", innerHTML: "<img class='img-thumbnail mx-auto d-block basemap-thumbnail' alt='None' src='app/resources/img/none.jpg'>"}, div);
        domConstruct.create("p", {innerHTML: "None"}, div);
        on(link, "click", function(evt){
            app.settings.setBasemap(null);
        });

    }

    return self;
});
