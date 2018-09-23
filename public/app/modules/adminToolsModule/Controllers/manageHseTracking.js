(function () {

    var controller = function ($scope, $rootScope, constantService, customersService, $state, uiGridConstants, $filter, $uibModal, coreService, uiGridExporterConstants, $q, $stateParams) {
        $scope.manage_people_choice = $stateParams.grid; 
        console.log($scope.manage_people_choice);
        $scope.hse_tracking_report_choice = $stateParams.grid; 
        console.log($scope.hse_tracking_report_choice);
        $scope.permissions = coreService.getPermissions(); 
        console.log($scope.permissions);
        $scope.changeShownData = function () {
            /*if(coreService.getPreviousState() === 'AddLocation'){
             $scope.hse_tracking_report_choice = 'form_locations';
             }else  if(coreService.getPreviousState() === 'addThirdParties'){
             $scope.hse_tracking_report_choice = 'third_parties';
             }*/

            if ($scope.hse_tracking_report_choice === 'form_fields') {
                $scope.form_fields = true;
                $scope.form_locations = $scope.operation_types = $scope.third_parties = $scope.trainning_provider = $scope.form_equipment = $scope.custom_fields = false;
                //console.log("getOrgProducts");
                getOrgProducts();
            } else if ($scope.hse_tracking_report_choice === 'custom_fields') {
                $scope.custom_fields = true;

                $scope.form_locations = $scope.operation_types = $scope.third_parties = $scope.trainning_provider = $scope.form_equipment = $scope.form_fields = false;
                getOrgProducts()
            } else if ($scope.hse_tracking_report_choice === 'form_locations') {
                $scope.form_locations = true;
                $scope.form_fields = $scope.operation_types = $scope.third_parties = $scope.trainning_provider = $scope.form_equipment = $scope.custom_fields = false;
            } else if ($scope.hse_tracking_report_choice === 'operation_types') {
                $scope.operation_types = true;
                $scope.form_fields = $scope.form_locations = $scope.third_parties = $scope.trainning_provider = $scope.form_equipment = $scope.custom_fields = false;
            } else if ($scope.hse_tracking_report_choice === 'third_parties') {
                $scope.third_parties = true;
                $scope.form_fields = $scope.form_locations = $scope.operation_types = $scope.trainning_provider = $scope.form_equipment = $scope.custom_fields = false;
            } else if ($scope.hse_tracking_report_choice === 'trainning_provider') {
                $scope.trainning_provider = true;
                $scope.form_fields = $scope.form_locations = $scope.operation_types = $scope.third_parties = $scope.form_equipment = $scope.custom_fields = false;
            } else if ($scope.hse_tracking_report_choice === 'form_equipment') {
                $scope.form_equipment = true;
                $scope.form_fields = $scope.form_locations = $scope.operation_types = $scope.third_parties = $scope.trainning_provider = $scope.custom_fields = false;
            }


        };

        $scope.changeShownDataPeople = function () {
            if ($scope.manage_people_choice === 'people') {
                $scope.people = true;
                $scope.user_groups = $scope.user_account = false;
            } else if ($scope.manage_people_choice === 'user_groups') {
                $scope.user_groups = true;
                $scope.people = $scope.user_account = false;
            } else if ($scope.manage_people_choice === 'user_account') {
                $scope.user_account = true;
                $scope.people = $scope.user_groups = false;
            }
        };

        // Customize form Fields
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
        /*
         $scope.clearFilters = function() {
         $scope.gridApi.data = $scope.originalData;
         }*/
        /*
         $scope.clearFilters = function() {
         $scope.gridApi.clearAll();
         }*/
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.selectedReport = {};

        /*$rootScope.reportOptions = {
         paginationPageSizes: [10, 20, 30],
         paginationPageSize: 10,
         enableColumnResizing: true,
         enableFiltering: true,
         enableGridMenu: true,
         enableSelectAll: true,
         exporterMenuPdf: false,
         exporterMenuCsv: false,
         exporterCsvFilename: 'myFile.csv',
         exporterPdfDefaultStyle: {fontSize: 9},
         exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
         exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
         exporterPdfHeader: {text: "My Header", style: 'headerStyle'},
         exporterPdfFooter: function (currentPage, pageCount) {
         return {text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle'};
         },
         exporterPdfCustomFormatter: function (docDefinition) {
         docDefinition.styles.headerStyle = {fontSize: 22, bold: true};
         docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
         return docDefinition;
         },
         exporterPdfOrientation: 'portrait',
         exporterPdfPageSize: 'LETTER',
         exporterPdfMaxGridWidth: 500,
         exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
         onRegisterApi: function (gridApi) {
         $scope.gridApi = gridApi;
         }
         };*/
        //  $scope.hideGrid = false;
        $rootScope.reportOptions = coreService.getGridOptions();
        $rootScope.reportOptions.isRowSelectable = function () {
            return true;
        };
        $rootScope.reportOptions.onRegisterApi = function (gridApi) {
            $rootScope.gridApi = gridApi;
            $rootScope.reportOptions.enableFullRowSelection = true;
            $rootScope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //  var msg = 'row selected ' + row.isSelected;
                $scope.selectedReport = (row.isSelected ? row.entity : null);
                console.log($scope.selectedReport);
            });
        };
        // set width for columns
        /*
         for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
         $scope.gridOptions.columnDefs[i].width = '10%';
         }
         */
        var fakeI18n = function (title) {
            var deferred = $q.defer();
            $interval(function () {
                deferred.resolve('col: ' + title);
            }, 1000, 1);
            return deferred.promise;
        };

        // get data
        /* var data = [
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         },
         {
         "reportType": "report name"
         }
         ];*/
        $rootScope.reportOptions.columnDefs = [
            {name: 'reportType', minWidth: 150, categoryDisplayName: 'report Type', displayName: 'report Type', cellTooltip: true, headerTooltip: true}
        ];

        //get data dynamic
        var getOrgProducts = function () {
            customersService.getProductsByOrg({org_id: coreService.getUser().org_id})
                    .then(function (response) {
                        $scope.girdData = response.data;
                        console.log($rootScope.reportOptions.columnDefs);
                        console.log($scope.girdData);
                        $rootScope.reportOptions.showGridFooter = true;
                        $rootScope.reportOptions.showColumnFooter = true;
                        $rootScope.reportOptions.data = $scope.girdData;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }

        $scope.CustomizeFormFields = function () {
            coreService.resetAlert();
            if ($rootScope.gridApi.selection.getSelectedRows().length) {
                console.log($scope.selectedReport);
                switch ($scope.selectedReport.code) {
                    case 'Hazard':
                        $state.go('createhazardreport');
                        break;
                    case 'ABCanTrack':
                        $state.go('addincident');
                        break;
                    case 'Inspection':
                        $state.go('createinspectionreport');
                        break;
                    case 'MaintenanceManagement':
                        $state.go('createmaintenancereport');
                        break;
                    case 'SafetyMeeting':
                        $state.go('createsafetymeetingreport');
                        break;
                    case 'Training':
                        $state.go('createtrainingreport');
                        break;
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.AddCustomFields = function () {
            coreService.resetAlert();
            if ($rootScope.gridApi.selection.getSelectedRows().length) {
                console.log($scope.selectedReport);
                switch ($scope.selectedReport.code) {
                    case 'Hazard':
                        $state.go('hazard');
                        break;
                    case 'ABCanTrack':
                        $state.go('incident');
                        break;
                    case 'Inspection':
                        $state.go('inspection');
                        break;
                    case 'MaintenanceManagement':
                        $state.go('safetyMeeting');
                        break;
                    case 'SafetyMeeting':
                        $state.go('training');
                        break;
                    case 'Training':
                        $state.go('maintenance');
                        break;
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        //Add Custom Fields        
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }

        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
        /*
         $scope.clearFilters = function() {
         $scope.gridApi.data = $scope.originalData;
         }*/
        /*
         $scope.clearFilters = function() {
         $scope.gridApi.clearAll();
         }*/
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.AddCustomOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'reportType', minWidth: 150, categoryDisplayName: 'report Type', displayName: 'report Type', cellTooltip: true, headerTooltip: true}
            ],
            enableGridMenu: true,
            enableSelectAll: true,
            exporterMenuPdf: false,
            exporterMenuCsv: false,
            exporterCsvFilename: 'myFile.csv',
            exporterPdfDefaultStyle: {fontSize: 9},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfHeader: {text: "My Header", style: 'headerStyle'},
            exporterPdfFooter: function (currentPage, pageCount) {
                return {text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle'};
            },
            exporterPdfCustomFormatter: function (docDefinition) {
                docDefinition.styles.headerStyle = {fontSize: 22, bold: true};
                docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
                return docDefinition;
            },
            exporterPdfOrientation: 'portrait',
            exporterPdfPageSize: 'LETTER',
            exporterPdfMaxGridWidth: 500,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
            }
        };


        // set width for columns
        /*
         for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
         $scope.gridOptions.columnDefs[i].width = '10%';
         }
         */

        var fakeI18n = function (title) {
            var deferred = $q.defer();
            $interval(function () {
                deferred.resolve('col: ' + title);
            }, 1000, 1);
            return deferred.promise;
        };

        // get data
        var data = [
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            },
            {
                "reportType": "report name"
            }

        ];

        $scope.AddCustomOptions.showGridFooter = true;
        $scope.AddCustomOptions.showColumnFooter = true;
        $scope.AddCustomOptions.data = data;




        if ($stateParams.grid == 'custom_fields') {
            $scope.hse_tracking_report_choice = 'custom_fields';
            $scope.changeShownData();
        }

        function init() {
            $scope.changeShownData();
        }

        init();




    };
    controller.$inject = ['$scope', '$rootScope', 'constantService', 'customersService', '$state', 'uiGridConstants', '$filter', '$uibModal', 'coreService', 'uiGridExporterConstants', '$q', '$stateParams'];
    angular.module('adminModule')
            .controller('manageHseTracking', controller);
}());