var wms_layers = [];


        var lyr_OSMStandard_0 = new ol.layer.Tile({
            'title': 'OSM Standard',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' &nbsp &middot; <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, CC-BY-SA</a>',
                url: 'http://tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        });
var format_Districts_1 = new ol.format.GeoJSON();
var features_Districts_1 = format_Districts_1.readFeatures(json_Districts_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Districts_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Districts_1.addFeatures(features_Districts_1);
var lyr_Districts_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Districts_1, 
                style: style_Districts_1,
                popuplayertitle: 'Districts',
                interactive: false,
                title: '<img src="styles/legend/Districts_1.png" /> Districts'
            });
var format_chennaiassemblyconstituencyboundaries_2 = new ol.format.GeoJSON();
var features_chennaiassemblyconstituencyboundaries_2 = format_chennaiassemblyconstituencyboundaries_2.readFeatures(json_chennaiassemblyconstituencyboundaries_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_chennaiassemblyconstituencyboundaries_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_chennaiassemblyconstituencyboundaries_2.addFeatures(features_chennaiassemblyconstituencyboundaries_2);
var lyr_chennaiassemblyconstituencyboundaries_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_chennaiassemblyconstituencyboundaries_2, 
                style: style_chennaiassemblyconstituencyboundaries_2,
                popuplayertitle: 'chennai-assembly-constituency-boundaries',
                interactive: false,
                title: 'chennai-assembly-constituency-boundaries'
            });
var format_chennaiparliamentaryconstituencies_3 = new ol.format.GeoJSON();
var features_chennaiparliamentaryconstituencies_3 = format_chennaiparliamentaryconstituencies_3.readFeatures(json_chennaiparliamentaryconstituencies_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_chennaiparliamentaryconstituencies_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_chennaiparliamentaryconstituencies_3.addFeatures(features_chennaiparliamentaryconstituencies_3);
var lyr_chennaiparliamentaryconstituencies_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_chennaiparliamentaryconstituencies_3, 
                style: style_chennaiparliamentaryconstituencies_3,
                popuplayertitle: 'chennai-parliamentary-constituencies',
                interactive: false,
                title: 'chennai-parliamentary-constituencies'
            });
var format_GCC_DIVISION_4 = new ol.format.GeoJSON();
var features_GCC_DIVISION_4 = format_GCC_DIVISION_4.readFeatures(json_GCC_DIVISION_4, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GCC_DIVISION_4 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GCC_DIVISION_4.addFeatures(features_GCC_DIVISION_4);
var lyr_GCC_DIVISION_4 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_GCC_DIVISION_4, 
                style: style_GCC_DIVISION_4,
                popuplayertitle: 'GCC_DIVISION',
                interactive: false,
                title: '<img src="styles/legend/GCC_DIVISION_4.png" /> GCC_DIVISION'
            });
var format_GCC_ZONE_5 = new ol.format.GeoJSON();
var features_GCC_ZONE_5 = format_GCC_ZONE_5.readFeatures(json_GCC_ZONE_5, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_GCC_ZONE_5 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_GCC_ZONE_5.addFeatures(features_GCC_ZONE_5);
var lyr_GCC_ZONE_5 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_GCC_ZONE_5, 
                style: style_GCC_ZONE_5,
                popuplayertitle: 'GCC_ZONE',
                interactive: true,
                title: '<img src="styles/legend/GCC_ZONE_5.png" /> GCC_ZONE'
            });
var format_TNschoolsGIS_6 = new ol.format.GeoJSON();
var features_TNschoolsGIS_6 = format_TNschoolsGIS_6.readFeatures(json_TNschoolsGIS_6, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_TNschoolsGIS_6 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_TNschoolsGIS_6.addFeatures(features_TNschoolsGIS_6);
cluster_TNschoolsGIS_6 = new ol.source.Cluster({
  distance: 30,
  source: jsonSource_TNschoolsGIS_6
});
var lyr_TNschoolsGIS_6 = new ol.layer.Vector({
                declutter: false,
                source:cluster_TNschoolsGIS_6, 
                style: style_TNschoolsGIS_6,
                popuplayertitle: 'TNschoolsGIS',
                interactive: true,
    title: 'TNschoolsGIS<br />\
    <img src="styles/legend/TNschoolsGIS_6_0.png" /> Central Govt<br />\
    <img src="styles/legend/TNschoolsGIS_6_1.png" /> Fully Aided<br />\
    <img src="styles/legend/TNschoolsGIS_6_2.png" /> Government<br />\
    <img src="styles/legend/TNschoolsGIS_6_3.png" /> Partially Aided<br />\
    <img src="styles/legend/TNschoolsGIS_6_4.png" /> Un-aided<br />' });

lyr_OSMStandard_0.setVisible(true);lyr_Districts_1.setVisible(true);lyr_chennaiassemblyconstituencyboundaries_2.setVisible(true);lyr_chennaiparliamentaryconstituencies_3.setVisible(true);lyr_GCC_DIVISION_4.setVisible(true);lyr_GCC_ZONE_5.setVisible(true);lyr_TNschoolsGIS_6.setVisible(true);
var layersList = [lyr_OSMStandard_0,lyr_Districts_1,lyr_chennaiassemblyconstituencyboundaries_2,lyr_chennaiparliamentaryconstituencies_3,lyr_GCC_DIVISION_4,lyr_GCC_ZONE_5,lyr_TNschoolsGIS_6];
lyr_Districts_1.set('fieldAliases', {'fid': 'fid', 'dist_name': 'dist_name', 'ed_distric': 'ed_distric', 'lgd_coed': 'lgd_coed', 'rd_lgd_cod': 'rd_lgd_cod', 'dis_tamil': 'dis_tamil', });
lyr_chennaiassemblyconstituencyboundaries_2.set('fieldAliases', {'fid': 'fid', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'AC_NO': 'AC_NO', 'ASSEMBLY_C': 'ASSEMBLY_C', 'ASSEMBLY_N': 'ASSEMBLY_N', 'DISTRICT': 'DISTRICT', 'DIVISION_N': 'DIVISION_N', 'OBJECTID': 'OBJECTID', 'PARLIAMENT': 'PARLIAMENT', 'REGION': 'REGION', 'SHAPE_AREA': 'SHAPE_AREA', 'SHAPE_LEN': 'SHAPE_LEN', 'ZN': 'ZN', });
lyr_chennaiparliamentaryconstituencies_3.set('fieldAliases', {'fid': 'fid', 'Name': 'Name', 'description': 'description', 'timestamp': 'timestamp', 'begin': 'begin', 'end': 'end', 'altitudeMode': 'altitudeMode', 'tessellate': 'tessellate', 'extrude': 'extrude', 'visibility': 'visibility', 'drawOrder': 'drawOrder', 'icon': 'icon', 'OBJECTID': 'OBJECTID', 'PARLIAMENT': 'PARLIAMENT', 'SHAPE_AREA': 'SHAPE_AREA', 'SHAPE_LEN': 'SHAPE_LEN', });
lyr_GCC_DIVISION_4.set('fieldAliases', {'fid': 'fid', 'id': 'id', 'name': 'name', '': '', });
lyr_GCC_ZONE_5.set('fieldAliases', {'fid': 'fid', 'id': 'id', 'zone_number': 'zone_number', 'zone_name': 'zone_name', 'wards_details': 'wards_details', 'Number of Wards': 'Number of Wards', 'name': 'name', });
lyr_TNschoolsGIS_6.set('fieldAliases', {'fid': 'fid', 'SNO': 'SNO', 'OBJECT_ID': 'OBJECT_ID', 'DISTRICT': 'DISTRICT', 'BLOCK': 'BLOCK', 'EDUCATION_DISTRICT': 'EDUCATION_DISTRICT', 'NAME': 'NAME', 'MANAGING_DEPARTMENT': 'MANAGING_DEPARTMENT', 'MANAGEMENT': 'MANAGEMENT', 'CATEGORY': 'CATEGORY', 'CATEGORY_GROUP': 'CATEGORY_GROUP', 'DIRECTORATE': 'DIRECTORATE', 'LOCALBODY': 'LOCALBODY', 'TOWN_MUNICIPALITY': 'TOWN_MUNICIPALITY', 'HABITATION': 'HABITATION', 'CLUSTER': 'CLUSTER', 'LATITUTE': 'LATITUTE', 'LONGITUDE': 'LONGITUDE', 'ASSEMBLY': 'ASSEMBLY', 'PARLIAMENT': 'PARLIAMENT', 'DEPT_CODE': 'DEPT_CODE', 'STATUS': 'STATUS', 'CREATED_BY': 'CREATED_BY', });
lyr_Districts_1.set('fieldImages', {'fid': 'TextEdit', 'dist_name': 'TextEdit', 'ed_distric': 'TextEdit', 'lgd_coed': 'TextEdit', 'rd_lgd_cod': 'TextEdit', 'dis_tamil': 'TextEdit', });
lyr_chennaiassemblyconstituencyboundaries_2.set('fieldImages', {'fid': '', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'AC_NO': 'Range', 'ASSEMBLY_C': 'TextEdit', 'ASSEMBLY_N': 'Range', 'DISTRICT': 'TextEdit', 'DIVISION_N': 'TextEdit', 'OBJECTID': 'Range', 'PARLIAMENT': 'TextEdit', 'REGION': 'TextEdit', 'SHAPE_AREA': 'TextEdit', 'SHAPE_LEN': 'TextEdit', 'ZN': 'TextEdit', });
lyr_chennaiparliamentaryconstituencies_3.set('fieldImages', {'fid': '', 'Name': 'TextEdit', 'description': 'TextEdit', 'timestamp': 'DateTime', 'begin': 'DateTime', 'end': 'DateTime', 'altitudeMode': 'TextEdit', 'tessellate': 'Range', 'extrude': 'Range', 'visibility': 'Range', 'drawOrder': 'Range', 'icon': 'TextEdit', 'OBJECTID': 'Range', 'PARLIAMENT': 'TextEdit', 'SHAPE_AREA': 'TextEdit', 'SHAPE_LEN': 'TextEdit', });
lyr_GCC_DIVISION_4.set('fieldImages', {'fid': 'TextEdit', 'id': 'TextEdit', 'name': 'TextEdit', '': 'TextEdit', });
lyr_GCC_ZONE_5.set('fieldImages', {'fid': 'TextEdit', 'id': 'TextEdit', 'zone_number': 'TextEdit', 'zone_name': 'TextEdit', 'wards_details': 'TextEdit', 'Number of Wards': 'Range', 'name': 'TextEdit', });
lyr_TNschoolsGIS_6.set('fieldImages', {'fid': '', 'SNO': 'Range', 'OBJECT_ID': 'Range', 'DISTRICT': 'TextEdit', 'BLOCK': 'TextEdit', 'EDUCATION_DISTRICT': 'TextEdit', 'NAME': 'TextEdit', 'MANAGING_DEPARTMENT': 'TextEdit', 'MANAGEMENT': 'TextEdit', 'CATEGORY': 'TextEdit', 'CATEGORY_GROUP': 'TextEdit', 'DIRECTORATE': 'TextEdit', 'LOCALBODY': 'TextEdit', 'TOWN_MUNICIPALITY': 'TextEdit', 'HABITATION': 'TextEdit', 'CLUSTER': 'TextEdit', 'LATITUTE': 'TextEdit', 'LONGITUDE': 'TextEdit', 'ASSEMBLY': 'TextEdit', 'PARLIAMENT': 'TextEdit', 'DEPT_CODE': 'TextEdit', 'STATUS': 'CheckBox', 'CREATED_BY': 'TextEdit', });
lyr_Districts_1.set('fieldLabels', {'fid': 'no label', 'dist_name': 'no label', 'ed_distric': 'no label', 'lgd_coed': 'no label', 'rd_lgd_cod': 'no label', 'dis_tamil': 'no label', });
lyr_chennaiassemblyconstituencyboundaries_2.set('fieldLabels', {'fid': 'no label', 'Name': 'no label', 'description': 'no label', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'AC_NO': 'no label', 'ASSEMBLY_C': 'no label', 'ASSEMBLY_N': 'no label', 'DISTRICT': 'no label', 'DIVISION_N': 'no label', 'OBJECTID': 'no label', 'PARLIAMENT': 'no label', 'REGION': 'no label', 'SHAPE_AREA': 'no label', 'SHAPE_LEN': 'no label', 'ZN': 'no label', });
lyr_chennaiparliamentaryconstituencies_3.set('fieldLabels', {'fid': 'no label', 'Name': 'no label', 'description': 'inline label - always visible', 'timestamp': 'no label', 'begin': 'no label', 'end': 'no label', 'altitudeMode': 'no label', 'tessellate': 'no label', 'extrude': 'no label', 'visibility': 'no label', 'drawOrder': 'no label', 'icon': 'no label', 'OBJECTID': 'no label', 'PARLIAMENT': 'no label', 'SHAPE_AREA': 'no label', 'SHAPE_LEN': 'no label', });
lyr_GCC_DIVISION_4.set('fieldLabels', {'fid': 'hidden field', 'id': 'hidden field', 'name': 'hidden field', });
lyr_GCC_ZONE_5.set('fieldLabels', {'fid': 'hidden field', 'id': 'hidden field', 'zone_number': 'inline label - always visible', 'zone_name': 'inline label - always visible', 'wards_details': 'hidden field', 'Number of Wards': 'hidden field', 'name': 'inline label - always visible', });
lyr_TNschoolsGIS_6.set('fieldLabels', {'fid': 'hidden field', 'SNO': 'hidden field', 'OBJECT_ID': 'hidden field', 'DISTRICT': 'header label - always visible', 'BLOCK': 'inline label - always visible', 'EDUCATION_DISTRICT': 'inline label - always visible', 'NAME': 'inline label - always visible', 'MANAGING_DEPARTMENT': 'inline label - always visible', 'MANAGEMENT': 'inline label - always visible', 'CATEGORY': 'inline label - always visible', 'CATEGORY_GROUP': 'inline label - always visible', 'DIRECTORATE': 'inline label - always visible', 'LOCALBODY': 'inline label - always visible', 'TOWN_MUNICIPALITY': 'inline label - always visible', 'HABITATION': 'inline label - always visible', 'CLUSTER': 'inline label - always visible', 'LATITUTE': 'hidden field', 'LONGITUDE': 'hidden field', 'ASSEMBLY': 'inline label - always visible', 'PARLIAMENT': 'inline label - always visible', 'DEPT_CODE': 'inline label - always visible', 'STATUS': 'hidden field', 'CREATED_BY': 'hidden field', });
lyr_TNschoolsGIS_6.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});