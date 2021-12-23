define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Current root layer being processed
    var layer = null;
    // Selected sublayer ID, if applicable
    var selectedSublayerID = null;

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        var formFields = event.target.form.children;

        if(selectedSublayerID){
            app.controllers.map.updateLayerDefinitionExpression(layer, formFields.queryToolAttrQuery.value, selectedSublayerID);
        }
        else{
            app.controllers.map.updateLayerDefinitionExpression(layer, formFields.queryToolAttrQuery.value);
        }
    };

    var sublayerSelection = function(event){
        selectedSublayerID = parseInt(event.target.form.children.sublayerQueryToolSelect.value,10);
        var sublayer = layer.findSublayerById(selectedSublayerID);
        sublayer.load().then(function(){            
            var form = builAttributeSelectionForm(sublayer);

            var toolResultPanelContent = {position: "top-right", title: "Query builder", 
                htmlElement: form
            };
            app.controllers.map.setCurrentTool(self, null, toolResultPanelContent);
        });
    }

    var builAttributeSelectionForm = function(givenLayer){
        var operations = ["=", "<>", ">", ">=", "<", "<=", "_", "%", "()", "like", "and", "or", "not", "is"];
        var form = document.createElement("form");

        var formgroup = document.createElement("div");
        formgroup.className = "form-group";
        var fieldSelect = document.createElement("select");
        fieldSelect.multiple = true;
        fieldSelect.className = "form-control";
        fieldSelect.name = "queryToolAttrFieldSelect";
        fieldSelect.style.resize = "both";
        for(var i = 0 ; i < givenLayer.fields.length; i++){
            if(givenLayer.fields[i].type != "oid" && givenLayer.fields[i].type != "geometry"){
                var option = document.createElement("option");
                option.value = givenLayer.fields[i].name;
                option.innerHTML = givenLayer.fields[i].name;
                if(givenLayer.fields[i].alias){
                    option.title = givenLayer.fields[i].alias;
                }
                else{
                    option.title = givenLayer.fields[i].name;
                }
                
                fieldSelect.appendChild(option);
            }
        }

        var valueSelect = document.createElement("select");
        valueSelect.multiple = true;
        valueSelect.className = "form-control";
        valueSelect.name = "queryToolAttrValueSelect";
        valueSelect.style.resize = "both";

        form.appendChild(fieldSelect);
        form.appendChild(document.createElement("br"));
        form.appendChild(valueSelect);

        var textarea = document.createElement("textarea");
        textarea.name = "queryToolAttrQuery";
        textarea.className = "form-control";
        textarea.style.resize = "both";
        if(givenLayer.definitionExpression){
            textarea.value = givenLayer.definitionExpression;
        }

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
        submit.value = "Perform query";
        form.appendChild(document.createElement("br"));
        form.appendChild(submit);

        // Setting events
        /*
        *   Loading field distinct values
        */
        fieldSelect.onchange = function(event){
            require(["esri/tasks/QueryTask", "esri/rest/support/Query"], function(QueryTask, Query){
                var field = fieldSelect.selectedOptions[0].value;
                var url;
                if(selectedSublayerID){
                    url = givenLayer.url;
                }
                else{
                    url = givenLayer.url + "/" + givenLayer.layerId;
                }
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
                                option.title = val;
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
            listener(event);
        };

        return form;
    };

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance, layerInstance){
        app = appInstance;
        layer = layerInstance;

        var form;
        // Sublayer selection for map image layers
        if(layer.type == "map-image" && layer.allSublayers.length > 0){
            var layerList = "<option disabled selected value> -- choose a sub layer -- </option>";
            for(var i = 0 ; i < layer.allSublayers.length; i++){
                var currentSublayer = layer.allSublayers.getItemAt(i);
                layerList += "<option value='" + currentSublayer.id + "'>" + currentSublayer.title + "</option>";
            }


            form = document.createElement("form");
            form.id = "sublayerQueryToolForm";
            var select = document.createElement("select");
            select.id = "sublayerQueryToolSelect";
            select.className = "form-control";
            select.name = "sublayerQueryToolSelect";
            select.innerHTML = layerList;
            sublayerSelectionBtn = document.createElement("input");
            sublayerSelectionBtn.type = "button";
            sublayerSelectionBtn.className = "btn btn-default";
            sublayerSelectionBtn.value = "Next";
            sublayerSelectionBtn.id = "sublayerSelectionBtn";

            sublayerSelectionBtn.onclick = sublayerSelection;

            form.appendChild(select);
            form.appendChild(document.createElement("br"));
            form.appendChild(sublayerSelectionBtn);
        }
        else{
            form = builAttributeSelectionForm(layer);
        }
        var toolResultPanelContent = {position: "top-right", title: "Query builder", 
            htmlElement: form
        };

        app.controllers.map.setCurrentTool(self, null, toolResultPanelContent);

    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
        var element = document.getElementById('querySubmit');
        if(element){
            element.removeEventListener("click", listener);
        }
    }

    return self;
});
