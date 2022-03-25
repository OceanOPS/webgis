import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";

class Config{
    public static readonly PROTOCOL = "https:";

    public static readonly DENSIFY_SEGMENT_LENGTH = 500000;
    public static readonly DENSIFY_UNIT = "meters";

    public static readonly DEFAULT_ELEVATION_EXAGGERATION = 10;

    public static readonly POPUP_OPERATIONAL_PTF_TITLE = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT =  "Operated by {PROGRAM} ({COUNTRY})" + "<hr>{LOC_DATE} (latest info)";

    public static readonly POPUP_OPERATIONAL_CRUISE_POINTS_TITLE = "Ref.: {REF}";
    public static readonly POPUP_OPERATIONAL_CRUISE_POINTS_CONTENT = "Dep. Date: {DEPARTURE_DATE}" +
            "<br>Arr. Date: {ARRIVAL_DATE}" +
            "<br>Ship: {SHIP_NAME} ({SHIP_ICES_CODE})";


    public static readonly POPUP_OPERATIONAL_CRUISE_TITLE = "Ref.: {REF}";
    public static readonly POPUP_OPERATIONAL_CRUISE_CONTENT = "Dep. Date: {DEPARTURE_DATE}" +
            "<br>Arr. Date: {ARRIVAL_DATE}" +
            "<br>Dates pending: {DATES_PENDING}" +
            "<br>Ship: {SHIP_NAME} ({SHIP_ICES_CODE})" +
            "<br>Route pending: {ROUTE_PENDING}" +
            "<br>Class: {CRUISE_CLASS}";
    public static readonly POPUP_OPERATIONAL_CRUISE_FIELDINFOS = [{
        fieldName: 'DEPARTURE_DATE',
            //autocasts to FieldInfo.Format
            format: {
                dateFormat: "short-date-le-long-time-24"
            }
        },{
            fieldName: 'ARRIVAL_DATE',
            //autocasts to FieldInfo.Format
            format: {
                dateFormat: "short-date-le-long-time-24"
            }
        }
    ];

    public static readonly POPUP_OPERATIONAL_LINE_TITLE = function(event: any) {
        var family = event.graphic.attributes.LINE_FAMILY;
        var result = "Other line";
        if(family && family != ""){
            result = family;
        }
        return result;
    }
    public static readonly POPUP_OPERATIONAL_LINE_CONTENT =  "{NAME}";

    public static readonly POPUP_OPERATIONAL_SITE_TITLE = function(event: any) {
        var siteFamily = event.graphic.attributes.SITE_FAMILY;
        var result = "Other site";
        if(siteFamily && siteFamily != ""){
            result = siteFamily;
        }
        return result;
    }
    public static readonly POPUP_OPERATIONAL_SITE_CONTENT =  "{NAME}";

    public static readonly POPUP_OPERATIONAL_PTF_TITLE_ARGO = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT_ARGO = "Operated by {PROGRAM} ({COUNTRY})" + "<hr>{LOC_DATE} (latest info)";
    public static readonly POPUP_OPERATIONAL_PTF_FIELDINFOS_ARGO = [{
        fieldName: 'LOC_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
      }
    ];


    public static readonly POPUP_OPERATIONAL_PTF_TITLE_SOT = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT_SOT = function(event: any) {
        var graphic = event.graphic;
        var content = "Operated by {PROGRAM} ({COUNTRY})";

        if(graphic.attributes.SHIP_TYPE){
            content += ", on {SHIP_TYPE}";
        }

        if ((graphic.attributes.PTF_FAMILY == "Ship Weather Station" || graphic.attributes.PTF_FAMILY == "SHIP_WS") && graphic.attributes.WMO){
            content += "<br><a target=\"_blank\" href=\"http://esurfmar.meteo.fr/cgi-bin/meteo/display_vos_ext.cgi?callchx=" + graphic.attributes.WMO + "\">&gt; Météo-France QC Tools</a>";
        }
        if ((graphic.attributes.PTF_FAMILY == "Ship Weather Station" || graphic.attributes.PTF_FAMILY == "SHIP_WS") && graphic.attributes.GTS_ID){
            content += "<br><a target=\"_blank\" href=\"http://esurfmar.meteo.fr/cgi-bin/meteo/display_vos_ext.cgi?callchx=" + graphic.attributes.GTS_ID + "\">&gt; Météo-France QC Tools</a>";
        }

        content += "<hr>{LOC_DATE} (latest info)";

        return content;
    }
    public static readonly POPUP_OPERATIONAL_PTF_FIELDINFOS_SOT = [{
        fieldName: 'LOC_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_OPERATIONAL_PTF_TITLE_DBCP = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT_DBCP =  "Operated by {PROGRAM} ({COUNTRY})" + "<hr>{LOC_DATE} (latest info)";
    public static readonly POPUP_OPERATIONAL_PTF_FIELDINFOS_DBCP = [{
        fieldName: 'LOC_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_OPERATIONAL_PTF_TITLE_OS = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT_OS =  "Operated by {PROGRAM} ({COUNTRY})" + "<hr>{LOC_DATE} (latest info)";
    public static readonly POPUP_OPERATIONAL_PTF_FIELDINFOS_OS = [{
        fieldName: 'LOC_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_OPERATIONAL_PTF_TITLE_GLOSS = "Ref.: {PTF_REF}";
    public static readonly POPUP_OPERATIONAL_PTF_CONTENT_GLOSS =  "Name: {NAME}";

    public static readonly POPUP_OPERATIONAL_INTEGRATED_TITLE = "{PTF_REF} ({PTF_MODEL} - {PTF_TYPE})";
    public static readonly POPUP_OPERATIONAL_INTEGRATED_CONTENT = function(event: any){
        if(event.graphic.attributes.MASTER_PROGRAM == "Argo"){
            return Config.POPUP_OPERATIONAL_PTF_CONTENT_ARGO.replace("LOC_DATE", "LATEST_LOC_DATE");
        }
        else if(event.graphic.attributes.MASTER_PROGRAM == "DBCP"){
            return Config.POPUP_OPERATIONAL_PTF_CONTENT_DBCP.replace("LOC_DATE", "LATEST_LOC_DATE");
        }
        else if(event.graphic.attributes.MASTER_PROGRAM == "SOT"){
            return Config.POPUP_OPERATIONAL_PTF_CONTENT_SOT(event).replace("LOC_DATE", "LATEST_LOC_DATE");
        }
        else{
            return Config.POPUP_OPERATIONAL_PTF_CONTENT.replace("LOC_DATE", "LATEST_LOC_DATE");
        }
    };
    public static readonly POPUP_OPERATIONAL_INTEGRATED_FIELDINFOS = [{
        fieldName: 'LATEST_LOC_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    /** Default popup contents for operational layers (you can override it for each layer) * */
    public static readonly POPUP_DYNAMIC_LAYERS_TITLE = "{name}";
    public static readonly POPUP_DYNAMIC_LAYERS_CONTENT =  "{*}";

    /** Contenu de la popup Observations * */
    public static readonly POPUP_SOT_OBS_TITLE = "{PTF_REF}";
    public static readonly POPUP_SOT_OBS_CONTENT = "Date: {OBS_DATE}" +
        "<br>BUFR: {IS_BUFR} (0 = no / 1 = yes)" +
        "<br>Timeliness: {TIMELINESS} min.";
    public static readonly POPUP_SOT_OBS_FIELDINFOS = [{
        fieldName: 'OBS_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_DBCP_OBS_TITLE = "{PTF_REF}";
    public static readonly POPUP_DBCP_OBS_CONTENT = "Date: {OBS_DATE}" +
        "<br>Delay: {DELAY} min.";
    public static readonly POPUP_DBCP_OBS_FIELDINFOS = [{
        fieldName: 'OBS_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_OBS_LAYERS_TITLE = "{PTF_REF}";
    public static readonly POPUP_OBS_LAYERS_CONTENT = "Platform ref.: {PTF_REF}" +
        "<br>Date: {OBS_DATE}";
    public static readonly POPUP_OBS_LAYERS_FIELDINFOS = [{
        fieldName: 'OBS_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_TRACKLINE_LAYERS_TITLE = "{PTF_REF}";
    public static readonly POPUP_TRACKLINE_LAYERS_CONTENT = "";

    public static readonly POPUP_ARGO_OBS_TITLE = "{PTF_REF} - Cycle {CYCLE_NB}";
    public static readonly POPUP_ARGO_OBS_CONTENT = "Date: {OBS_DATE}" +
        "<br>Delay: {DELAY_TOTAL} hours";
    public static readonly POPUP_ARGO_OBS_FIELDINFOS = [{
        fieldName: 'OBS_DATE',
        //autocasts to FieldInfo.Format
        format: {
            dateFormat: "short-date-le-long-time-24"
        }
        }
    ];

    public static readonly POPUP_OTHERS = "{*}";

    // =========================================================
    // Popups for register forms
    public static readonly POPUP_PLATFORM_TITLE = "Submit platform";
    public static readonly POPUP_PLATFORM_CONTENT = "ID<br><input class='popup-input-expand' type='text' id='gisInternalId'/>" +
        "WMO ID<br><input type='text' class='popup-input-expand' id='gisWmo'/>" +
        "Lon.<br><input type='number' class='popup-input-expand' id='gisLon'/>"+
        "Lat.<br><input type='number' class='popup-input-expand' id='gisLat'/>";

    /* Popup cruise (edit) */
    public static readonly POPUP_CRUISE_TITLE = "Submit cruise";
    public static readonly POPUP_CRUISE_CONTENT =  "WKT: <input  type='text' id='wktCruise' name='wktCruise'/>";

    /* Popup bassin (edit) */
    public static readonly POPUP_BASSIN_TITLE = "Register Bassin";
    public static readonly POPUP_BASSIN_CONTENT =  "<div>Ref: <input type='text' class='txtMarkerAttribute' name='REF' value='{REF}'></div>"+
        "<div>Family: <input type='text' class='txtMarkerAttribute' name='PTFFAMILY' value='{PTFFAMILY}'></div>"+
        "<div>Program: <input type='text' class='txtMarkerAttribute' name='PROGRAM' value='{PROGRAM}'></div>"+
        "<div class='popupButtonsContainer'>" +
        "<div id='editRouteBtn' class='marginRight editPopupDivButtons'></div>" +
        "<div id='moveGraphicBtn' class='marginRight editPopupDivButtons'></div>" +
        "<div id='deleteRouteBtn' class='editPopupDivButtons'></div>" +
        "<div class='clearBoth'></div>" +
        "</div>" +
        "<div class='openPopupLink clearBoth'>" +/* "<a href='javascript:displayPopup({REF})'>Open information popup</a> */
        "</div>";


    public static readonly URL_DASHBOARD = "https://www.ocean-ops.org/board";
    public static readonly URL_INSPECT_PTF = Config.URL_DASHBOARD + "/wa/InspectPtfModule?ref={PTF_REF}";
    public static readonly URL_INSPECT_LINE = Config.URL_DASHBOARD + "/wa/InspectLine?name={NAME}";
    public static readonly URL_INSPECT_CRUISE = Config.URL_DASHBOARD + "/wa/InspectCruise?ref={REF}";
    public static readonly INTERVAL_REFRESH_MAP = 1800000;
    public static readonly JSON_DIRECTORY = "app/json/";
    public static readonly THEME_ALL = "all";
    public static readonly THEME_INTEGRATED = "oceanops";
    public static readonly PARAMETER_NAME_SYSTEM = "system";
    public static readonly PARAMETER_NAME_THEME = "theme";
    public static readonly PARAMETER_NAME_PTF_REFS = "ptfRefs";
    public static readonly PARAMETER_NAME_PTF_STATUSES = "ptfStatuses";
    public static readonly PARAMETER_NAME_PTF_PROGRAMS = "ptfPrograms";
    public static readonly PARAMETER_NAME_PTF_COUNTRIES = "ptfCountries";
    public static readonly PARAMETER_NAME_PTF_NETWORKS = "ptfNetworks";
    public static readonly GEOMETRY_SERVICE = Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Utilities/Geometry/GeometryServer";
    public static readonly PRINT_SERVICE = Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/ExportWebMap/GPServer/Export%20Web%20Map";
    public static readonly PORTAL_URL = Config.PROTOCOL + "//www.ocean-ops.org/arcgisportal/";
    public static readonly DEFAULT_NETWORKS_FIELD = "NETWORK";
    public static readonly TYPE_PTF = "platform";
    public static readonly TYPE_OBS = "observation";
    public static readonly TYPE_OBS_PTF = "observationPerPtf";
    public static readonly TYPE_TRACKLINE = "trackline";
    public static readonly TYPE_CRUISE = "cruise";
    public static readonly TYPE_LINE = "line";
    public static readonly TYPE_WORK = "work";
    public static readonly TYPE_SITE = "site";
    public static readonly TYPE_SHIP = "ship";

    public static readonly OBSERVATIONS_SYMBOL = { "type": "simple-marker", "style": "circle", "color": [0,255,0,255], "size": 4, "outline":  {  "color": [255,255,255,255],  "width": 1 } };
    public static readonly TRACKLINE_SYMBOL = { "type": "esriSLS", "style": "esriSLSSolid", "color": [255,170,0,255], "size": 2, "angle": 0, "xoffset": 0, "yoffset": 0,  "outline":  {  "color": [255,255,255,255],  "width": 1 } };

    public static readonly symbolsPoint = [
        {'value': 'esriSMSCircle', 'text': 'Circle'},
        {'value': 'esriSMSCross', 'text': 'Cross'},
        {'value': 'esriSMSDiamond', 'text': 'Diamond'},
        {'value': 'esriSMSSquare', 'text': 'Square'},
        {'value': 'esriSMSX', 'text': 'X'}
    ];

    public static readonly symbolsLine = [
        {'value': 'esriSLSDash','text': 'Dashes'},
        {'value': 'esriSLSDashDotDot','text': 'Dash-dot-dot pattern'},
        {'value': 'esriSLSDot','text': 'Dots'},
        {'value': 'esriSLSSolid','text': 'Solid'}
    ];

    public static readonly symbolsPolygon = [
        {'value': 'esriSFSBackwardDiagonal','text': 'Backward diagonal lines'},
        {'value': 'esriSFSCross','text': 'Cross'},
        {'value': 'esriSFSDiagonalCross','text': 'Diagonal cross'},
        {'value': 'esriSFSForwardDiagonal','text': 'Forward diagonal lines'},
        {'value': 'esriSFSHorizontal','text': 'Horizontal lines'},
        {'value': 'esriSFSSolid','text': 'Solid'},
        {'value': 'esriSFSVertical','text': 'Vertical lines'}
    ];

    // Put here the declarations of the groups (id/name) and then use the ID in the layers "'group': 'id'"
    public static readonly layerGroups = [
        {'id': "cruises",'name': "Cruises and Ships", 'index': 80},
        //{'id': "lines",'name': "Lines and Sites", 'index': 90},
        {'id': "referenceLines",'name': "Reference lines and areas", 'index': 100},
        {'id': "analysis",'name': "Analysis", 'index': 110},
        {'id': "commons",'name': "Commons", 'index': 120},
        {'id': "goship",'name': "GO-SHIP", 'index': 50},
        {'id': "argo",'name': "Argo", 'index': 10},
        {'id': "gliders",'name': "OceanGliders", 'index': 15},
        {'id': "dbcp",'name': "DBCP", 'index': 20},
        {'id': "sot",'name': "SOT", 'index': 30},
        {'id': "oceansites",'name': "OceanSITES", 'index': 40},
        {'id': "gloss",'name': "GLOSS", 'index': 60},
        {'id': "integrated",'name': "Integrated", 'index': 70}
    ];

    public static readonly layerType = [
        {"id": "PTF_LOC_0", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "PTF_LOC_N", "filterField": "PTF_REF", "type": Config.TYPE_PTF},
        {"id": "OCEANGLIDERS_LOC_0", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "OCEANGLIDERS_LOC_N", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "ARGO_PTF_LOC_0", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "ARGO_PTF_LOC_N", "filterField": "PTF_REF", "type": Config.TYPE_PTF},
        {"id": "SOT_PTF_LOC_N", "filterField": "PTF_REF", "type": Config.TYPE_PTF},
        {"id": "SOT_SOOP_XBT_DESIGN", "filterField": "LINE_ID", "type": Config.TYPE_LINE},
        {"id": "DBCP_PTF_LOC_0", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "DBCP_PTF_LOC_N", "filterField": "PTF_REF", "type": Config.TYPE_PTF},
        {"id": "OCEANSITES_PTF_LOC_0", "filterField": "PTF_REF", "type": Config.TYPE_PTF}, 
        {"id": "GOSHIP_CRUISE_LINE", "filterField": "ID", "type": Config.TYPE_CRUISE},
        {"id": "GOSHIP_DESIGN", "filterField": "LINE_ID", "type": Config.TYPE_LINE},
        {"id": "CRUISE_POLYGON", "filterField": "ID", "type": Config.TYPE_CRUISE},
        {"id": "CRUISE_LINE", "filterField": "ID", "type": Config.TYPE_CRUISE},
        {"id": "CRUISE_POINT", "filterField": "ID", "type": Config.TYPE_CRUISE},
        {"id": "CRUISE_POLYGON", "filterField": "ID", "type": Config.TYPE_CRUISE},
        {"id": "ARGO_TRACKLINE", "filterField": "PTF_REF", "type": Config.TYPE_TRACKLINE},
        {"id": "DBCP_TRACKLINE", "filterField": "PTF_REF", "type": Config.TYPE_TRACKLINE},
        {"id": "ARGO_OBS", "filterField": "OBS_ID", "type": Config.TYPE_OBS},
        {"id": "DBCP_OBS", "filterField": "OBS_ID", "type": Config.TYPE_OBS},
        {"id": "SITES", "filterField": "SITE_ID", "type": Config.TYPE_SITE}
    ];

    public static readonly operationalLayers = [
        {
            "id" : "PTF_LOC_0",
            "index": 80,
            "theme": Config.THEME_INTEGRATED,
            "group": "integrated",
            "name" : "All deployment locations",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/PtfLocations/MapServer/0",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/PtfLocations/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "symbologyFields" : ["DEFAULT", "MASTER PROGRAM", "PLATFORM FAMILY", "SHIP"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_INTEGRATED_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_INTEGRATED_CONTENT,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_INTEGRATED_FIELDINFOS,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        }, {
            "id" : "PTF_LOC_N",
            "index": 80,
            "theme": Config.THEME_INTEGRATED,
            "group": "integrated",
            "name" : "All latest locations",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/PtfLocations/MapServer/1",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/PtfLocations/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "symbologyFields" : ["DEFAULT", "MASTER PROGRAM", "PLATFORM FAMILY", "SHIP", "WIGOS_SYNCRHONISED"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "sensorMaxHeightField": "MAX_SENSOR_HEIGHT",
            "sensorMinHeightField": "MIN_SENSOR_HEIGHT",
            "popupTitle": Config.POPUP_OPERATIONAL_INTEGRATED_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_INTEGRATED_CONTENT,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_INTEGRATED_FIELDINFOS,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Trackline",
                  "id": "ptf-argo-observations",
                  "className": "esri-icon-polyline"
                },
                {
                  "title": "3D data",
                  "id": "ptf-argo-data",
                  "className": "esri-icon-hollow-eye"
                },
                {
                  "title": "Sensors (3D)",
                  "id": "ptf-oceansites-sensors",
                  "className": "esri-icon-hollow-eye"
                },
                {
                  "title": "30-day history",
                  "id": "ptf-sot-observations",
                  "className": "esri-icon-polyline"
                },
                {
                  "title": "Show 30-day track",
                  "id": "ptf-dbcp-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "DESIGN_LINE",
            "index": 70,
            "theme": Config.THEME_INTEGRATED,
            "group": "referenceLines",
            "name" : "Reference lines",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/DesignLines/MapServer/0",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/DesignLines/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "symbologyFields" : ["DEFAULT", "LINE FAMILY"],
            "idField" : "ID",
            "type" : Config.TYPE_LINE,
            "popupTitle" : Config.POPUP_OPERATIONAL_LINE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_LINE_CONTENT,
            "visible" : true,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "SITES",
            "index": 60,
            "theme": Config.THEME_INTEGRATED,
            "group": "referenceLines",
            "name" : "Reference sites",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/Sites/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "SITE_ID",
            "type" : Config.TYPE_SITE,
            "popupTitle" : Config.POPUP_OPERATIONAL_SITE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_SITE_CONTENT,
            "elevationInfo": {
                "mode": "on-the-ground",
            },
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanOPS/Sites/MapServer/export?bbox=-43%2C59%2C-35.5%2C63.8&bboxSR=&layers=&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "visible" : true
        },
        {
            "id" : "OCEANGLIDERS_LOC_0",
            "index": 81,
            "theme": "gliders",
            "group": "gliders",
            "name" : "OceanGliders deployments",
            "defaultWhereClause": "",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/1",
            "symbologyFields" : ["COUNTRY", "STATUS", "GLIDER TYPE", "GLIDER MODEL"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/export?bbox=-1%2C34%2C19%2C44&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_ARGO,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_ARGO,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_ARGO,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "OCEANGLIDERS_LOC_N",
            "index": 81,
            "theme": "gliders",
            "group": "gliders",
            "name" : "OceanGliders latest locations",
            "defaultWhereClause": "",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/0",
            "symbologyFields" : ["COUNTRY", "STATUS", "GLIDER TYPE", "GLIDER MODEL"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/export?bbox=-1%2C34%2C19%2C44&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_ARGO,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_ARGO,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_ARGO,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Show track",
                  "id": "ptf-glider-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "OCEANGLIDERS_OBS_PTF",
            "index": 81,
            "name" : "OceanGliders observations",
            "theme": "gliders",
            "group": "gliders",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/2",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/export?bbox=-130%2C20%2C-70%2C50&bboxSR=&layers=show%3A2&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "type" : Config.TYPE_OBS_PTF,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "OCEANGLIDERS_OBS",
            "index": 81,
            "name" : "OceanGliders observations",
            "theme": "gliders",
            "group": "gliders",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersObservation/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "OBS_ID",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersLocation/MapServer/export?bbox=-130%2C20%2C-70%2C50&bboxSR=&layers=show%3A2&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "type" : Config.TYPE_OBS,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_PTF_LOC_0",
            "index": 81,
            "theme": "argo",
            "group": "argo",
            "name" : "Argo deployments",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOLocations/MapServer/0",
            "symbologyFields" : ["STATUS", "COUNTRY", "PROGRAM", "FLOAT MODEL", "FLOAT TYPE", "TELECOM TYPE", "SHIP", "DRIFT DEPTH", "PROFILE DEPTH", "CYCLE TIME"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOLocations/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_ARGO,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_ARGO,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_ARGO,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Trackline",
                  "id": "ptf-argo-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_PTF_LOC_N",
            "index": 81,
            "name" : "Argo latest locations",
            "theme": "argo",
            "group": "argo",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOLocations/MapServer/1",
            "symbologyFields" : ["STATUS", "COUNTRY", "PROGRAM", "AGE", "FLOAT MODEL", "FLOAT TYPE", "TELECOM TYPE", "SHIP", "DRIFT DEPTH", "PROFILE DEPTH", "CYCLE TIME", "AGE_HOTSPOT", "RETRIEVAL STATUS", "3D"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOLocations/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_ARGO,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_ARGO,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_ARGO,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Trackline",
                  "id": "ptf-argo-observations",
                  "className": "esri-icon-polyline"
                },
                {
                  "title": "3D data",
                  "id": "ptf-argo-data",
                  "className": "esri-icon-hollow-eye"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_OBS_PTF",
            "index": 81,
            "name" : "Argo observations",
            "theme": "argo",
            "group": "argo",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOObservations/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOObservations/MapServer/export?bbox=130%2C30%2C135%2C32&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "type" : Config.TYPE_OBS_PTF,
            "popupTitle" : Config.POPUP_ARGO_OBS_TITLE,
            "popupContent": Config.POPUP_ARGO_OBS_CONTENT,
            "minScale": 4700000,
            "visible" : false,
            "popupActions": [
                {
                  "title": "Show profile",
                  "id": "ptf-argo-data-cycle",
                  "className": "esri-icon-hollow-eye"
                }
            ],
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_DATA_IFREMER_ERDDAP",
            "index": 81,
            "name" : "Argo data",
            "theme": "argo",
            "group": "argo",
            "hideFromCollection": true,
            "url": Config.PROTOCOL + "//www.ifremer.fr/erddap/tabledap/ArgoFloats.geoJson?platform_number%2Ctime%2Ccycle_number%2Clatitude%2Clongitude%2Cpres%2Ctemp%2Cpsal&platform_number=%22{PTF_REF}%22",
            "symbologyFields" : ["SEA TEMPERATURE", "SEA TEMPERATURE AUTO", "PSAL", "PSAL AUTO"],
            "type": "argoData",
            "popupTitle" : "{platform_number} - cycle {cycle_number} ({time})",
            "popupContent": "Pressure (decibar): {pres}" + 
                "<br>Temperature (C°): {temp}" +
                "<br>PSAL (PSU): {psal}", 
            "visible" : false,
            "elevationField": "pres",
            "elevationInfo": {
                "mode": "absolute-height",
                "offset": 0,
                "featureExpressionInfo": {
                    "expression": "$feature." + "pres" + " * -10"
                },
                "unit": "meters"
            },
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_OBS",
            "index": 81,
            "name" : "Argo observations",
            "theme": "argo",
            "group": "argo",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOObservations/MapServer/0",
            "symbologyFields" : ["DEFAULT", "DATA STATUS"],
            "idField" : "OBS_ID",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOObservations/MapServer/export?bbox=130%2C30%2C135%2C32&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "type" : Config.TYPE_OBS,
            "popupTitle" : Config.POPUP_ARGO_OBS_TITLE,
            "popupContent": Config.POPUP_ARGO_OBS_CONTENT, 
            "popupFieldInfos": Config.POPUP_ARGO_OBS_FIELDINFOS,
            "minScale": 1,
            "timeInfo": {
                "trackId": "PTF_REF"
            },
            "visible" : false,
            "labelingInfo": [{
                "labelExpressionInfo": "[PTF_REF] / [CYCLE_NB]",
                "labelPlacement": "above-right",
                "symbol": new TextSymbol({
                    "color": [50,50,50,1],
                    "font": {
                        "size": 10
                    }
                }),
                "minScale": 1000000
            }],
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "ARGO_TRACKLINE",
            "index": 81,
            "theme": "argo",
            "group": "argo",
            "name" : "Argo tracklines",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOTrajectory/MapServer/1",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOTrajectory/MapServer/export?bbox=130%2C30%2C135%2C32&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "type" : Config.TYPE_TRACKLINE,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "size": 2,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "SOT_PTF_LOC_N",
            "index": 83,
            "theme": "sot",
            "group": "sot",
            "name" : "SOT Latest Locations",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOTLocations/MapServer/0",
            "symbologyFields" : ["STATUS", "COUNTRY", "VOS CLASS", "TYPE", "MASK"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_SOT,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_SOT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "30-day history",
                  "id": "ptf-sot-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "SOT_SOOP_XBT_DESIGN",
            "index": 83,
            "theme": "sot",
            "group": "sot",
            "name" : "SOOP XBT design lines",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOOP_XBT_DESIGN/MapServer/0",
            "symbologyFields" : [],
            "idField" : "LINE_ID",
            "type" : Config.TYPE_LINE,
            "popupTitle" : Config.POPUP_OPERATIONAL_LINE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_LINE_CONTENT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "line-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "SOT_OBS_PTF",
            "index": 83,
            "theme": "sot",
            "group": "sot",
            "name" : "SOT Observations",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOTObservations/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_OBS_PTF,
            "popupTitle" : Config.POPUP_SOT_OBS_TITLE,
            "popupContent": Config.POPUP_SOT_OBS_CONTENT,
            "popupFieldInfos": Config.POPUP_SOT_OBS_FIELDINFOS,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSSquare",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "SOT_OBS",
            "index": 83,
            "theme": "sot",
            "group": "sot",
            "name" : "SOT Observations",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOTObservations/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "OBS_ID",
            "type" : Config.TYPE_OBS,
            "popupTitle" : Config.POPUP_SOT_OBS_TITLE,
            "popupContent": Config.POPUP_SOT_OBS_CONTENT,
            "popupFieldInfos": Config.POPUP_SOT_OBS_FIELDINFOS,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSSquare",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "DBCP_PTF_LOC_0",
            "index": 84,
            "theme": "dbcp",
            "group": "dbcp",
            "name" : "DBCP deployments",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPLocations/MapServer/0",
            "symbologyFields" : ["STATUS", "COUNTRY"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_DBCP,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_DBCP,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_DBCP,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Show 30-day track",
                  "id": "ptf-dbcp-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },{
            "id" : "DBCP_PTF_LOC_N",
            "index": 84,
            "theme": "dbcp",
            "group": "dbcp",
            "name" : "DBCP latest locations",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPLocations/MapServer/1",
            "symbologyFields" : ["STATUS", "COUNTRY", "3D"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_DBCP,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_DBCP,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_DBCP,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Show 30-day track",
                  "id": "ptf-dbcp-observations",
                  "className": "esri-icon-polyline"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },{
            "id" : "DBCP_OBS",
            "index": 84,
            "theme": "dbcp",
            "group": "dbcp",
            "name" : "DBCP Observations",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPObservations/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",            
            "type" : Config.TYPE_OBS_PTF,
            "popupTitle" : Config.POPUP_DBCP_OBS_TITLE,
            "popupContent": Config.POPUP_DBCP_OBS_CONTENT,
            "popupFieldInfos": Config.POPUP_DBCP_OBS_FIELDINFOS,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSSquare",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },{
            "id" : "DBCP_TRACKLINE",
            "index": 84,
            "theme": "dbcp",
            "group": "dbcp",
            "name" : "DBCP tracklines",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPObservations/MapServer/1",
            "symbologyFields" : ["DEFAULT"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_TRACKLINE,
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "size": 2,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "OCEANSITES_PTF_LOC_0",
            "index": 85,
            "theme": "oceansites",
            "group": "oceansites",
            "name" : "OceanSITES deployments",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanSITES/OceanSITESLocations/MapServer/0",
            "symbologyFields" : ["STATUS", "COUNTRY","3D"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_OS,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_OS,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_PTF_FIELDINFOS_OS,
            "popupActions": [
                {
                  "title": "Details page",
                  "id": "ptf-inspect",
                  "className": "esri-icon-review"
                },
                {
                  "title": "Sensors (3D)",
                  "id": "ptf-oceansites-sensors",
                  "className": "esri-icon-hollow-eye"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "OCEANSITES_SENSORS",
            "index": 81,
            "name" : "OceanSITES sensors",
            "theme": "oceansites",
            "group": "oceansites",
            "idField" : "PTF_REF",
            "hideFromCollection": true,
            "url": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanSITES/OceanSITES_Sensors/MapServer/0",
            "symbologyFields" : ["DEFAULT"],
            "type": "oceansitesSensors",
            "popupTitle" : function(event: any){ 
                if(event.graphic.attributes.SENSOR_MODEL_NAME == "MOORING LINE"){
                    return event.graphic.attributes.SENSOR_MODEL_NAME;
                }
                else{
                    return event.graphic.attributes.SENSOR_MODEL_NAME + " (" + event.graphic.geometry.z + "m)"
                }
            },
            "popupContent": function(event: any){
                    var content: String | null = "Variables: {VARIABLES}";
                    if(event.graphic.attributes.SENSOR_MODEL_NAME == "MOORING LINE"){
                        content = null;
                    }
                    return content;
            }, 
            "visible" : false,
            "elevationField": "z",
            "elevationInfo": {
                "mode": "absolute-height",
                "offset": 0,
                "featureExpressionInfo": {
                    "expression": "Geometry($feature)." + "z" + " * {COEFF}"
                },
                "unit": "meters"
            },
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "GLOSS_PTF_LOC_0",
            "index": 85,
            "theme": "gloss",
            "group": "gloss",
            "name" : "GLOSS platforms",
            "defaultWhereClause": "PTF_STATUS = 6",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GLOSS/GLOSSLocations/MapServer/0",
            "symbologyFields" : ["STATUS"],
            "idField" : "PTF_REF",
            "type" : Config.TYPE_PTF,
            "popupTitle": Config.POPUP_OPERATIONAL_PTF_TITLE_GLOSS,
            "popupContent": Config.POPUP_OPERATIONAL_PTF_CONTENT_GLOSS,
            "visible" : true,
            "selectionSymbol" : { "type": "esriSMS",    "style": "esriSMSCircle",   "color": [0,255,255,255],   "size": 8,  "angle": 0, "xoffset": 0,   "yoffset": 0,   "outline":  {       "color": [0,0,0,255],       "width": 1  } }
        },
        {
            "id" : "GOSHIP_CRUISE_LINE",
            "index": 86,
            "theme": "goship",
            "group": "goship",
            "name" : "Cruises",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_CRUISE/MapServer/0",
            "symbologyFields" : ["TYPE","STATUS","GO-SHIP CLASS","DATES PENDING","ROUTE PENDING"],
            "idField" : "ID",
            "type" : Config.TYPE_CRUISE,
            "popupTitle" : Config.POPUP_OPERATIONAL_CRUISE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_CRUISE_CONTENT,
            "popupFieldInfos": Config.POPUP_OPERATIONAL_CRUISE_FIELDINFOS,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "cruise-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : true,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "GOSHIP_DESIGN",
            "index": 86,
            "theme": "goship",
            "group": "goship",
            "name" : "Design lines",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_DESIGN/MapServer/0",
            "symbologyFields" : [],
            "idField" : "LINE_ID",
            "type" : Config.TYPE_LINE,
            "popupTitle" : Config.POPUP_OPERATIONAL_LINE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_LINE_CONTENT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "line-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "CRUISE_LINE",
            "index": 88,
            "theme": Config.THEME_ALL,
            "group": "cruises",
            "name" : "Cruises (line)",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/0",
            "symbologyFields" : ["TYPE","STATUS","GO-SHIP CLASS","DATES PENDING","ROUTE PENDING"],
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/export?bbox=-80%2C10%2C-20%2C30&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "idField" : "ID",
            "type" : Config.TYPE_CRUISE,
            "popupTitle" : Config.POPUP_OPERATIONAL_CRUISE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_CRUISE_CONTENT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "cruise-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "CRUISE_POINT",
            "index": 88,
            "theme": Config.THEME_ALL,
            "group": "cruises",
            "name" : "Cruises (point)",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/1",
            "symbologyFields" : [],
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/export?bbox=-80%2C10%2C-20%2C30&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "idField" : "ID",
            "type" : Config.TYPE_CRUISE,
            "popupTitle" : Config.POPUP_OPERATIONAL_CRUISE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_CRUISE_CONTENT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "cruise-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        },
        {
            "id" : "CRUISE_POLYGON",
            "index": 88,
            "theme": Config.THEME_ALL,
            "group": "cruises",
            "name" : "Cruises (polygon)",
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/2",
            "symbologyFields" : [],
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Cruises/MapServer/export?bbox=-80%2C10%2C-20%2C30&bboxSR=&layers=show%3A2&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "idField" : "ID",
            "type" : Config.TYPE_CRUISE,
            "popupTitle" : Config.POPUP_OPERATIONAL_CRUISE_TITLE,
            "popupContent": Config.POPUP_OPERATIONAL_CRUISE_CONTENT,
            "popupActions": [
                {
                  "title": "Details Page",
                  "id": "cruise-inspect",
                  "className": "esri-icon-review"
                }
            ],
            "visible" : false,
            "selectionSymbol" : { "type": "esriSLS",    "style": "esriSLSSolid",    "color": [0,255,255,255],   "width": 2, "angle": 0, "xoffset": 0,   "yoffset": 0}
        }
    ];

    public static readonly dynamicLayers = [
        {
            "id" : "argoDesign",
            "group": "referenceLines",
            "theme" : "argo",
            "name" : "Argo design",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGODesign/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGODesign/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A5&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 61
        },{
            "id" : "argoDensity",
            "group": "analysis",
            "theme" : "argo",
            "name" : "Argo density",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGODensity/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGODensity/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A5&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 62
        },{
            "id" : "dbcpDensity",
            "group": "analysis",
            "theme" : "dbcp",
            "name" : "DBCP density",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPDensity/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPDensity/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 64
        },{
            "id" : "dbcpCoverage",
            "group": "analysis",
            "theme" : "dbcp",
            "name" : "DBCP coverage",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPCoverage/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPCoverage/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 64
        },{
            "id" : "glidersDesign",
            "group": "referenceLines",
            "theme" : "gliders",
            "name" : "OceanGliders design",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersDesign/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/OceanGliders/OceanGlidersDesign/MapServer/export?bbox=130%2C30%2C150%2C40&bboxSR=&layers=show%3A5&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 63
        },{
            "id" : "argoCoverage",
            "group": "analysis",
            "theme" : "argo",
            "name" : "Argo coverage",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOCoverage/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Argo/ARGOCoverage/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 65
        }, 
        {
            "id" : "blueObserver",
            "group": "cruises",
            "theme" : Config.THEME_ALL,
            "name" : "Blue Observer",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/BlueObserver/MapServer",
            "index": 61
        },
        {
            "id" : "goshipDesign",
            "group": "referenceLines",
            "theme" : "goship",
            "name" : "GO-SHIP design",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_DESIGN/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_DESIGN/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 82
        }, {
            "id" : "goshipStatus20122023",
            "group": "analysis",
            "theme" : "goship",
            "name" : "GO-SHIP status 2012-2023",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_STATUS_2012_2023/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/GO-SHIP/GOSHIP_STATUS_2012_2023/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 83
        },{
            "id" : "sotCoverage",
            "group": "analysis",
            "theme" : "sot",
            "name" : "SOT coverage",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOTCoverage/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOTCoverage/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index": 83
        }, {
            "id" : "soopXbtDesign",
            "group": "referenceLines",
            "theme" : "sot",
            "name" : "SOOP-XBT design",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOOP_XBT_DESIGN/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/SOT/SOOP_XBT_DESIGN/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "sublayers": [
                {
                    "id": 0,
                    "title": "SOOP-XBT Design 2019-2020",
                    "popupTemplate": {"title": "XBT Line", "content": "<a href='javascript:openInspectLine(\"{LINE}\")'>Open Information Window</a>"},
                    "source": {
                      "mapLayerId": 0
                    },
                    "visible": true
                },
                {
                    "id": 1,
                    "title": "SOOP-XBT Design 2017-2018",
                    "popupTemplate": {"title": "XBT Line", "content": "<a href='javascript:openInspectLine(\"{LINE}\")'>Open Information Window</a>"},
                    "source": {
                      "mapLayerId": 1
                    },
                    "visible": false
                },
                {
                    "id": 2,
                    "title": "SOOP-XBT Design 2015",
                    "popupTemplate": {"title": "XBT Line", "content": "<a href='javascript:openInspectLine(\"{LINE}\")'>Open Information Window</a>"},
                    "source": {
                      "mapLayerId": 2
                    },
                    "visible": false
                }
            ],
            "index": 84
        },
        {
            "id" : "dbcpActionGroups",
            "group": "referenceLines",
            "theme" : "dbcp",
            "name" : "DBCP action groups",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/DBCP/DBCPActionGroups/MapServer",
            "index": 85
        },
        {
            "id" : "seaIceExtent",
            "group": "commons",
            "theme" : Config.THEME_ALL,
            "name" : "Sea ice extent",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/SeaIceExtent/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/SeaIceExtent/MapServer/export?bbox=-85%2C-80%2C-45%2C-60&bboxSR=&layers=show%3A0%2C1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index" : 41
        },
        {
            "id" : "oceanAreas",
            "group": "commons",
            "theme" : Config.THEME_ALL,
            "name" : "Ocean areas",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/OceanAreas/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/OceanAreas/MapServer/export?bbox=-180%2C-90%2C180%2C90&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index" : 21
        },
        {
            "id" : "pointsOfInterest",
            "group": "commons",
            "theme" : Config.THEME_ALL,
            "name" : "Points of interest",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/PointsOfInterest/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/PointsOfInterest/MapServer/export?bbox=20%2C-30%2C95%2C5&bboxSR=&layers=show%3A1&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index" : 43
        },
        {
            "id" : "bathymetry2000",
            "group": "commons",
            "theme" : Config.THEME_ALL,
            "name" : "Bathymetry (2000m)",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Bathymetry2000/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Commons/Bathymetry2000/MapServer/export?bbox=-90%2C-65%2C-40%2C-40&bboxSR=&layers=show%3A0&layerDefs=&size=150%2C75&imageSR=&format=jpg&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image",
            "index" : 6
        },
        {
            "id" : "landBasemapTop",
            "group": "commons",
            "theme" : Config.THEME_ALL,
            "name" : "Land (as a layer)",
            "visible" : false,
            "url" : Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/Land/MapServer",
            "thumbnailUrl": Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/LandTiled/MapServer/tile/1/0/1",
            "index": 90
        }
    ];

    public static basemaps: { wkid: string, basemap: Basemap, thumbnailUrl: String | null }[] = [
        {
            "wkid": "basemapOceansNoLabel",
            "basemap": new Basemap({
                baseLayers: [
                    new WebTileLayer({
                        urlTemplate: Config.PROTOCOL + "//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{level}/{row}/{col}"                        
                    })
                ],
                title: "Oceans (no label)",
                id: "basemapOceansNoLabel",
                thumbnailUrl: Config.PROTOCOL + "//services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/1/0/1"
            }),
            "thumbnailUrl": null
        },
        {
            "wkid": "basemapLands",
            "basemap": new Basemap({
                baseLayers: [
                    new WebTileLayer({
                        urlTemplate: Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/LandTiled/MapServer/tile/{level}/{row}/{col}",
                        copyright: "Map tiles by <a href=\"https://www.ocean-ops.org/\">OceanOPS</a>"
                    })
                ],
                title: "OceanOPS basemap",
                id: "basemapLands",
                thumbnailUrl: Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/LandTiled/MapServer/tile/1/0/1"
            }),
            "thumbnailUrl": null
        },{
            "wkid": "basemapLandsSeas",
            "basemap": new Basemap({
                baseLayers: [
                    new WebTileLayer({
                        urlTemplate: Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/LandSeaTiled/MapServer/tile/{level}/{row}/{col}",
                        copyright: "Map tiles by <a href=\"https://www.ocean-ops.org/\">OceanOPS</a>"
                    })
                ],
                title: "OceanOPS basemap (with coloured ocean)",
                id: "basemapLandsSeas",
                thumbnailUrl: Config.PROTOCOL + "//www.ocean-ops.org/arcgis/rest/services/Basemaps/LandSeaTiled/MapServer/tile/1/0/1"
            }),
            "thumbnailUrl": null
        }
    ];

    public static readonly projections = [{
        "number": 1,
        "ref": "54001-150",
        "name": "Plate Carrée (origin = -150°)",
        "xmin": -20037507.842788246,
        "ymin": -10018753.671394622,
        "xmax": 20037507.842788246,
        "ymax": 10018753.671394622,
        "spatialReference": {
            "wkt": "PROJCS[\"World_Plate_Carree-150\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0.0],UNIT[\"Degree\",0.0174532925199433]],PROJECTION[\"Plate_Carree\"],PARAMETER[\"False_Easting\",0.0],PARAMETER[\"False_Northing\",0.0],PARAMETER[\"Central_Meridian\",-150.0],UNIT[\"Meter\",1.0]]"
        }
    }, {
        "number": 2,
        "ref": "102100",
        "name": "Web Mercator",
        "xmin": -35435649.75588614,
        "ymin": -7847608.753259057,
        "xmax": -1289700.4803412743,
        "ymax": 8824224.360072874,
        "spatialReference": {
            "wkid": 102100
        }
    }, {
        "number": 3,
        "ref": "54001",
        "name": "Plate Carrée",
        "xmin": -20037507.842788246,
        "ymin": -10018753.671394622,
        "xmax": 20037507.842788246,
        "ymax": 10018753.671394622,
        "spatialReference": {
            "wkid": 54001
        }
    }, {
        "number": 4,
        "ref": "32661",
        "name": "UPS North",
        "xmin": -53809840.884010985,
        "ymin": -31624562.520180579,
        "xmax": 57809840.884010985,
        "ymax": 35624562.520180486,
        "spatialReference": {
            "wkid": 32661
        }
    }, {
        "number": 5,
        "ref": "32761",
        "name": "UPS South",
        "xmin": -53809840.88401065,
        "ymin": -31624562.520180099,
        "xmax": 57809840.88401065,
        "ymax": 35624562.520180561,
        "spatialReference": {
            "wkid": 32761
        }
    }, {
        "number": 6,
        "ref": "54053",
        "name": "Goode Homolosine",
        "xmin": -22041257.773878016,
        "ymin": -13279515.553206014,
        "xmax": 22041257.77387803,
        "ymax": 13279515.553206014,
        "spatialReference": {
            "wkid": 54053
        }
    }, {
        "number": 7,
        "ref": "54050",
        "name": "Fuller",
        "xmin": -21361003.89389015,
        "ymin": -12869714.124407317,
        "xmax": 21361143.753541552,
        "ymax": 12869716.445784453,
        "spatialReference": {
            "wkid": 54050
        }
    }, {
        "number": 8,
        "ref": "54032",
        "name": "Azimuthal",
        "xmin": -36350332.940748304,
        "ymin": -21900511.15063718,
        "xmax": 36350332.940748304,
        "ymax": 21900511.150637172,
        "spatialReference": {
            "wkid": 54032
        }
    }, {
        "number": 9,
        "ref": "54032-150",
        "name": "Azimuthal (origin = -150°)",
        "xmin": -36350332.940748304,
        "ymin": -21900511.15063718,
        "xmax": 36350332.940748304,
        "ymax": 21900511.150637172,
        "spatialReference": {
            "wkt": 'PROJCS["World_Azimuthal_Equidistant",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Azimuthal_Equidistant"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-150.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]'
        }
    }, {
        "number": 10,
        "ref": "54030-150",
        "name": "Robinson (origin = -150°)",
        "xmin": -10378279.305497063,
        "ymin": -18685505.091050144,
        "xmax": 10378279.305497063,
        "ymax": 18685505.091050144,
        "spatialReference": {
            "wkt": 'PROJCS["World_Robinson-150",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Robinson"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-150.0],UNIT["Meter",1.0]]'
        }
    }, {
        "number": 11,
        "ref": "3D",
        "name": "3D globe"
    }, {
        "number": 12,
        "ref": "3D-flat",
        "name": "3D flat"
    }, {
        "number": 13,
        "ref": "54099",
        "name": "Spilhaus",
        "xmin": -31855333.625324097,
        "ymin": -16619599.735752784,
        "xmax": 31300391.949279215,
        "ymax": 15254305.515179828,
        "spatialReference": {
            "wkid": 54099
        }
    },
    ];

    // Initializes the basemaps automatically when this file is loaded
    private static _initialize = (():void => {
        var listEsriBasemaps = [];
        if(document.location.host == 'localhost' || document.location.host == 'localhost:3000' || document.location.host == 'www.ocean-ops.org' || document.location.host == 'ocean-ops.org'){
            listEsriBasemaps.push(
                {"wkid": "arcgis-imagery", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/ea3befe305494bb5b2acd77e1b3135dc/info/thumbnail/thumbnail1607389425104.jpeg"},
                {"wkid": "arcgis-imagery-standard", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/c7d2b5c334364e8fb5b73b0f4d6a779b/info/thumbnail/thumbnail1607389529861.jpeg"},
                {"wkid": "arcgis-light-gray", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/0f74af7609054be8a29e0ba5f154f0a8/info/thumbnail/thumbnail1607388219207.jpeg"},
                {"wkid": "arcgis-dark-gray", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/7742cd5abef8497288dc81426266df9b/info/thumbnail/thumbnail1607387673856.jpeg"},
                {"wkid": "arcgis-navigation", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/78c096abedb9498380f5db1922f96aa0/info/thumbnail/thumbnail1607388861033.jpeg"},
                {"wkid": "arcgis-navigation-night", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/77073a29526046b89bb5622b6276e933/info/thumbnail/thumbnail1607386977674.jpeg"},
                {"wkid": "arcgis-streets", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/e3e6df1d2f6a485d8a70f28fdd3ce19e/info/thumbnail/thumbnail1607389307240.jpeg"},
                {"wkid": "arcgis-streets-night", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/b22e146f927e413c92f75b5e4614354a/info/thumbnail/thumbnail1607388481562.jpeg"},
                {"wkid": "arcgis-streets-relief", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/03daad361e1849bc80cb7b70ed391379/info/thumbnail/thumbnail1607564881281.jpeg"},
                {"wkid": "arcgis-topographic", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/dd247558455c4ffab54566901a14f42c/info/thumbnail/thumbnail1607389112065.jpeg"},
                {"wkid": "arcgis-oceans", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/b1dca7ef7b61466785901c41aed89ba5/info/thumbnail/thumbnail1607387462611.jpeg"},
                {"wkid": "osm-standard", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/695aef1564e84c06833542eb4d8c02d3/info/thumbnail/thumbnail1607387123384.jpeg"},
                {"wkid": "osm-standard-relief", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/5b93370c7fc24ca3b8740abd2a55456a/info/thumbnail/thumbnail1607563948959.jpeg"},
                {"wkid": "osm-streets", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/bcefe41ce33943ac81d2fd801edd452c/info/thumbnail/thumbnail1607563410008.jpeg"},
                {"wkid": "osm-streets-relief", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/c6ec0420be5a4e36b57d1ef0f243b175/info/thumbnail/thumbnail1607563773856.jpeg"},
                {"wkid": "osm-light-gray", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/983b312ebd9b4d15a02e00f50acdb1c1/info/thumbnail/thumbnail1607564423352.jpeg"},
                {"wkid": "osm-dark-gray", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/7371ca07df4047eaa5f02d09ef12b1a0/info/thumbnail/thumbnail1607564602057.jpeg"},
                {"wkid": "arcgis-terrain", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/2ef1306b93c9459ca7c7b4f872c070b9/info/thumbnail/thumbnail1607387869592.jpeg"},
                {"wkid": "arcgis-community", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/184f5b81589844699ca1e132d007920e/info/thumbnail/thumbnail1607552533462.jpeg"},
                {"wkid": "arcgis-charted-territory", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/303e75b27af043fd835c981ab9accf84/info/thumbnail/thumbnail1607552323014.jpeg"},
                {"wkid": "arcgis-colored-pencil", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/c0ddf27614bc407f92c35020a9b48afa/info/thumbnail/thumbnail1607555753640.jpeg"},
                {"wkid": "arcgis-nova", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/90f86b329f37499096d3715ac6e5ed1f/info/thumbnail/thumbnail1607555507609.jpeg"},
                {"wkid": "arcgis-modern-antique", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/b69f2876ce4c4e9db185cdc857fcebc7/info/thumbnail/thumbnail1607553846302.jpeg"},
                {"wkid": "arcgis-midcentury", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/52d6a28f09704f04b33761ba7c4bf93f/info/thumbnail/thumbnail1607554184831.jpeg"},
                {"wkid": "arcgis-newspaper", "thumbnailUrl": "https://www.arcgis.com/sharing/rest/content/items/e3c062eedf8b487b8bb5b9b08db1b7a9/info/thumbnail/thumbnail1607553292807.jpeg"},
                {"wkid": "arcgis-hillshade-light", "thumbnailUrl": null},
                {"wkid": "arcgis-hillshade-dark", "thumbnailUrl": null}
            );
        }
        else{
            listEsriBasemaps.push(
                {"wkid": "satellite", "thumbnailUrl": null},
                {"wkid": "hybrid", "thumbnailUrl": null},
                {"wkid": "oceans", "thumbnailUrl": null},
                {"wkid": "osm", "thumbnailUrl": null},
                {"wkid": "terrain", "thumbnailUrl": null},
                {"wkid": "dark-gray-vector", "thumbnailUrl": null},
                {"wkid": "gray-vector", "thumbnailUrl": null},
                {"wkid": "streets-vector", "thumbnailUrl": null},
                {"wkid": "streets-night-vector", "thumbnailUrl": null},
                {"wkid": "streets-navigation-vector", "thumbnailUrl": null},
                {"wkid": "topo-vector", "thumbnailUrl": null},
                {"wkid": "streets-relief-vector", "thumbnailUrl": null}
            );
        }
        listEsriBasemaps.forEach(item => {        
            Config.basemaps.push(
                {"wkid": item.wkid, "basemap": Basemap.fromId(item.wkid), "thumbnailUrl": item.thumbnailUrl}
            );
        });
    })();
}

export default Config;