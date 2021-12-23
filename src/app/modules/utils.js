define([
], function() {
    var self = {};
    // ========================================================================
    // Private
    // ========================================================================
    var app = null;

    // ========================================================================
    // Public
    // ========================================================================
    /*
    *   Initializes the settings.
    */
    self.init = function(appInstance){
        app = appInstance;
    }

    self.buildWhereClause = function(filterField, objectsRef){
        var arrays = self.sliceArray(objectsRef, 1000);
        var whereClause = "(";

        for(i = 0; i < arrays.length; i++){
            if(i > 0){
                whereClause += " OR ";
            }
            whereClause += filterField + " IN (";
            for(j = 0 ; j < arrays[i].length ; j++){
                if(j > 0){
                    whereClause += ",";
                }
                whereClause += "'" + arrays[i][j] + "'";
            }
            whereClause += ")"
        }

        whereClause += ")";

        return whereClause;
    }

    self.sliceArray = function(array, nbElements){
        var arrays = [], currentArray, endIndex;

        for(i = 0; i < array.length; i += nbElements){
            endIndex = Math.min(array.length, i + nbElements);
            currentArray = array.slice(i, endIndex);

            arrays.push(currentArray);
        }

        return arrays;
    }

    self.polylineJsonToWKT = function(arcgisJsonObject){
        var shape = arcgisJsonObject.paths;
        var lat, lon;

        var wkt = "MULTILINESTRING(";
        for (j = 0; j < shape.length; j++) {
            var lines = shape[j];
            if (j != 0) {
                wkt = wkt + ",";
            }
            var wkt = wkt + "(";
            for (i = 0; i < lines.length; i++) {
                if (i != 0) {
                    wkt = wkt + ",";
                }
                var coordinates = lines[i];
                lon = Math.round(coordinates[0] * 10000) / 10000;
                lat = Math.round(coordinates[1] * 10000) / 10000;
                wkt = wkt + lon + " " + lat;
            }
            wkt = wkt + ")";
        }
        wkt = wkt + ")";

        return wkt;
    }

    self.isTreeVisible = function(sublayer){
        var currentLayer = sublayer.parent;
        while(currentLayer && currentLayer.id){
            if(!currentLayer.visible){
                return false;
            }
            currentLayer = currentLayer.parent;
        }

        return sublayer.visible;
    }

    return self;
});
