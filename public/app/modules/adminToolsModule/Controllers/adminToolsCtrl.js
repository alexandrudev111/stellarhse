// app.js
var myCompanyInfo = angular.module('myCompanyInfo', []);

myCompanyInfo.controller('myCompanyInfoCtrl', function ($scope, $uibModal) {


    $scope.operatorPopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/operatorPopup.html',
            controller: 'myCompanyInfoCtrl'
        });
    };

    $scope.manageHSEPopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/operatorPopup-ManageHSE.html',
            controller: 'myCompanyInfoCtrl'
        });
    };



    $scope.TrainingPopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/trainingPopUp.html',
            controller: 'myCompanyInfoCtrl'
        });
    };

    $scope.editTrainingPopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/editTrainingPopUp.html',
            controller: 'myCompanyInfoCtrl'
        });
    };



    $scope.FilePopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/FilePopup.html',
            controller: 'myCompanyInfoCtrl'
        });
    };

    $scope.editFilePopUp = function (size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'app/modules/adminToolsModule/views/editFilePopUp.html',
            controller: 'myCompanyInfoCtrl'
        });
    };

    $scope.disabled = true;
    $scope.updateInfo = function () {
        $scope.disabled = false;
    }


    $scope.myData = [{name: "Moroni", age: 50},
        {name: "Teancum", age: 43},
        {name: "Jacob", age: 27},
        {name: "Nephi", age: 29},
        {name: "Enos", age: 34}];
    $scope.myOptions = {data: 'myData'};

    
    $scope.oneAtATime = true;
    
     $scope.status = {
    permisionContainer: true,
    isFirstOpen: true
  };
    
    
    /*Manage Training*/
    
    
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.manageTrainignOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'ThirdParty', minWidth: 150, categoryDisplayName: 'address', displayName: 'Third Party',cellTooltip: true, headerTooltip: true},
                {name: 'Province', minWidth: 150, categoryDisplayName: 'Province/state',displayName: 'Province/state',cellTooltip: true, headerTooltip: true},
                {name: 'ContactName', minWidth: 150, categoryDisplayName: 'Contact Name',cellTooltip: true, headerTooltip: true}
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


        // set width for columns
        /*
         for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
         $scope.gridOptions.columnDefs[i].width = '10%';
         }
         */

//        var fakeI18n = function (title) {
//            var deferred = $q.defer();
//            $interval(function () {
//                deferred.resolve('col: ' + title);
//            }, 1000, 1);
//            return deferred.promise;
//        };




        // get data
        var data = [
            {
                "ThirdParty": "Third Party",
                "Province": "Manitoba",
                "ContactName": "John Adams"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            },{
                "ThirdParty": "Third Party",
                "Province": "Manitoba",
                "ContactName": "John Adams"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            },{
                "ThirdParty": "Third Party",
                "Province": "Manitoba",
                "ContactName": "John Adams"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            },{
                "ThirdParty": "Third Party",
                "Province": "Manitoba",
                "ContactName": "John Adams"

            },{
                "ThirdParty": "Third Party",
                "Province": "Montireal",
                "ContactName": "Hossam shaheen"

            }

        ];

        $scope.manageTrainignOptions.showGridFooter = true;
        $scope.manageTrainignOptions.showColumnFooter = true;
        $scope.manageTrainignOptions.data = data;
    

    
    /*Manage Training History*/
    
    
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.manageTrainingHistoyOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'ThirdParty', minWidth: 150, categoryDisplayName: 'ThirdParty', displayName: 'Third Party',cellTooltip: true, headerTooltip: true},                
                {name: 'city', minWidth: 150, categoryDisplayName: 'City',displayName: 'City',cellTooltip: true, headerTooltip: true},
                {name: 'Province', minWidth: 150, categoryDisplayName: 'Province/state',displayName: 'Province/state',cellTooltip: true, headerTooltip: true},
                {name: 'ContactName', minWidth: 150, categoryDisplayName: 'Contact Name',cellTooltip: true, headerTooltip: true},
                {name: 'UpdatedBy', minWidth: 150, categoryDisplayName: 'Updated by',cellTooltip: true, headerTooltip: true}
                
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


        // set width for columns
        /*
         for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
         $scope.gridOptions.columnDefs[i].width = '10%';
         }
         */

//        var fakeI18n = function (title) {
//            var deferred = $q.defer();
//            $interval(function () {
//                deferred.resolve('col: ' + title);
//            }, 1000, 1);
//            return deferred.promise;
//        };

        // get data
        var data = [
            {
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            },{
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            },{
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            },{
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            },{
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            },{
                "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "John Adams",
                "UpdatedBy" : "2017-06-05 11:30:15"

            },{
                 "ThirdParty": "Third Party",
                "city":"City",
                "Province": "Manitoba",                
                "ContactName": "Albert",
                "UpdatedBy" : "2017-07-04 11:30:15" 
            }

        ];

        $scope.manageTrainingHistoyOptions.showGridFooter = true;
        $scope.manageTrainingHistoyOptions.showColumnFooter = true;
        $scope.manageTrainingHistoyOptions.data = data;

    
    // add new location
        $scope.cloneForm = function(){

            
            let location = document.querySelector(".location"),
                locationParent = document.querySelector("#locationParent"),
                newElement = location.cloneNode(true);
            newElement.children[6].remove();
            newElement.children[6].remove();
            locationParent.appendChild(newElement);
        } 
        
        
        
        
           /*Manage Equipment*/
    
    
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };
        $scope.EquipmentOptions = {
            paginationPageSizes: [10, 20, 30],
            paginationPageSize: 10,
            enableColumnResizing: true,
            enableFiltering: true,
            columnDefs: [
                {name: 'EquipmentType', minWidth: 150, categoryDisplayName: 'ThirdParty', displayName: 'Equipment Type',cellTooltip: true, headerTooltip: true},        
                {name: 'EquipmentCategory', minWidth: 150, categoryDisplayName: 'City',displayName: 'Equipment Category',cellTooltip: true, headerTooltip: true},
                {name: 'EquipmentName', minWidth: 150, categoryDisplayName: 'Province/state',displayName: 'Equipment Name',cellTooltip: true, headerTooltip: true},
                {name: 'EquipmentNumber', minWidth: 150, categoryDisplayName: 'Equipment Number',cellTooltip: true, headerTooltip: true}
                
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


        // set width for columns
        /*
         for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
         $scope.gridOptions.columnDefs[i].width = '10%';
         }
         */

//        var fakeI18n = function (title) {
//            var deferred = $q.defer();
//            $interval(function () {
//                deferred.resolve('col: ' + title);
//            }, 1000, 1);
//            return deferred.promise;
//        };

        // get data
        
     
        var data = [
            {
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            },{
                "EquipmentType": "Equipment Type",
                "EquipmentCategory":" Category",
                "EquipmentName": "Equipment Name",   
                "EquipmentNumber": "236526581"
            }
            
            
        ];

        $scope.EquipmentOptions.showGridFooter = true;
        $scope.EquipmentOptions.showColumnFooter = true;
        $scope.EquipmentOptions.data = data;

    
   
    
    
        
    
    
    
    
    
    



});