var operationT = angular.module('operationType', []);

operationT.controller("operationTypeCtrl", function($scope, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {
    
        
    // login History
    
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
     
    /*
    headerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-header-cell-primary-focus"><span class="ui-grid-header-cell-label ng-binding" tooltip-placement="right" uib-tooltip="Operation Type Name">Operation Type Name</span></div>'
    */
        $scope.operationType = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'OperationTypeName', minWidth: 150, categoryDisplayName: 'address', displayName: 'Operation Type Name',cellTooltip: true,
                 headerTooltip: true
                 ,cellTooltip: true},
                {name: 'Order', minWidth: 150, displayName: 'Order',
                 cellTooltip: true,headerTooltip: true}
            ],
            enableGridMenu:  false,
            enableSelectAll:  false,
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


        // get data
        var data = [
            {
                "OperationTypeName": "Construction",
                "Order": "0"

            },
             {
                "OperationTypeName": "intenance",
                "Order": "1"

            }, {
                "OperationTypeName": "Operations",
                "Order": "2"

            },
             {
                "OperationTypeName": "Remediation",
                "Order": "3"

            },
             {
                "OperationTypeName": "Loading or Offloading",
                "Order": "4"

            },
             {
                "OperationTypeName": "intenance",
                "Order": "5"

            }, {
                "OperationTypeName": "Operations",
                "Order": "6"

            },
             {
                "OperationTypeName": "Remediation",
                "Order": "7"

            },
             {
                "OperationTypeName": "Loading or Offloading",
                "Order": "8"
            }
        ];

        $scope.operationType.showGridFooter = true;
        $scope.operationType.showColumnFooter = true;
        $scope.operationType.data = data;
        $scope.operationType.cellTooltip = true;
    
    
    


});
