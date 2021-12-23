define([
    "esri/layers/FeatureLayer",
    "esri/tasks/QueryTask", 
    "esri/rest/support/Query",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Sketch/SketchViewModel",
    "dgrid/OnDemandGrid",
    "dgrid/extensions/ColumnHider",
    "dgrid/Selection",
    "dojo/store/Memory",
    "dstore/legacy/StoreAdapter",
    "esri/geometry/geometryEngine",
    "dojo/_base/declare"
], function(FeatureLayer, QueryTask, Query, GraphicsLayer, SketchViewModel, OnDemandGrid, ColumnHider, Selection, Memory, StoreAdapter, geometryEngine, declare) {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the map module
    var map = null;
    var app = null;
    var highlight = {};
    var attributeSelectionButton = null;
    var graphicalSelectionButton = null;
    var layer = null;
    var selectionGraphicsLayer = new GraphicsLayer({
        title: "Selection layer"
    });
    var dataStore = null;
    var attributesTable = null;
    /*
    *   Perform a query against the selected layer
    */
    var performQueryByAttribute = function(whereClause){
        var query = layer.createQuery();
        query.where += " AND " + whereClause;
        var layerView = map.mapView.allLayerViews.find(v => v.layer.id === layer.id);
        layer.queryFeatures(query).then(function(results){
            // remove existing highlighted features
            if (highlight) {
                highlight.remove();
            }
            results.features.forEach(function(feature){
                highlight = layerView.highlight(feature);
            });
            dataStore = results.features.map(f => f.attributes);
            sendSelectionToDashboard();
        }).otherwise(function(e){
            console.error(e)
        });
    }

    /**
     * Performs a geograpchical query against the selected layer
     */
    var activateGraphicalSelection = function(){
        // create a new sketch view model
        var sketchViewModel = new SketchViewModel({
            view: map.mapView,
            layer: map.sketchLayer,
            polygonSymbol: { // symbol used for polygons
                type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
                color: "rgba(64,141,243, 0.8)",
                style: "solid",
                outline: {
                    color: "white",
                    width: 1
                }
            }
        });
        sketchViewModel.on("create", function(evt) {
            if(evt.state === "complete"){
                var geom = evt.graphic.geometry;
                var query = {
                    geometry: geom,
                    outFields: ["*"],
                    where: layer.definitionExpression
                };
                map.mapView.whenLayerView(layer).then(function (layerView) {
                    layerView.queryFeatures({
                        geometry: geom,
                        spatialRelationship: 'intersects',
                        returnGeometry: true
                    }).then(function(results) {
                        var graphics = results.features;
                        selectionGraphicsLayer.removeAll();
                        if (graphics.length > 0) {
                            document.getElementById("featureCount").innerHTML = "<b>Showing attributes for " + graphics.length.toString() + " features </b>";
                            
                            //map.mapView.goTo(geom.extent.expand(2));
                            document.getElementById("grid").style.zIndex = 80;
                            // remove existing highlighted features
                            if (highlight) {
                                highlight.remove();
                            }
                    
                            // highlight query results
                            highlight = layerView.highlight(graphics);

                            dataStore = graphics.map(f => f.attributes);
                            sendSelectionToDashboard();
                        }
                    });
                });

                sketchViewModel.reset();
            }
        });

        sketchViewModel.create("polygon");
    }

    /**
     * Formats and sends the selected feature references to the dashboard
     */
    var sendSelectionToDashboard = function(){
        var type = app.config.operationalLayers.find(x => x.id === layer.id).type;
        var refField = app.config.operationalLayers.find(x => x.id === layer.id).idField;

        var refs = dataStore.map(x => x[refField]);
        app.appInterface.sendSelectionToDashboard(refs, type);
    }

    /**
     * Displays an attributes table in a modal frame
     */
    var displayAttributesTable = function(){
        if(!app.settings.isWebsiteVersion){
            var headerContent = "";
            var bodyContent = "";
            if(attributesTable){
                attributesTable.destroy();
            }
            $("#attributesTable thead tr").html("");
            $("#attributesTable tbody").html("");
            for(key in dataStore[0]){
                headerContent += "<th>" + key + "</th>";
            }
            dataStore.forEach(function(elt){
                bodyContent += "<tr>";
                for(key in elt){
                    bodyContent += "<td>" + elt[key] + "</td>";
                }
                bodyContent += "</tr>";
            });
            $("#attributesTable thead tr").html(headerContent);
            $("#attributesTable tbody").html(bodyContent);

            attributesTable = $("#attributesTable").DataTable( {
                "scrollY": true,
                "scrollX": true
            });
            $("#attributesModal").modal();
        }
    }

    /**
    *   Error function, displays an error message in the result panel.
    */
    var error = function(){
        document.getElementsByClassName("result-panel-result")[0].innerHTML = "Error";
    };
    var builAttributeSelectionForm = function(){
        var operations = ["=", "<>", ">", ">=", "<", "<=", "_", "%", "()", "like", "and", "or", "not", "is"];
        var form = document.createElement("form");
        //form.className = "form-inline";

        var divRow = document.createElement("div");
        divRow.className = "row";

        var formgroup = document.createElement("div");
        formgroup.className = "form-group";
        var fieldSelect = document.createElement("select");
        fieldSelect.multiple = true;
        fieldSelect.className = "form-control";
        fieldSelect.name = "selectionToolAttrFieldSelect";
        for(var i = 0 ; i < layer.fields.length; i++){
            if(layer.fields[i].type != "oid" && layer.fields[i].type != "geometry"){
                var option = document.createElement("option");
                option.value = layer.fields[i].name;
                option.innerHTML = layer.fields[i].name;
                fieldSelect.appendChild(option);
            }
        }

        var valueSelect = document.createElement("select");
        valueSelect.multiple = true;
        valueSelect.className = "form-control";
        valueSelect.name = "selectionToolAttrValueSelect";
        var divCol = document.createElement("div");
        divCol.className = "col";
        divCol.appendChild(fieldSelect);
        divRow.appendChild(divCol);
        divCol = document.createElement("div");
        divCol.className = "col";
        divCol.appendChild(valueSelect);
        divRow.appendChild(divCol);

        var textarea = document.createElement("textarea");
        textarea.name = "selectionToolAttrQuery";
        textarea.className = "form-control";

        form.appendChild(divRow);
        form.appendChild(document.createElement("br"));

        formgroup = document.createElement("div");
        formgroup.className = "form-group";
        for(var i = 0 ; i < operations.length; i++){
            var button = document.createElement("input");
            button.type = "button";
            button.className = "btn btn-default";
            button.value = operations[i];
            formgroup.appendChild(button);
            button.onclick = function(event){
                textarea.value += " " + event.target.value;
            };
        }
        form.appendChild(formgroup);
        form.appendChild(textarea);
        var submit = document.createElement("input");
        submit.type = "button";
        submit.className = "btn btn-default";
        submit.value = "Select";
        form.appendChild(document.createElement("br"));
        form.appendChild(submit);

        // Setting events
        /*
        *   Loading field distinct values
        */
        fieldSelect.onchange = function(event){
            require(["esri/tasks/QueryTask", "esri/rest/support/Query"], function(QueryTask, Query){
                var field = fieldSelect.selectedOptions[0].value;
                var url = layer.url + "/" + layer.layerId;
                var queryTask = new QueryTask({
                    url: url
                });
                var query = new Query({
                    returnGeometry: false,
                    outFields: [field],
                    returnDistinctValues: true,
                    orderByFields: [field],
                    where: "1=1"
                });
                valueSelect.innerHTML = "";
                queryTask.execute(query).then(function(results){
                    for(var i = 0; i < results.features.length; i++){
                        var val = results.features[i].attributes[field];
                        if(val){
                            if(typeof(val) === "string"){
                                val = "'" + val.trim() + "'";
                            }
                            if(val != ""){
                                var option = document.createElement("option");
                                option.value = val;
                                option.innerHTML = val;
                                valueSelect.appendChild(option);
                            }
                        }
                    }
                });
            });
        };

        fieldSelect.ondblclick = function(event){
            textarea.value += " " + fieldSelect.selectedOptions[0].value;
        };
        valueSelect.ondblclick = function(event){
            textarea.value += " " + valueSelect.selectedOptions[0].value;
        };
        submit.onclick = function(event){
            var queryString = textarea.value;
            if(queryString.length > 0){ 
                performQueryByAttribute(queryString);
            }
        };

        var toolResultPanelContent = {title: "Attribute Selection - " + layer.title, 
            htmlElement: form
        };
        map.setCurrentTool(self, {title: "Attribute Selection - " + layer.title, text: "Build a query based on the layer's fields."}, toolResultPanelContent);
    }
    /*
    *   Query the bathymetry layer for the elevation.
    */
    var selectionModeClicked = function(event){
        var selectedLayerId = event.target.form.children.selectionToolLayerChoice.value;
        if(selectedLayerId.includes("-")){
            var mapLayer = layer = map.mapView.map.findLayerById(selectedLayerId.split("-")[0]);
            var sublayer = mapLayer.findSublayerById(parseInt(selectedLayerId.split("-")[1]));
            layer = new FeatureLayer({url: sublayer.url, outFields: ["*"]});
            layer.load().then(function(){
                if(event.target == attributeSelectionButton){
                    builAttributeSelectionForm();
                }
                else if(event.target == graphicalSelectionButton){
                    activateGraphicalSelection();
                }
            });
        }
        else{
            layer = map.mapView.map.findLayerById(selectedLayerId);
            if(layer){
                if(event.target == attributeSelectionButton){
                    builAttributeSelectionForm();
                }
                else if(event.target == graphicalSelectionButton){
                    if(app.controllers.map.is3D || app.controllers.map.is3DFlat){
                        alert("Graphical selection not available yet in 3D projections");
                    }
                    else{
                        activateGraphicalSelection();
                    }
                }
            }
        }    
    };
    

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance, noUI){
        app = appInstance;
        map = app.controllers.map;

        if(!noUI){
            // Adding info panel to the UI
            var infoPanelContent = {title: "Selection", text: "Select a layer and a selection mode."};

            // Keeping visible feature and map image layers
            var visibleLayers = map.mapView.map.allLayers.items.filter(x => (x.type =="feature" || x.type == "map-image") && x.visible);
            var layerList = "<option disabled selected value> -- choose a layer -- </option>";
            for(var i = 0 ; i < visibleLayers.length ; i ++){
                if(visibleLayers[i].type === "feature"){
                    layerList += "<option value='" + visibleLayers[i].id + "'>" + visibleLayers[i].title + "</option>";
                }
                else if(visibleLayers[i].type === "map-image"){
                    for(var j = 0 ; j < visibleLayers[i].allSublayers.length ; j++){
                        if(!visibleLayers[i].allSublayers.items[j].sublayers && visibleLayers[i].allSublayers.items[j].visible){
                            layerList += "<option value='" + visibleLayers[i].id + "-" + visibleLayers[i].allSublayers.items[j].id + "'>" + visibleLayers[i].title + "/" + visibleLayers[i].allSublayers.items[j].title + "</option>";
                        }
                    }
                }
            }

            var form = document.createElement("form");
            form.id = "selectionToolForm";
            var select = document.createElement("select");
            select.id = "selectionToolLayerChoice";
            select.className = "form-control";
            select.name = "selectionToolLayerChoice";
            select.innerHTML = layerList;
            attributeSelectionButton = document.createElement("input");
            attributeSelectionButton.type = "button";
            attributeSelectionButton.className = "btn btn-default";
            attributeSelectionButton.value = "Attribute selection";
            attributeSelectionButton.id = "selectionToolFormAttrButton";
            graphicalSelectionButton = document.createElement("input");
            graphicalSelectionButton.type = "button";
            graphicalSelectionButton.value = "Graphical selection";
            graphicalSelectionButton.className = "btn btn-default";
            graphicalSelectionButton.id = "selectionToolFormGrButton";

            attributeSelectionButton.onclick = selectionModeClicked;
            graphicalSelectionButton.onclick = selectionModeClicked;

            form.appendChild(select);
            form.appendChild(document.createElement("br"));
            form.appendChild(graphicalSelectionButton);
            form.appendChild(document.createTextNode(" "));
            form.appendChild(attributeSelectionButton);
            var toolResultPanelContent = {title: "Selection", 
                htmlElement: form
            };
            map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);
        }
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
    }


    var applySelection = function(featureLayer, selectedObjects){
        var layerConfig = app.config.operationalLayers.find(x => x.id == featureLayer.id);
        var whereClause = app.utils.buildWhereClause(layerConfig.idField, selectedObjects);
        for (var prop in highlight) {
            if (highlight.hasOwnProperty(prop)) { 
                if(featureLayer.id == prop){
                    highlight[prop].remove();
                }
            }
        }
        if(whereClause && whereClause != "" && whereClause != "()"){
            var query = featureLayer.createQuery();
            query.where = whereClause;
            map.mapView.whenLayerView(featureLayer).then(function (layerView) {
                layerView.queryFeatures(query).then(function(results){
                    // remove existing highlighted features
                    highlight[featureLayer.id] = layerView.highlight(results.features);
                    if(layerConfig.type == app.config.TYPE_PTF){
                        map.mapView.goTo(results.features, {
                            duration: 2000,
                            easing: "in-out-expo"
                        }).then(function(){
                            if(results.features.length == 1){
                                map.mapView.popup.open({
                                    features: results.features
                                });
                            }
                        });
                    }
                }).otherwise(function(e){
                    console.error(e)
                });
            });
        }
    };


    self.applySelectionLayers = function(selectedObjectsRef, featureType){
        var operationalLayers = app.config.operationalLayers;
        map.mapView.popup.clear();
        map.mapView.popup.close();
        map.mapView.map.allLayers.forEach(function(layer){
            var operationalLayersForType = operationalLayers.filter(x => x.type == featureType).map(x => x.id);
            if(operationalLayersForType.indexOf(layer.id) !== -1){
                applySelection(layer, selectedObjectsRef);
            }
        });
    }

    self.showAttributesTable = function(){
        if(dataStore){
            displayAttributesTable();
        }
    }

    return self;
});
