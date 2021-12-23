define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    // Reference to the app
    var app = null;
    // Current layer being processed
    var layer = null;
    // Boolean indicating if given layer should be used directly instead of creating a new one
    var useGivenLayer = false;

    /*
    *   Listener when clicking on the map.
    */
    var listener = function(event){
        require([
            "esri/layers/FeatureLayer",
            "esri/renderers/support/jsonUtils",
            "esri/symbols/support/jsonUtils",
            "esri/renderers/SimpleRenderer",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "esri/Color"], function(FeatureLayer, rendererSymbolJsonUtils, symbolJsonUtils, SimpleRenderer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, esriColor){
            var formFields = event.target.form.elements;
            var now = new Date();
            var newName = layer.title + " - " + now.toISOString().split('T')[1].split('Z')[0].split('.')[0],
                newId = layer.id + "_" + now.toISOString().split('T')[1].split('Z')[0].replace(/:/g,'').replace(/\./g,''),
                legendLabel = layer.title;

            if(formFields.layerNameToSave.value.length > 0){
                newName = formFields.layerNameToSave.value;
                legendLabel = formFields.layerNameToSave.value;
            }

             var renderer = null;

            if(formFields.layerKeepOriginalRendererToSave.checked){
                renderer = layer.renderer;
            }
            else{
                var markerParams = {};
                var marker = null;
                
                markerParams.style = formFields.layerStyleToSave.value;
                if(formFields.layerColorTransparencyToSave.checked){
                    markerParams.color = new esriColor([0,0,0,0]);
                }
                else{
                    markerParams.color = new esriColor(formFields.layerColorToSave.value);
                }

                if(!layer.geometryType || layer.geometryType === "point" || layer.geometryType === "multipoint"){
                    markerParams.outline = new SimpleLineSymbol({
                        style: "solid",
                        color: new esriColor(formFields.layerOutlineToSave.value),
                        width: formFields.layerOutlineSizeToSave.value
                    });
                    markerParams.size = formFields.layerSizeToSave.value;

                    marker = new SimpleMarkerSymbol(markerParams);
                }
                else if(layer.geometryType === "polyline"){
                    markerParams.width = formFields.layerSizeToSave.value;

                    marker = new SimpleLineSymbol(markerParams);
                }
                else if(layer.geometryType === "polygon"){
                    markerParams.outline = new SimpleLineSymbol({
                        style: "solid",
                        color: new esriColor(formFields.layerOutlineToSave.value),
                        width: formFields.layerOutlineSizeToSave.value
                    });
                    marker = new SimpleFillSymbol(markerParams);
                }

                renderer = new SimpleRenderer({label: legendLabel, symbol: marker});
            }

            if(useGivenLayer){
                layer.title = newName;
                layer.renderer = renderer;
                app.controllers.map.addToWorkLayerList(layer);
            }
            else{
                // Adding layer to work layer list and map
                app.controllers.map.addWorkLayer(newId, layer.id, newName, renderer, layer.definitionExpression, true);
                // Adding new entry to local storage
                app.settings.saveWorkLayerToLocalStorage(newId, layer.id, newName, renderer.toJSON(), layer.definitionExpression);
                // Save layer visibility
                app.settings.updateLayerVisibilityToLocalStorage(layer.id, true);
            }
        });
    };

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the tool
    */
    self.init = function(appInstance, layerInstance, useGivenLayerParam){
        app = appInstance;
        layer = layerInstance;
        useGivenLayer = useGivenLayerParam;
        
        var symbolList = "";
        var html = null;
        var keepSymboBtn = "<div class='form-group row'><div class='col-sm-offset-4 col-sm-8'><label class='checkbox-inline'><input type='checkbox' name='layerKeepOriginalRendererToSave' id='layerKeepOriginalRendererToSave'>Keep Original Symbology</label></div></div>";
        var pinBtn = "<div class='form-group row'><div class='col-sm-offset-4 col-sm-4'><input class='btn btn-default' type='button' value='Pin it!' id='pinLayerSubmit'/></div></div>";

        if(layer.geometryType === "point" || layer.geometryType === "multipoint"){
            symbolList = "<option value='circle'>Circle</option>" +
                "<option value='cross'>Cross</option>" +
                "<option value='diamond'>Diamond</option>" + 
                "<option value='square'>Square</option>" +
                "<option value='x'>X</option>";

            html = "<form class='form-horizontal'>" + 
                "<div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' ></div></div>" +
                "<div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'><select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>" + symbolList + "</select></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>" +
                "<div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>" + 
                "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'>No color</label></div></div>" +
                "<div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>" +
                keepSymboBtn +
                pinBtn +
                "</form>";
        }
        else if(layer.geometryType === "polyline"){
            symbolList = "<option value='solid'>Solid</option>" + 
                "<option value='dash'>Dash</option>" +
                "<option value='dash-dot'>Dash Dot</option>" +
                "<option value='dot'>Dot</option>" + 
                "<option value='long-dash'>Long dash</option>" +
                "<option value='long-dash-dot'>Long dash dot</option>" +
                "<option value='long-dash-dot-dot'>Long dash dot dot</option>" +
                "<option value='short-dash'>Short dash</option>" +
                "<option value='short-dash-dot'>Short dash dot</option>" +
                "<option value='short-dash-dot-dot'>Short dash dot dot</option>" +
                "<option value='short-dot'>Short dot</option>";

            html = "<form class='form-horizontal'>" + 
                "<div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' ></div></div>" +
                "<div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'><select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>" + symbolList + "</select></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>" +
                "<div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>" + 
                "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'>No color</label></div></div>" +
                keepSymboBtn +
                pinBtn +
                "</form>";
        }
        else if(layer.geometryType === "polygon"){
            symbolList = "<option value='backward-diagonal'>Backward diagonal</option>" +
                "<option value='cross'>Cross</option>" + 
                "<option value='diagonal-cross'>Diagonal cross</option>" +
                "<option value='forward-diagonal'>Forward diagonal</option>" +
                "<option value='horizontal'>Horizontal</option>" +
                "<option value='solid'>Solid</option>" +
                "<option value='vertical'>Vertical</option>";

            html = "<form class='form-horizontal'>" + 
                "<div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' ></div></div>" +
                "<div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style</label><div class='col-sm-8'><select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>" + symbolList + "</select></div></div>" +
                "<div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>" + 
                "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'>No color</label></div></div>" +
                "<div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>" +
                keepSymboBtn +
                pinBtn +
                "</form>";
        }
        else if(!layer.geometryType){
            // No geometry type, e.g. CSV layer. Assuming points
            symbolList = "<option value='circle'>Circle</option>" +
                "<option value='cross'>Cross</option>" +
                "<option value='diamond'>Diamond</option>" + 
                "<option value='square'>Square</option>" +
                "<option value='x'>X</option>";

            html = "<form class='form-horizontal'>" + 
                "<div class='form-group row'><label for='layerNameToSave' class='col-sm-4 control-label'>New Name</label><div class='col-sm-8'><input class='form-control' type='text' id='layerNameToSave' name='layerNameToSave' maxlength='40' ></div></div>" +
                "<div class='form-group row'><label for='layerStyleToSave' class='col-sm-4 control-label'>Style & Size</label><div class='col-sm-4'><select class='form-control' id='layerStyleToSave' name='layerStyleToSave'>" + symbolList + "</select></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' name='layerSizeToSave' id='layerSizeToSave' min='1' value='6'/></div></div>" +
                "<div class='form-group row'><label for='layerColorToSave' class='col-sm-4 control-label'>Color</label><div class='col-sm-4'><input type='color' class='form-control' id='layerColorToSave' name='layerColorToSave'/></div>" + 
                "<div class='col-sm-4'><label class='checkbox-inline'><input type='checkbox' name='layerColorTransparencyToSave' id='layerColorTransparencyToSave'>No color</label></div></div>" +
                "<div class='form-group row'><label for='layerOutlineToSave' class='col-sm-4 control-label'>Outline & Width</label><div class='col-sm-4'><input type='color' class='form-control' id='layerOutlineToSave' name='layerOutlineToSave'/></div>" +
                "<div class='col-sm-4'><input class='form-control' type='number' min='0' value='0' id='layerOutlineSizeToSave' name='layerOutlineSizeToSave'/></div></div>" +
                keepSymboBtn +
                pinBtn +
                "</form>";
        }

        // Adding info panel to the UI
        var infoPanelContent = null;
        
        var toolResultPanelContent = {"position": "top-right", "title": "Define a symbology - " + layer.title, "htmlContent": "<div class='.container'>" + html + "</div>"};

        app.controllers.map.setCurrentTool(self, infoPanelContent, toolResultPanelContent);

        document.getElementById('pinLayerSubmit').addEventListener('click', listener);
    };

    /*
    *   Deactivates the tool
    */
    self.deactivate = function(){
    }

    return self;
});
