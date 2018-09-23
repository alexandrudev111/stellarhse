var peopleModule = angular.module('peopleModule', ['ngTouch', 'ui.grid', 'ui.grid.exporter', 'ui.grid.selection', 'ui.grid.pagination', 'ui.grid.resizeColumns', 'ui.grid.autoResize', 'ui.grid.moveColumns']);

peopleModule.controller('peopleCtrl', ['$scope', '$http', '$interval', 'uiGridExporterConstants', function ($scope, $http, $interval, uiGridExporterConstants) {



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
        $scope.gridOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'name', minWidth: 150, categoryDisplayName: 'address', displayName: 'name ',cellTooltip: true, headerTooltip: true},
                {name: 'gender', minWidth: 150, categoryDisplayName: 'gender',cellTooltip: true, headerTooltip: true},
                {name: 'company', minWidth: 150, categoryDisplayName: 'company',cellTooltip: true, headerTooltip: true}
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
                "name": "Ethel Price",
                "gender": "female",
                "company": "Enersol"
            },
            {
                "name": "Claudine Neal",
                "gender": "female",
                "company": "Sealoud"
            },
            {
                "name": "Beryl Rice",
                "gender": "female",
                "company": "Velity"
            }

        ];

        $scope.gridOptions.showGridFooter = true;
        $scope.gridOptions.showColumnFooter = true;
        $scope.gridOptions.data = data;
//  $http.get('https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/100.json')
//    .success(function(data) {
//      $scope.gridOptions.data = data;
//    });


    }]);
