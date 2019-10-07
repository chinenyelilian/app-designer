/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables, util, odkData */
'use strict';

var healthFacilityResultSet = {};

function onFacilitySummaryClick() {
    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/health_facilities/html/health_facilities_detail_summary.html' + rowIdQueryParams);
    }
}

function onLinkClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/refrigerators/html/refrigerators_list.html' + rowIdQueryParams);
    }
}

function onAddFridgeClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
    // TODO: Should this use addRow and then edit for _id?
	jsonMap.refrigerator_id = util.genUUID();
	jsonMap._default_access = healthFacilityResultSet.get('_default_access');
	jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
	jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
	jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');

    odkTables.addRowWithSurvey(null, 'refrigerators', 'refrigerators', null, jsonMap);
}

function onCRInvClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/cold_rooms/html/cold_rooms_list.html' + rowIdQueryParams);
    }
}

function onAddCRClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
    // TODO: Should this use addRow and then edit for _id?
    jsonMap.cold_room_id = util.genUUID();
    jsonMap._default_access = healthFacilityResultSet.get('_default_access');
    jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
    jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
    jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');

    odkTables.addRowWithSurvey(null, 'cold_rooms', 'cold_rooms', null, jsonMap);
}

function onEditFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        odkTables.editRowWithSurvey(null, healthFacilityResultSet.getTableId(), healthFacilityResultSet.getRowId(0), 'health_facilities', null, null);
    }
}

function onDeleteFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        if (confirm('Are you sure you want to delete this health facility?')) {

            odkData.deleteRow(healthFacilityResultSet.getTableId(),
                null,
                healthFacilityResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbDeleteSuccess() {
    console.log('health facility deleted successfully');
}

function cbDeleteFailure(error) {

    console.log('health facility delete failure CB error : ' + error);
}

function cbSuccess(result) {

    healthFacilityResultSet = result;

     var access = healthFacilityResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFacilityBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFacilityBtn');
        deleteButton.removeClass('hideButton');
    }

    var refrigeratorCountPromise = new Promise(function(resolve, reject) {
        var frigCntQuery = 'SELECT COUNT(*) AS refrigerator_cnt FROM refrigerators WHERE refrigerators.facility_row_id = ?';
        var frigCntParams = [healthFacilityResultSet.get('_id')];
        odkData.arbitraryQuery('refrigerators', frigCntQuery, frigCntParams, null, null, resolve, reject);
    });

    var coldRoomCountPromise = new Promise(function(resolve, reject) {
        var crCntQuery = 'SELECT COUNT(*) AS cold_room_cnt FROM cold_rooms WHERE cold_rooms.facility_row_id = ?';
        var crCntParams = [healthFacilityResultSet.get('_id')];
        odkData.arbitraryQuery('cold_rooms', crCntQuery, crCntParams, null, null, resolve, reject);
    });



    Promise.all([refrigeratorCountPromise, coldRoomCountPromise]).then(function (resultArray) {
        refrigeratorsCBSuccess(resultArray[0], resultArray[1]);
    }, function(err) {
        console.log('promises failed with error: ' + err);
    });
}

function cbFailure(error) {

    console.log('health_facilities_detail getViewData CB error : ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();

    $('#refrig-inv').text(odkCommon.localizeText(locale, "refrigerator_inventory"));
    $('#add-fridge').text(odkCommon.localizeText(locale, "add_refrigerator"));

    $('#cold-room-inv').text(odkCommon.localizeText(locale, "cold_room_inventory"));
    $('#add-cold-room').text(odkCommon.localizeText(locale, "add_cold_room"));

    $('#edit-fac').text(odkCommon.localizeText(locale, "edit_facility"));
    $('#del-fac').text(odkCommon.localizeText(locale, "delete_facility"));

    odkData.getViewData(cbSuccess, cbFailure);
}

function refrigeratorsCBSuccess(frigCntResultSet, crCntResultSet) {

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    if (frigCntResultSet.getCount() > 0) {
        $('#fridge_list').text(frigCntResultSet.getData(0, 'refrigerator_cnt'));
    }

    if (crCntResultSet.getCount() > 0) {
        $('#cold_room_list').text(crCntResultSet.getData(0, 'cold_room_cnt'));
    }

}