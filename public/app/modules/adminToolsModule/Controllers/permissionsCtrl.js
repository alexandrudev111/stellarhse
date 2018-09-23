var Permission = angular.module('permission', []);

Permission.controller("PermissionCtrl", function ($scope, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, $confirm) {


    // login History

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.myLoginHistory = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [
            {
                name: 'FirstName',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'First Name'
            },
            {
                name: 'LastName',
                minWidth: 150,
                displayName: 'Last Name'
            },
            {
                name: 'UserName',
                minWidth: 150,
                categoryDisplayName: 'User Name'
            },
            {
                name: 'MemberSince',
                minWidth: 150,
                displayName: 'Member Since'
            },

            {
                name: 'userGroup',
                minWidth: 150,
                displayName: 'user Group'
            },
            {
                name: 'AddBy',
                minWidth: 150,
                displayName: 'Add By'
            },
            {
                name: 'LastLogin',
                minWidth: 150,
                displayName: 'Last Login'
            }
            ],
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
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }, {
            "FirstName": "Rasha",
            "LastName": "Atta",
            "UserName": "Rasha",
            "MemberSince": "02-03-2017",
            "userGroup": "Administraion",
            "AddBy": "John",
            "LastLogin": "08-03-2017"
            }
        ];

    $scope.myLoginHistory.showGridFooter = true;
    $scope.myLoginHistory.showColumnFooter = true;
    $scope.myLoginHistory.data = data;



    // groups

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.groups = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        columnDefs: [
            {
                name: 'UserGroup',
                minWidth: 150,
                categoryDisplayName: 'address',
                displayName: 'User Group'
            },
            {
                name: 'GroupMembers',
                minWidth: 150,
                displayName: 'Group Members'
            },
            {
                name: 'OverPointGroup',
                minWidth: 250,
                displayName: 'OverPoint of Group Role'
            },
            {
                name: 'CreationDate',
                minWidth: 150,
                categoryDisplayName: 'Creation Date'
            },
            {
                name: 'Status',
                minWidth: 90,
                categoryDisplayName: 'Status'
            }
            ],
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
            "UserGroup": "Administration",
            "GroupMembers": "Rasha,Hossam",
            "OverPointGroup": "Abcanada Internal Admin",
            "CreationDate": "2018-01-15 11:30:20",
            "Status": "Active"
            },
        {
            "UserGroup": "Demo Members",
            "GroupMembers": "John,Adams",
            "OverPointGroup": "Members",
            "CreationDate": "2018-01-17 10:35:15",
            "Status": "Active"
            }, {
            "UserGroup": "Administration",
            "GroupMembers": "Rasha,Hossam",
            "OverPointGroup": "Abcanada Internal Admin",
            "CreationDate": "2018-01-15 11:30:20",
            "Status": "Active"
            },
        {
            "UserGroup": "Demo Members",
            "GroupMembers": "John,Adams",
            "OverPointGroup": "Members",
            "CreationDate": "2018-01-17 10:35:15",
            "Status": "Active"
            }
        ];

    $scope.groups.showGridFooter = true;
    $scope.groups.showColumnFooter = true;
    $scope.groups.data = data;




});