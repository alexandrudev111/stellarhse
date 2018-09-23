(function () {
    var controller = function ($scope, $uibModalInstance, coreReportService, coreService, uiGridExporterConstants, field, constantService, $interval, $uibModal) {
        $scope.old_field = angular.copy(field);
        $scope.field = field;
        $scope.disableSaveBtn = true;
        $scope.hasValues = false;
        $scope.manageValues = false;
        $scope.hasSubValues = false;
        var fields_data = {
            type: $scope.field.reportType,
            field: $scope.field
        };
        console.log(fields_data);
        var cellTempRequired = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div>\n\
<div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD" required/></div>';
        var cellTempNotRequired = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div>\n\
<div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"/></div>';
        var cellTempNotRequiredDisabled = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div>\n\
<div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD" disabled/></div>';

        $scope.gridOptions = coreService.getGridOptions();
        $scope.gridOptions.exporterCsvFilename = 'FieldValues.csv';
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        $scope.gridOptions2 = coreService.getGridOptions();
        $scope.gridOptions2.exporterCsvFilename = 'FieldSubValues.csv';
        $scope.gridOptions2.onRegisterApi = function (gridApi) {
            $scope.gridApi2 = gridApi;
        };
        // open popup
//        $scope.gridOptions = {
//            paginationPageSizes: [10, 20, 30],
//            paginationPageSize: 10,
//            enableColumnResizing: true,
//            enableFiltering: true,
//            columnDefs: [],
//            multiSelect: false,
//            enableGridMenu: true,
//            enableSelectAll: true,
//            exporterMenuPdf: false,
//            exporterMenuCsv: false,
//            exporterCsvFilename: 'FieldValues.csv',
//            exporterPdfDefaultStyle: {fontSize: 9},
//            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
//            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
//            exporterPdfHeader: {text: "My Header", style: 'headerStyle'},
//            exporterPdfFooter: function (currentPage, pageCount) {
//                return {text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle'};
//            },
//            exporterPdfCustomFormatter: function (docDefinition) {
//                docDefinition.styles.headerStyle = {fontSize: 22, bold: true};
//                docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
//                return docDefinition;
//            },
//            exporterPdfOrientation: 'portrait',
//            exporterPdfPageSize: 'LETTER',
//            exporterPdfMaxGridWidth: 500,
//            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
//            onRegisterApi: function (gridApi) {
//                $scope.gridApi = gridApi;
//            }
//        };
//
//        $scope.gridOptions.showGridFooter = true;
//        $scope.gridOptions.showColumnFooter = true;

//        var fakeI18n = function (title) {
//            var deferred = $q.defer();
//            $interval(function () {
//                deferred.resolve('col: ' + title);
//            }, 1000, 1);
//            return deferred.promise;
//        };$scope.gridApi.selection.getSelectedRows().length
        $scope.$watch('field.is_mandatory', function (newVal) {
            if (angular.isDefined(newVal) && newVal === 'Yes') {
                $scope.field.is_hidden = 'No';
            }
        });
        $scope.$watch('gridApi.selection.getSelectedRows()', function (newVal) {
            if (angular.isDefined(newVal) && newVal.length) {
                var index = $scope.gridOptions.data.indexOf(newVal[0]);
                console.log($scope.gridOptions.data[index].editable)
                if ($scope.gridOptions.data[index].editable)
                    $scope.disableSaveBtn = false;
                else
                    $scope.disableSaveBtn = true;
            }
            else
                $scope.disableSaveBtn = true;
        }, true);
        $scope.getFieldValues = function () {
            coreReportService.getFieldValues(fields_data)
                    .then(function (response) {
//                    $scope.columns = response.data.columns;
                        $scope.values = response.data;
                        console.log($scope.values);
                        prepareValuesGrid();
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });

        };
        $scope.getFieldSubValues = function () {
            var data = {
                type: $scope.field.reportType,
                subTypeTableName: $scope.subTypeTableName,
                mainTypeKey: $scope.mainTypeKey,
                mainTable: $scope.mainTable,
                mainFieldName: $scope.mainFieldName,
                subTypeName: $scope.subTypeName,
                mainValueId: '',
                language_id: $scope.field.language_id
            };
            var mainValueId = '';
            console.log($scope.gridApi.selection.getSelectedRows()[0])
            if (angular.isDefined($scope.gridApi.selection.getSelectedRows()) && $scope.gridApi.selection.getSelectedRows().length) {
                mainValueId = $scope.gridApi.selection.getSelectedRows()[0][$scope.mainTypeKey];
                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'underlying_causes_title') {
                    mainValueId = $scope.gridApi.selection.getSelectedRows()[0]['observation_and_analysis_param_id'];
                    data.field_name = $scope.field.field_name;
                }
            } else {
                mainValueId = $scope.gridOptions.data[0][$scope.mainTypeKey];
                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'underlying_causes_title') {
                    mainValueId = $scope.gridOptions.data[0]['observation_and_analysis_param_id'];
                    data.field_name = $scope.field.field_name;
                }
                $interval(function () {
                    $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
                }, 0, 1);
            }
            data.mainValueId = mainValueId;
            console.log(mainValueId);
            console.log(data);
//            if ($scope.field.field_name === 'type_and_subtype')
//                fields_data.mainValueId = $scope.gridApi.selection.getSelectedRows()[0].effects_type_id;
//            else if ($scope.field.field_name === 'cause_types_and_subtypes')
//                fields_data.mainValueId = $scope.gridApi.selection.getSelectedRows()[0].cause_types_id;
            coreReportService.getFieldSubValues(data)
                    .then(function (response) {
//                    $scope.columns = response.data.columns;
                        $scope.subValues = response.data;
                        console.log($scope.subValues);
                        $scope.gridOptions2.data = $scope.subValues;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });

        };
//        if ($scope.field.table_name !== '') {
        if ($scope.field.field_name === 'event_type_id' || $scope.field.field_name === 'operation_type_id' || $scope.field.field_name === 'department_responsible_id' || $scope.field.field_name == 'risk_level_sup_type_id'||$scope.field.field_name == 'risk_level_type_id'||$scope.field.field_name == 'potential_impacts_description'||$scope.field.field_name == 'potential_impact_of_hazard'||$scope.field.field_name==='report_owner'||
                $scope.field.field_name === 'crew_involved' || $scope.field.field_name === 'status_id' ||
                $scope.field.field_name === 'potential_impact_of_hazard' || $scope.field.field_name === 'probability_of_hazard' ||
                $scope.field.field_name === 'frequency_of_worker_exposure' || $scope.field.field_name === 'severity_of_potential_consequences' ||
                $scope.field.field_name === 'risk_control_id' || $scope.field.field_name === 'type_and_subtype' ||
                $scope.field.field_name === 'cause_types_and_subtypes' || $scope.field.field_name === 'corrective_action_status_id' ||
                $scope.field.field_name === 'corrective_action_priority_id' || $scope.field.field_name === 'certificate_id' ||
                $scope.field.field_name === 'acting_id' || $scope.field.field_name === 'inspection_reason_id' ||
                $scope.field.field_name === 'maintenance_reason_id' || $scope.field.field_name === 'training_reason_id' ||
                $scope.field.field_name === 'level_achieved_id' || $scope.field.field_name === 'quality_of_training_id' ||
                $scope.field.field_name === 'oe_department_id' || $scope.field.field_name === 'env_conditions' ||
                $scope.field.field_name === 'impact_type_id' || $scope.field.field_name === 'ext_agency_id' ||
                $scope.field.field_name === 'energy_form' || $scope.field.field_name === 'substandard_actions' ||
                $scope.field.field_name === 'substandard_conditions' || $scope.field.field_name === 'underlying_causes_title' ||
                $scope.field.field_name === 'inv_status_id' || $scope.field.field_name === 'investigation_risk_of_recurrence_id' ||
                $scope.field.field_name === 'investigation_severity_id' || $scope.field.field_name === 'inv_source_param_id' ||
                $scope.field.field_name === 'root_cause_param_id' || $scope.field.field_name === 'illness_initial_treatment_id' ||
                $scope.field.field_name === 'symptoms_id' || $scope.field.field_name === 'traffic_vehicle_type_id' ||
                $scope.field.field_name === 'damage_vehicle_type_id' || $scope.field.field_name === 'source_id' ||
                $scope.field.field_name === 'duration_unit_id' || $scope.field.field_name === 'quantity_unit_id' ||
                $scope.field.field_name === 'recovered_unit_id' || $scope.field.field_name === 'spill_reported_to' ||
                $scope.field.field_name === 'injury_initial_treatment_id' || $scope.field.field_name === 'body_part_id' ||
                $scope.field.field_name === 'contact_code_id' || $scope.field.field_name === 'injury_type_id' ||
                $scope.field.field_name === 'injury_contact_agency_id' || $scope.field.field_name === 'body_area_id') {
//            if ($scope.field.field_name === 'impact_sub_type_id')
////                    $scope.subTypeName = 'root_cause_param_name';
////                    $scope.subTypeKey = 'root_cause_param_id';
////                    $scope.mainTypeKey = 'root_cause_id';
////                    $scope.mainTable = 'root_cause';
////                    $scope.mainFieldName = 'root_cause_name';
////                    $scope.subTypeTableName = 'root_cause_param';
//                fields_data = {
//                    type: $scope.field.reportType,
//                    field: $scope.field,
//                    subTypeTableName: 'stellarhse_common.impact_sub_type',
//                    mainTypeKey: 'impact_type_id',
//                    mainTable: 'stellarhse_common.impact_type',
//                    mainFieldName: 'impact_type_name',
//                    subTypeName: 'impact_sub_type_name',
//                    mainValueId: 'All',
//                    language_id: $scope.field.language_id
//                };
            $scope.hasValues = true;
            $scope.getFieldValues();
        } else if ($scope.field.field_name === "location") {
            $scope.valueName = "Locations";
            $scope.valueModule = "Locations";
            $scope.valueModuleLink = "#/Location";
            $scope.manageValues = true;
        } else if ($scope.field.field_name === "contractor_id") {
            $scope.valueName = "Contractors";
            $scope.valueModule = "Third Parties";
            $scope.valueModuleLink = "#/thirdParties";
            $scope.manageValues = true;
        } else if ($scope.field.field_name === "customer_id") {
            $scope.valueName = "Customers";
            $scope.valueModule = "Third Parties";
            $scope.valueModuleLink = "#/thirdParties";
            $scope.manageValues = true;
        } else if ($scope.field.field_name === "equipment_name") {
            $scope.valueName = "Equipments";
            $scope.valueModule = "Equipments";
            $scope.valueModuleLink = "#/equipments";
            $scope.manageValues = true;
        } else if ($scope.field.field_name === "people_involved_name") {
            $scope.valueName = "People";
            $scope.valueModule = "Manage People";
            $scope.valueModuleLink = "#/ManagePeople";
            $scope.manageValues = true;
        } else if ($scope.field.field_name === "type_of_energy_id") {
            $scope.valueName = "SCAT";
            $scope.valueModule = "Manage SCAT";
            $scope.valueModuleLink = "#/ManageSCAT";
            $scope.manageValues = true;
        }
//        if ($scope.field.field_name === 'type_and_subtype' || $scope.field.field_name === 'cause_types_and_subtypes') {
//            $scope.hasSubValues = true;
//            console.log($scope.hasSubValues);
//            $scope.getFieldSubValues();
//        }
        $scope.saveField = function () {
            coreReportService.saveField(fields_data)
                    .then(function (response) {
                        if (response.data === 1) {// saved successfully
                            $uibModalInstance.close($scope.field);
                        } else {//no changes saved
                            $uibModalInstance.dismiss('cancel');
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        };
        $scope.cancel = function () {
            $scope.field = angular.copy($scope.old_field);
            $uibModalInstance.dismiss('cancel');
        };

        var prepareValuesGrid = function () {
            $scope.gridOptions.data = $scope.values;
            switch ($scope.field['field_name']) {
                case 'event_type_id':
                    switch ($scope.field['reportType']) {
                        case 'hazard':
                            $scope.gridOptions.columnDefs = [
                                {name: 'haz_type_name', minWidth: 150, displayName: 'Hazard Type', cellTemplate: cellTempRequired, required: true},
                                {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                            ];
                            break;
                        case 'inspection':
                            $scope.gridOptions.columnDefs = [
                                {name: 'inspection_type_name', minWidth: 150, displayName: 'Inspection Type', cellTemplate: cellTempRequired, required: true},
                                {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                            ];
                            break;
                        case 'safetymeeting':
                            $scope.gridOptions.columnDefs = [
                                {name: 'safetymeeting_type_name', minWidth: 150, displayName: 'Meeting Type', cellTemplate: cellTempRequired, required: true},
                                {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                            ];
                            break;
                        case 'maintenance':
                            $scope.gridOptions.columnDefs = [
                                {name: 'maintenance_type_name', minWidth: 150, displayName: 'Maintenance Type', cellTemplate: cellTempRequired, required: true},
                                {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                            ];
                            break;
                        case 'incident':
                            $scope.gridOptions.columnDefs = [
                                {name: 'incident_event_type_name', minWidth: 150, displayName: 'Incident Type', cellTemplate: cellTempRequired, required: true},
                                {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                            ];
                            break;
                    }
                    break;
                case 'inspection_reason_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'inspection_reason_name', minWidth: 150, displayName: 'Inspection Reason', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'maintenance_reason_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'maintenance_reason_name', minWidth: 150, displayName: 'Maintenance Reason', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'training_reason_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'training_reason_name', minWidth: 150, displayName: 'Training Reason', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'report_owner':
                    $scope.gridOptions.columnDefs = [
                        {name: 'metrics_scope_name', minWidth: 150, displayName: 'Owner Name', enableCellEdit: false},
                        {name: 'hide', minWidth: 150, displayName: 'Hide/UnHide', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'level_achieved_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'level_achieved_name', minWidth: 150, displayName: 'Level achieved', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'quality_of_training_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'level_quality_name', minWidth: 150, displayName: 'Quality of training', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'operation_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'operation_type_name', minWidth: 150, displayName: 'Operation Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'crew_involved':
                    $scope.gridOptions.columnDefs = [
                        {name: 'crew_name', minWidth: 150, displayName: 'Crew Name', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'department_responsible_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'department_responsible_name', minWidth: 150, displayName: 'Department Responsible Name', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'risk_level_sup_type_id':
                case 'risk_level_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'risk_level_sup_type_name', minWidth: 150, displayName: 'Impact Type Name', cellTemplate: cellTempRequired, required: true}
                    ];
                    break;
                case 'status_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'status_Name', minWidth: 150, displayName: 'Status Name', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'potential_impact_of_hazard':
                    $scope.gridOptions.columnDefs = [
                        {name: 'impact_type_name', minWidth: 150, displayName: 'Potential Impact', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'probability_of_hazard':
                case 'frequency_of_worker_exposure':
                case 'severity_of_potential_consequences':
                    $scope.gridOptions.columnDefs = [
                        {name: 'risk_level_degree', minWidth: 150, displayName: 'Risk Level Degree', cellTemplate: cellTempRequired, required: true},
                        {name: 'risk_level_value', minWidth: 150, displayName: 'Risk Level Value', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'risk_control_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'risk_control_name', minWidth: 150, displayName: 'Risk Controls', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'type_and_subtype':
                    $scope.gridOptions.columnDefs = [
                        {name: 'effects_type_name', minWidth: 150, displayName: 'Hazard/Deficiency Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'effects_sub_type_name';
                    $scope.subTypeKey = 'effects_sub_type_id';
                    $scope.mainTypeKey = 'effects_type_id';
                    $scope.mainTable = 'stellarhse_common.effects_type';
                    $scope.mainFieldName = 'effects_type_name';
                    $scope.subTypeTableName = 'stellarhse_common.effects_sub_type';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'effects_sub_type_name', minWidth: 150, displayName: 'Hazard/Deficiency Sub Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'effects_type_name', minWidth: 150, displayName: 'Hazard/Deficiency Type', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'cause_types_and_subtypes':
                    $scope.gridOptions.columnDefs = [
                        {name: 'cause_types_name', minWidth: 150, displayName: 'Cause Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'cause_sub_types_name';
                    $scope.subTypeKey = 'cause_sub_types_id';
                    $scope.mainTypeKey = 'cause_types_id';
                    $scope.mainTable = 'stellarhse_common.cause_types';
                    $scope.mainFieldName = 'cause_types_name';
                    $scope.subTypeTableName = 'stellarhse_common.cause_sub_types';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'cause_sub_types_name', minWidth: 150, displayName: 'Cause Sub Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'cause_types_name', minWidth: 150, displayName: 'Cause Type', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'certificate_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'certificate_name', minWidth: 150, displayName: 'Current Certifications', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'acting_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'acting_name', minWidth: 150, displayName: 'Acting as', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'corrective_action_status_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'corrective_action_status_name', minWidth: 150, displayName: 'Status', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'corrective_action_priority_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'corrective_action_priority_name', minWidth: 150, displayName: 'Priority', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'oe_department_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'oe_department_name', minWidth: 150, displayName: 'Incident reported to', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'env_conditions':
                    $scope.gridOptions.columnDefs = [
                        {name: 'env_condition_name', minWidth: 150, displayName: 'Environment Condition', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'env_cond_parameter_name';
                    $scope.subTypeKey = 'env_cond_parameter_id';
                    $scope.mainTypeKey = 'env_condition_id';
                    $scope.mainTable = 'env_condition';
                    $scope.mainFieldName = 'env_condition_name';
                    $scope.subTypeTableName = 'env_cond_parameter';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'env_cond_parameter_name', minWidth: 150, displayName: 'Environment Sub Condition', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'env_condition_name', minWidth: 150, displayName: 'Environment Condition', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'impact_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'impact_type_name', minWidth: 150, displayName: 'Main Impact Category', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'impact_sub_type_name';
                    $scope.subTypeKey = 'impact_sub_type_id';
                    $scope.mainTypeKey = 'impact_type_id';
                    $scope.mainTable = 'stellarhse_common.impact_type';
                    $scope.mainFieldName = 'impact_type_name';
                    $scope.subTypeTableName = 'stellarhse_common.impact_sub_type';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'impact_sub_type_name', minWidth: 150, displayName: 'Impact Sub Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'impact_type_name', minWidth: 150, displayName: 'Main Impact Type', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'ext_agency_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'ext_agency_name', minWidth: 150, displayName: 'External Agency Name', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'energy_form':
                    var mainDisplayName = 'Unwanted Energy Form';
                    var subDisplayName = 'Sub-Unwanted Energy Form';
                    $scope.gridOptions.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: mainDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'is_multi', minWidth: 150, displayName: 'List Type', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'observation_and_analysis_param_name';
                    $scope.subTypeKey = 'observation_and_analysis_param_id';
                    $scope.mainTypeKey = 'parent_id';
                    $scope.mainTable = 'observation_analysis_param';
                    $scope.mainFieldName = 'observation_and_analysis_param_name';
                    $scope.subTypeTableName = 'observation_analysis_param';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: subDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'main_category', minWidth: 150, displayName: 'Factor Category', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'substandard_actions':
                    var mainDisplayName = 'Substandard/Unsafe Actions';
//                    var subDisplayName = 'Sub-Substandard/Unsafe Actions';
                    $scope.gridOptions.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: mainDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                    ];
                    break;
                case 'substandard_conditions':
                    var mainDisplayName = 'Substandard/Unsafe Conditions';
//                    var subDisplayName = 'Sub-Substandard/Unsafe Conditions';
                    $scope.gridOptions.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: mainDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                    ];
                    break;
                case 'underlying_causes_title':
                    var mainDisplayName = 'Personal and Job Factors';
                    var subDisplayName = 'Sub-Personal and Job Factors';
                    $scope.gridOptions.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: mainDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'is_multi', minWidth: 150, displayName: 'List Type', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'observation_and_analysis_param_name';
                    $scope.subTypeKey = 'observation_and_analysis_param_id';
                    $scope.mainTypeKey = 'parent_id';
                    $scope.mainTable = 'observation_analysis_param';
                    $scope.mainFieldName = 'observation_and_analysis_param_name';
                    $scope.subTypeTableName = 'observation_analysis_param';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'observation_and_analysis_param_name', minWidth: 150, displayName: subDisplayName, cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'main_category', minWidth: 150, displayName: 'Factor Category', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'inv_status_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'inv_status_name', minWidth: 150, displayName: 'Investigation Status', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'inv_source_param_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'inv_source_name', minWidth: 150, displayName: 'Investigation Source', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'root_cause_param_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'root_cause_name', minWidth: 150, displayName: 'Root Cause Findings', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    $scope.subTypeName = 'root_cause_param_name';
                    $scope.subTypeKey = 'root_cause_param_id';
                    $scope.mainTypeKey = 'root_cause_id';
                    $scope.mainTable = 'root_cause';
                    $scope.mainFieldName = 'root_cause_name';
                    $scope.subTypeTableName = 'root_cause_param';

                    $scope.gridOptions2.columnDefs = [
                        {name: 'root_cause_param_name', minWidth: 150, displayName: 'Specific Root Cause', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false},
                        {name: 'root_cause_name', minWidth: 150, displayName: 'Root Cause Category', cellTemplate: cellTempNotRequiredDisabled, required: false}
                    ];
                    $scope.hasSubValues = true;
                    $scope.getFieldSubValues();
                    break;
                case 'investigation_risk_of_recurrence_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'risk_of_recurrence_name', minWidth: 150, displayName: 'Investigation Risk of Recurrence', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'investigation_severity_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'severity_name', minWidth: 150, displayName: 'Investigation Severity', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'illness_initial_treatment_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'initial_treatment_name', minWidth: 150, displayName: 'Initial Treatment', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'symptoms_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'description', minWidth: 150, displayName: 'Symptom Description', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'traffic_vehicle_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'vehicle_type_name', minWidth: 150, displayName: 'Vehicle Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'damage_vehicle_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'vehicle_type_name', minWidth: 150, displayName: 'Vehicle Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'source_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'spill_release_source_name', minWidth: 150, displayName: 'Spill/Release Source', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'duration_unit_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'duration_unit_name', minWidth: 150, displayName: 'Duration Unit', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'quantity_unit_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'quantity_unit_name', minWidth: 150, displayName: 'Quantity Unit', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'recovered_unit_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'quantity_unit_name', minWidth: 150, displayName: 'Quantity Unit', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'spill_reported_to':
                    $scope.gridOptions.columnDefs = [
                        {name: 'spill_release_agency_name', minWidth: 150, displayName: 'Spill/Release Agency', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'injury_initial_treatment_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'initial_treatment_name', minWidth: 150, displayName: 'Initial Treatment', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'body_part_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'body_part_name', minWidth: 150, displayName: 'Body Part', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'contact_code_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'contact_code_name', minWidth: 150, displayName: 'Contact Code', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'injury_type_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'injury_type_name', minWidth: 150, displayName: 'Injury Type', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'injury_contact_agency_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'contact_agency_name', minWidth: 150, displayName: 'Contact Agency', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
                case 'body_area_id':
                    $scope.gridOptions.columnDefs = [
                        {name: 'body_area_name', minWidth: 150, displayName: 'Body Area', cellTemplate: cellTempRequired, required: true},
                        {name: 'order', minWidth: 150, displayName: 'Order', cellTemplate: cellTempNotRequired, required: false}
                    ];
                    break;
            }
        };

        $scope.addFieldValue = function (gridNumber) {
            if (gridNumber === 1) {
                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'substandard_actions' ||
                        $scope.field.field_name === 'substandard_conditions' || $scope.field.field_name === 'underlying_causes_title') {
                    var newVal = {operation: 'add', language_id: $scope.field.language_id,
                        observation_and_analysis_id: $scope.gridOptions.data[1].observation_and_analysis_id};
                } else {
                    var newVal = {operation: 'add', language_id: $scope.field.language_id, org_id: $scope.field.org_id};
                }
                $scope.gridOptions.data.unshift(newVal);
                $interval(function () {
                    $scope.gridApi.selection.selectRow($scope.gridOptions.data[0]);
                }, 0, 1);
                $scope.gridOptions.data[0].editable = true;
            } else {
                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'underlying_causes_title') {
                    var newVal = {operation: 'add', language_id: $scope.field.language_id,
                        observation_and_analysis_id: $scope.gridOptions.data[1].observation_and_analysis_id};
                    newVal[$scope.mainTypeKey] = $scope.gridApi.selection.getSelectedRows()[0]['observation_and_analysis_param_id'];
                    newVal['main_category'] = $scope.gridApi.selection.getSelectedRows()[0][$scope.mainFieldName];
                } else {
                    var newVal = {operation: 'add', language_id: $scope.field.language_id};
                    newVal[$scope.mainTypeKey] = $scope.gridApi.selection.getSelectedRows()[0][$scope.mainTypeKey];
                    newVal[$scope.mainFieldName] = $scope.gridApi.selection.getSelectedRows()[0][$scope.mainFieldName];
                }
                $scope.gridOptions2.data.unshift(newVal);
                $interval(function () {
                    $scope.gridApi2.selection.selectRow($scope.gridOptions2.data[0]);
                }, 0, 1);
                $scope.gridOptions2.data[0].editable = true;
            }
        };
        $scope.editFieldValue = function (gridNumber) {
            if (gridNumber === 1) {
                if ($scope.gridApi.selection.getSelectedRows().length) {
                    var index = $scope.gridOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                    $scope.gridOptions.data[index].editable = true;
                    console.log($scope.gridApi.selection.getSelectedRows()[0]);
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            } else {
                if ($scope.gridApi2.selection.getSelectedRows().length) {
                    var index = $scope.gridOptions2.data.indexOf($scope.gridApi2.selection.getSelectedRows()[0]);
                    $scope.gridOptions2.data[index].editable = true;
                    console.log($scope.gridApi2.selection.getSelectedRows()[0]);
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
                }
            }
        };
        $scope.saveFieldValue = function () {
            coreService.resetAlert();
            var requiredFields = true;
            var validFields = true;
            var data = {
                type: $scope.field.reportType,
                table_name: $scope.field.table_name,
                field_key: $scope.field.field_key,
                field_name: $scope.field.field_name
//                key: $scope.key
            };
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $scope.gridOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                if ($scope.gridOptions.data[index].editable) {
                    angular.forEach($scope.gridOptions.columnDefs, function (col) {
                        if (col['required'])
                            if (!angular.isDefined($scope.gridOptions.data[index][col['name']]) ||
                                    $scope.gridOptions.data[index][col['name']] === '' ||
                                    $scope.gridOptions.data[index][col['name']] === null) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'error', message: constantService.getMessage('requiredField') + ': ' + col['displayName']});
                                requiredFields = false;
                            }
                    });
                    if (requiredFields) {
                        angular.forEach($scope.gridOptions.data, function (row, key) {
                            if (row[$scope.field.table_field_name] === $scope.gridApi.selection.getSelectedRows()[0][$scope.field.table_field_name]
                                    && key !== index) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'error', message: constantService.getMessage('existValue')});
                                validFields = false;
                            }
                        });
                        if (validFields) {
                            $scope.gridOptions.data[index].editable = false;
                            data.fieldKey = $scope.gridOptions.columnDefs;
                            data.fieldValue = $scope.gridApi.selection.getSelectedRows()[0];
                            if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add')
                                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'substandard_actions' ||
                                        $scope.field.field_name === 'substandard_conditions' || $scope.field.field_name === 'underlying_causes_title') {
                                    data.fieldKey.push({name: 'language_id'}, {name: 'observation_and_analysis_id'});
                                } else
                                    data.fieldKey.push({name: 'language_id'}, {name: 'org_id'});
                            console.log(data)
                            coreReportService.saveFieldValue(data)
                                    .then(function (response) {
//                    $scope.columns = response.data.columns;
                                        if (response.data == 1)
                                            if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add')
                                                coreService.setAlert({type: 'success', message: constantService.getMessage('addRecord')});
                                            else
                                                coreService.setAlert({type: 'success', message: constantService.getMessage('updateRecord')});
                                        $scope.getFieldValues();
                                    }, function (error) {
                                        coreService.resetAlert();
                                        coreService.setAlert({type: 'exception', message: error.data});
                                    });
                        }
                    }
                }
            }
//            else {
//                coreService.resetAlert();
//                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
//            }
        };
        $scope.deleteFieldValue = function () {
            coreService.resetAlert();
            var data = {
                type: $scope.field.reportType,
                table_name: $scope.field.table_name,
                field_key: $scope.field.field_key
//                key: $scope.key
            };
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var msg = {
                    title: constantService.getMessage('delete_confirm_title'),
                    body: constantService.getMessage('delete_confirm_msg')
                };
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreModule/views/confirm.html',
                    controller: 'ShowPopUpController',
                    backdrop: 'static',
                    resolve: {
                        msg: msg
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result === 'ok') {
                        var index = $scope.gridOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                        data.fieldValue = $scope.gridApi.selection.getSelectedRows()[0];
                        console.log(data)
                        if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add') {
                            $scope.gridOptions.data.splice(index, 1);
                            coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
                        } else
                            coreReportService.deleteFieldValue(data)
                                    .then(function (response) {
//                    $scope.columns = response.data.columns;
//                            $scope.getFieldValues();
                                        if (response.data === 1) {
                                            $scope.gridOptions.data.splice(index, 1);
                                            coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
//                                            if ($scope.field.field_name === 'type_and_subtype' || $scope.field.field_name === 'cause_types_and_subtypes') {
//                                                $scope.getFieldSubValues();
//                                            }
                                        }
                                    }, function (error) {
                                        coreService.resetAlert();
                                        coreService.setAlert({type: 'exception', message: error.data});
                                    });
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.saveFieldSubValue = function () {
            coreService.resetAlert();
            var requiredFields = true;
            var validFields = true;
            var data = {
                type: $scope.field.reportType,
                table_name: $scope.subTypeTableName,
                field_key: $scope.subTypeKey,
                field_name: $scope.subTypeName
//                key: $scope.key
            };
            if ($scope.gridApi2.selection.getSelectedRows().length) {
                var index = $scope.gridOptions2.data.indexOf($scope.gridApi2.selection.getSelectedRows()[0]);
                if ($scope.gridOptions2.data[index].editable) {
                    angular.forEach($scope.gridOptions2.columnDefs, function (col) {
                        if (col['required'])
                            if (!angular.isDefined($scope.gridOptions2.data[index][col['name']]) ||
                                    $scope.gridOptions2.data[index][col['name']] === '' ||
                                    $scope.gridOptions2.data[index][col['name']] === null) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'error', message: constantService.getMessage('requiredField') + ': ' + col['displayName']});
                                requiredFields = false;
                            }
                    });
                    if (requiredFields) {
                        angular.forEach($scope.gridOptions2.data, function (row, key) {
                            if (row[$scope.subTypeName] === $scope.gridApi2.selection.getSelectedRows()[0][$scope.subTypeName]
                                    && key !== index) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'error', message: constantService.getMessage('existValue')});
                                validFields = false;
                            }
                        });
                        if (validFields) {
                            $scope.gridOptions2.data[index].editable = false;
                            data.fieldKey = $scope.gridOptions2.columnDefs;
                            data.fieldValue = $scope.gridApi2.selection.getSelectedRows()[0];
                            if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add') {
                                if ($scope.field.field_name === 'energy_form' || $scope.field.field_name === 'underlying_causes_title') {
                                    data.fieldKey.push({name: 'observation_and_analysis_id'});
                                }
                                data.fieldKey.push({name: $scope.mainTypeKey}, {name: 'language_id'});
                                data.fieldValue.language_id = $scope.field.language_id;
                            }
                            data.fieldKey.splice(2, 1);
                            console.log(data)
                            coreReportService.saveFieldValue(data)
                                    .then(function (response) {
                                        if (response.data == 1)
                                            if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add')
                                                coreService.setAlert({type: 'success', message: constantService.getMessage('addRecord')});
                                            else
                                                coreService.setAlert({type: 'success', message: constantService.getMessage('updateRecord')});
                                        prepareValuesGrid();
                                    }, function (error) {
                                        coreService.resetAlert();
                                        coreService.setAlert({type: 'exception', message: error.data});
                                    });
                        }
                    }
                }
            }
//            else {
//                coreService.resetAlert();
//                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
//            }
        };
        $scope.deleteFieldSubValue = function () {
            coreService.resetAlert();
            var data = {
                type: $scope.field.reportType,
                table_name: $scope.subTypeTableName,
                field_key: $scope.subTypeName
//                key: $scope.key
            };
            if ($scope.gridApi2.selection.getSelectedRows().length) {
                var msg = {
                    title: constantService.getMessage('delete_confirm_title'),
                    body: constantService.getMessage('delete_confirm_msg')
                };
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'app/modules/coreModule/views/confirm.html',
                    controller: 'ShowPopUpController',
                    backdrop: 'static',
                    resolve: {
                        msg: msg
                    }
                });
                modalInstance.result.then(function (result) {
                    if (result === 'ok') {
                        var index = $scope.gridOptions2.data.indexOf($scope.gridApi2.selection.getSelectedRows()[0]);
                        data.fieldValue = $scope.gridApi2.selection.getSelectedRows()[0];
                        console.log(data)
                        if (data.fieldValue.hasOwnProperty('operation') && data.fieldValue.operation === 'add') {
                            $scope.gridOptions2.data.splice(index, 1);
                            coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
                        } else
                            coreReportService.deleteFieldValue(data)
                                    .then(function (response) {
//                    $scope.columns = response.data.columns;
//                            $scope.getFieldValues();
                                        if (response.data === 1) {
                                            $scope.gridOptions2.data.splice(index, 1);
                                            coreService.setAlert({type: 'success', message: constantService.getMessage('deleteRecord')});
                                        }
                                    }, function (error) {
                                        coreService.resetAlert();
                                        coreService.setAlert({type: 'exception', message: error.data});
                                    });
                    }
                }, function () {
                    console.log('modal-component dismissed at: ' + new Date());
                });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.downloadCSV = function (gridNumber) {
            if (gridNumber === 1) {
                $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
                //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
            } else {
                $scope.gridApi2.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
                //$scope.gridApi2.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
            }
        };
        $scope.downloadPDF = function (gridNumber) {
            if (gridNumber === 1) {
                $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            } else {
                $scope.gridApi2.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            }
        };
    };
    controller.$inject = ['$scope', '$uibModalInstance', 'coreReportService', 'coreService', 'uiGridExporterConstants', 'field', 'constantService', '$interval', '$uibModal'];
    angular.module("coreReportModule").controller("EditFieldController", controller);
}());