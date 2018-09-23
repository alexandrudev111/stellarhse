var myAccountProfile = angular.module('myAccount', []);

myAccountProfile.controller("myAccountCtrl", function ($scope, constantService, $state, $filter, myAdminService, uiGridExporterConstants, $q, $uibModal, $confirm, coreService) {

    $scope.user = coreService.getUser();
    var init = function () {
        var data = {
            org_id: $scope.user.org_id,
            employee_id: $scope.user.employee_id
        };

        myAdminService.getUserDetails(data)
                .then(function (response) {
                    
                    $scope.selectedUser = response.data;
            
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });


    }
    init();
    var crew_data = {
        org_id: $scope.user.org_id
    };
    var dept_data = {
        org_id: $scope.user.org_id
    };
    $scope.$watch(function () {
        return coreService.getDB();
    }, function (newVal) {

        $q.all([
            coreService.getcountry(),
            myAdminService.getCrews(crew_data),
            myAdminService.getClassificationList(),
            myAdminService.getDepartments(dept_data),
            myAdminService.getUserGroup(dept_data),
            myAdminService.getRole(dept_data)
        ]).then(function (queues) {
            $scope.countries = queues[0].data;
            $scope.crewList = queues[1].data;
            $scope.classificationList = queues[2].data;
            $scope.DepartmentList = queues[3].data;
            $scope.GroupList = queues[4].data;
            $scope.RoleList = queues[5].data;
            console.log("gfgfg" + $scope.DepartmentList);
        });

    }, true);

    $scope.$watch('selectedUser.country_id', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
            getprovince(newVal, 'country_id');
        }
    });
    $scope.$watch('selectedUser.province_id', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
            getcity(newVal, 'province_id');
        }
    });
    $scope.$watch('selectedUser.billing_country_id', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
            getprovince(newVal, 'billing_country_id');
        }
    });
    $scope.$watch('selectedUser.billing_province_id', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== null && newVal !== oldVal && newVal !== '') {
            getcity(newVal, 'billing_province_id');
        }
    });

    var getprovince = function (country_id, arrayFrom) {
        coreService.getprovince(country_id)
                .then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        if (arrayFrom === 'country_id') {
                            $scope.provinces = response.data;
                            if (response.data[0].length)
                                $scope.selectedUser.province_id = response.data[0].province_id;
                        } else {
                            $scope.billing_provinces = response.data;
                            if (response.data[0].length)
                                $scope.selectedUser.billing_province_id = response.data[0].province_id;
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
    }

    var getcity = function (province_id, arrayFrom) {
        coreService.getcity(province_id)
                .then(function (response) {
                    if (!response.data.hasOwnProperty('file')) {
                        if (arrayFrom === 'province_id') {
                            $scope.cities = response.data;
                            if (response.data[0].length)
                                $scope.selectedUser.city_id = response.data[0].city_id;
                        } else {
                            $scope.billing_cities = response.data;
                            if (response.data[0].length)
                                $scope.selectedUser.billing_city_id = response.data[0].city_id;
                        }
                    }
                }, function (error) {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'exception', message: error.data});
                });
    }

    $scope.getActiveEmployees = function (empLetters) {
        if (empLetters !== '' && empLetters !== null) {
            userData = {org_id: $scope.user.org_id, keyWord: empLetters};
            myAdminService.getSupervisors(userData).
                    then(function (response) {
                        $scope.activeEmployees = response.data;
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }
    };

    $scope.updateProfile = function () {
        $scope.selectedUser.currentPass = $scope.currentPass;
        $scope.selectedUser.newPass = $scope.newPass;
        $scope.selectedUser.confirmPass = $scope.confirmPass;
        if ($scope.currentPass || $scope.newPass) {
            if ($scope.currentPass != $scope.user.password) {
                coreService.setAlert({type: 'error', message: "The old password that you have entered is incorrect"});
            }else if($scope.newPass != $scope.confirmPass){
                coreService.setAlert({type: 'error', message: "Password does not match the confirm password."});
            } else {
                myAdminService.updateMyProfile($scope.selectedUser);
                coreService.setAlert({type: 'success', message: "Your profile has been updated successfully"});
                
            }

        } else{
            if(myAdminService.updateMyProfile($scope.selectedUser)){
                
                coreService.setAlert({type: 'success', message: "Your profile has been updated successfully"});
            }
            
        }

    }

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
            {name: 'FirstName', minWidth: 150, categoryDisplayName: 'address', displayName: 'First Name',cellTooltip: true, headerTooltip: true},
            {name: 'LastName', minWidth: 150, displayName: 'Last Name',cellTooltip: true, headerTooltip: true},
            {name: 'UserName', minWidth: 150, categoryDisplayName: 'User Name',cellTooltip: true, headerTooltip: true},
            {name: 'Login', minWidth: 150, displayName: 'Login',cellTooltip: true, headerTooltip: true},
            {name: 'Logout', minWidth: 150, displayName: 'Logout',cellTooltip: true, headerTooltip: true}
        ],
        enableGridMenu: false,
        enableSelectAll: false,
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
        
    ];

    $scope.myLoginHistory.showGridFooter = true;
    $scope.myLoginHistory.showColumnFooter = true;
    $scope.myLoginHistory.data = data;



    // Email Notification

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.myEmailNotification = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,

        columnDefs: [
            {name: 'Subject', minWidth: 150, categoryDisplayName: 'address', displayName: 'Subject'},
            {name: 'SentDate', minWidth: 150, displayName: 'SentDate'},
            {name: 'ResentDate', minWidth: 150, displayName: 'Resent Date'}
        ],
        enableGridMenu: false,
        enableSelectAll: false,
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
       
    ];

    $scope.myEmailNotification.showGridFooter = true;
    $scope.myEmailNotification.showColumnFooter = true;
    $scope.myEmailNotification.data = data;


    // my Training Records

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.myTrainingRecords = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,

        // Training Type, Assigned Date, Assigned by, Duration, Reason for Training, Location of Training, Completed Date, Recert Date
        columnDefs: [
            {name: 'TrainingType', minWidth: 150, categoryDisplayName: 'address', displayName: 'Training Type'},
            {name: 'AssignedDate', minWidth: 150, displayName: 'Assigned Date'},
            {name: 'Assignedby', minWidth: 150, categoryDisplayName: 'Assigned by'},
            {name: 'Duration', minWidth: 150, displayName: 'Duration'},
            {name: 'ReasonforTraining', minWidth: 150, displayName: 'Reason for Training'},
            {name: 'LocationofTraining', minWidth: 150, displayName: 'Location of Training'},
            {name: 'CompletedDate', minWidth: 150, displayName: 'Completed Date'},
            {name: 'RecertDate', minWidth: 150, displayName: 'Recert Date'}
        ],
        enableGridMenu: false,
        enableSelectAll: false,
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
       

    ];

    $scope.myTrainingRecords.showGridFooter = true;
    $scope.myTrainingRecords.showColumnFooter = true;
    $scope.myTrainingRecords.data = data;



    //my FollowUp Actions

    $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
        if (col.filters[0].term) {
            return 'header-filtered';
        } else {
            return '';
        }
    };
    $scope.myFollowUpActions = {
        paginationPageSizes: [10, 20, 30],
        paginationPageSize: 10,
        enableColumnResizing: true,
        enableFiltering: true,
        // Report Number, Report Type, Priority, Status, Also Notified, Task Description


        columnDefs: [
            {name: 'ReportNumber', minWidth: 150, categoryDisplayName: 'address', displayName: 'Report Number'},
            {name: 'ReportType', minWidth: 150, displayName: 'Report Type'},
            {name: 'Priority', minWidth: 150, categoryDisplayName: 'Priority'},
            {name: 'Status', minWidth: 150, displayName: 'Status'},
            {name: 'AlsoNotified', minWidth: 150, displayName: 'Also Notified'},
            {name: 'TaskDescription', minWidth: 150, displayName: 'Task Description'}
        ],
        enableGridMenu: false,
        enableSelectAll: false,
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
    var data = [];

    $scope.myFollowUpActions.showGridFooter = true;
    $scope.myFollowUpActions.showColumnFooter = true;
    $scope.myFollowUpActions.data = data;



});
