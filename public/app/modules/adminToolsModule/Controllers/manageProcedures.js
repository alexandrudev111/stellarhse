var app = angular.module("manageProcuders", []);

app.controller("manageProcudersController", function ($scope, Upload, $timeout, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.upload([$scope.file]);
        }
    });
    $scope.log = '';

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
                    fields: {
                        'username': $scope.username
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
                    $timeout(function () {
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                });
            }
        }
    };

    // grid Code

    $scope.downloadCSV = function () {
        //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }

    $scope.downloadPDF = function () {
        $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }
    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.allVideos = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [{
                name: 'Title',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Title'
            ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Date',
                minWidth: 150,
                categoryDisplayName: 'Date'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Format',
                minWidth: 150,
                categoryDisplayName: 'Format'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Author',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Author'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Summary',
                minWidth: 150,
                categoryDisplayName: 'Summary'
                ,cellTooltip: true, headerTooltip: true
            }],
        enableGridMenu: false,
        enableSelectAll: false,
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: {
            fontSize: 9
        },
        exporterPdfTableStyle: {
            margin: [30, 30, 30, 30]
        },
        exporterPdfTableHeaderStyle: {
            fontSize: 10,
            bold: true,
            italics: true,
            color: 'red'
        },
        exporterPdfHeader: {
            text: "My Header",
            style: 'headerStyle'
        },
        exporterPdfFooter: function (currentPage, pageCount) {
            return {
                text: currentPage.toString() + ' of ' + pageCount.toString(),
                style: 'footerStyle'
            };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
                fontSize: 22,
                bold: true
            };
            docDefinition.styles.footerStyle = {
                fontSize: 10,
                bold: true
            };
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
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            }

        ];

    $scope.allVideos.showGridFooter = true;
    $scope.allVideos.showColumnFooter = true;
    $scope.allVideos.data = data;

    
    
    // grid Code

    $scope.downloadCSV = function () {
        //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }

    $scope.downloadPDF = function () {
        $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }
    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.oriental = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [{
                name: 'Title',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Title'
            ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Date',
                minWidth: 150,
                categoryDisplayName: 'Date'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Format',
                minWidth: 150,
                categoryDisplayName: 'Format'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Author',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Author'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Summary',
                minWidth: 150,
                categoryDisplayName: 'Summary'
                ,cellTooltip: true, headerTooltip: true
            }],
        enableGridMenu: false,
        enableSelectAll: false,
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: {
            fontSize: 9
        },
        exporterPdfTableStyle: {
            margin: [30, 30, 30, 30]
        },
        exporterPdfTableHeaderStyle: {
            fontSize: 10,
            bold: true,
            italics: true,
            color: 'red'
        },
        exporterPdfHeader: {
            text: "My Header",
            style: 'headerStyle'
        },
        exporterPdfFooter: function (currentPage, pageCount) {
            return {
                text: currentPage.toString() + ' of ' + pageCount.toString(),
                style: 'footerStyle'
            };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
                fontSize: 22,
                bold: true
            };
            docDefinition.styles.footerStyle = {
                fontSize: 10,
                bold: true
            };
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
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            }

        ];

    $scope.oriental.showGridFooter = true;
    $scope.oriental.showColumnFooter = true;
    $scope.oriental.data = data;
    
    
    // grid Code

    $scope.downloadCSV = function () {
        //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }

    $scope.downloadPDF = function () {
        $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }
    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.videoTutorials = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [{
                name: 'Title',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Title'
            ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Date',
                minWidth: 150,
                categoryDisplayName: 'Date'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Format',
                minWidth: 150,
                categoryDisplayName: 'Format'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Author',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Author'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Summary',
                minWidth: 150,
                categoryDisplayName: 'Summary'
                ,cellTooltip: true, headerTooltip: true
            }],
        enableGridMenu: false,
        enableSelectAll: false,
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: {
            fontSize: 9
        },
        exporterPdfTableStyle: {
            margin: [30, 30, 30, 30]
        },
        exporterPdfTableHeaderStyle: {
            fontSize: 10,
            bold: true,
            italics: true,
            color: 'red'
        },
        exporterPdfHeader: {
            text: "My Header",
            style: 'headerStyle'
        },
        exporterPdfFooter: function (currentPage, pageCount) {
            return {
                text: currentPage.toString() + ' of ' + pageCount.toString(),
                style: 'footerStyle'
            };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
                fontSize: 22,
                bold: true
            };
            docDefinition.styles.footerStyle = {
                fontSize: 10,
                bold: true
            };
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
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            }

        ];

    $scope.videoTutorials.showGridFooter = true;
    $scope.videoTutorials.showColumnFooter = true;
    $scope.videoTutorials.data = data;
    
    
    
     // grid Code

    $scope.downloadCSV = function () {
        //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }

    $scope.downloadPDF = function () {
        $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
    }
    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.printable = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [{
                name: 'Title',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Title',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Date',
                minWidth: 150,
                categoryDisplayName: 'Date',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Format',
                minWidth: 150,
                categoryDisplayName: 'Format',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Author',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'Author',cellTooltip: true, headerTooltip: true
            },
            {
                name: 'Summary',
                minWidth: 150,
                categoryDisplayName: 'Summary',cellTooltip: true, headerTooltip: true
            }],
        enableGridMenu: false,
        enableSelectAll: false,
        exporterMenuPdf: false,
        exporterMenuCsv: false,
        exporterCsvFilename: 'myFile.csv',
        exporterPdfDefaultStyle: {
            fontSize: 9
        },
        exporterPdfTableStyle: {
            margin: [30, 30, 30, 30]
        },
        exporterPdfTableHeaderStyle: {
            fontSize: 10,
            bold: true,
            italics: true,
            color: 'red'
        },
        exporterPdfHeader: {
            text: "My Header",
            style: 'headerStyle'
        },
        exporterPdfFooter: function (currentPage, pageCount) {
            return {
                text: currentPage.toString() + ' of ' + pageCount.toString(),
                style: 'footerStyle'
            };
        },
        exporterPdfCustomFormatter: function (docDefinition) {
            docDefinition.styles.headerStyle = {
                fontSize: 22,
                bold: true
            };
            docDefinition.styles.footerStyle = {
                fontSize: 10,
                bold: true
            };
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
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            },
        {
            "Title": "Are You already for a STELLAR HSE Future?",
            "Date": "01-01-2019",
            "Format": "Video",
            "Author": "ABCanada",
            "Summary":"This is summary for this Video"
            }

        ];

    $scope.printable.showGridFooter = true;
    $scope.printable.showColumnFooter = true;
    $scope.printable.data = data;
    
    



});