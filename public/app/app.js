var app = angular.module('app', [
    'ng',
    'toaster',
    'ui.router',
    'ui.bootstrap',
    "ui.mask",
    'sidebarModule',
    'ui.select',
    'myDatepicker',
//    'ngFinder',
    'coreModule',
    'navModule',
    'ngTouch',
    'ui.grid',
    'ui.grid.exporter',
    'ui.grid.selection',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    'ui.grid.autoResize',
    'ui.grid.moveColumns',
    'ui.router.state.events',
    'daterangepicker',
    'ui.tinymce',
    'navModule',
    'ngTouch',
    'ngSanitize',
    'cgBusy',
    'chart.js',
    'ngFileUpload',
    'angular-confirm',
    'constantModule',
    'coreReportModule',
    'userModule',
    'hazardReportModule',
    'incidentReportModule',
    'inspectionReportModule',
    'safetyMeetingReportModule',
    'maintenanceReportModule',
    'trainingReportModule',
    'adminModule',
    'myCompanyInfo',
    'viewDataTablesModule',
    'viewEmail',
    'viewEmailHistory',
    'customizationModule',
    'tableModule',
    'dashboardModule',
    'ngScrollbars',
    'analyticsModule',
    "cb.x2js",
    'manageNotificationModule',
    "angularjs-dropdown-multiselect",
    "hseProgramModule",
    'treeControl',
    'ngFileUpload',
    'myAdminModule',
    'myAccount',
    //  'permission',
    'FileManagerApp',
    'hazardCustomModule',
    'incidentCustomModule',
    'inspectionCustomModule',
    'safetymeetingCustomModule',
    'trainingCustomModule',
    'maintenanceCustomModule',
    'manageProcuders',
    'ngAnimate',
    'tutorial',
    'ui.bootstrap.contextMenu',
    'operationType',
    'manageDocumentModule'
]);

app.config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);

app.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", "$locationProvider",
    function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
//            $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push(["$q", function ($q) {
                return {
                    'request': function (config) {
                        return config || $q.when(config);
                    }
                    , 'response': function (response) {
                        return response || $q.when(response);
                    }
                };
            }]);
    }]);

app.value('appSettings', {api: '/api/', version: 'v1', platform: 'dev'});

app.run(["coreService", "$state", "$rootScope", "$location", '$uibModal', function (coreService, $state, $rootScope, $location, $uibModal) {
        "ngInject";
        coreService.setBaseUrl('http://stellarhse.loc:8080/');
//        coreService.setBaseUrl('http://alaadev.stellarhse.com/');
//        coreService.setBaseUrl('http://stellar.dev');
//        coreService.setBaseUrl('http://127.0.0.1:8888/');
//        coreService.setBaseUrl('https://dev.stellarhse.com/');
//        coreService.setBaseUrl('https://test.stellarhse.com/');

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            coreService.setCurrentState(toState.name);
            coreService.setPreviousState(fromState.name);
            coreService.setCurrentParams(toParams);
            if (toState.name != 'accountactiviation' && toState.name != 'sitelogin') {
                if (coreService.getLogin() === true && toState.name !== "login") {
                    event.preventDefault();
                    $state.go("login");
//                    window.location.replace('https://newtemp.abcanada.com');
                }
            }
            if ((coreService.getPreviousState() == 'edithazardreport' && coreService.getCurrentState() == 'createhazardreport') ||
                    (coreService.getPreviousState() == 'editincidentreport' && coreService.getCurrentState() != 'addincident')) {
                $rootScope.checkAfterSaveDraft();
            } else {
                if (
                        (coreService.getPreviousState() == 'createhazardreport' && coreService.getCurrentState() != 'edithazardreport') ||
                        (coreService.getPreviousState() == 'edithazardreport' && coreService.getCurrentState() != 'edithazardreport')
                        || (coreService.getPreviousState() == 'addincident' && coreService.getCurrentState() != 'editincidentreport')
                        || (coreService.getPreviousState() == 'editincidentreport' && coreService.getCurrentState() != 'editincidentreport')
                        ) {
                    $rootScope.saveDraft();
                }
                if (coreService.getCurrentState() == 'createhazardreport' || coreService.getCurrentState() == 'addincident') {
                    $rootScope.checkExistingDraft();
                }
            }
            if ((coreService.getCurrentState() == 'createhazardreport' || coreService.getCurrentState() == 'addincident' ||
                    coreService.getCurrentState() == 'createinspectionreport' || coreService.getCurrentState() == 'createsafetymeetingreport' ||
                    coreService.getCurrentState() == 'createtrainingreport' || coreService.getCurrentState() == 'createmaintenancereport') && coreService.getPreviousState() == "ManageTrackingHSE") {
                coreService.setCanCustom(true);
            } else
                coreService.setCanCustom(false);
        });

        $rootScope.saveDraft = function () {
            // on create a new report as a draft 
            console.log(coreService.getDraftReport());
            if (coreService.getDraftReport() != undefined) {
                // insert draft on db
                var draftReport = coreService.getDraftReport();
                console.log("draftReport", coreService.getDraftReport());
                // draftReport.type = "hazard" ;
                draftReport.type = draftReport.type;
                console.log(draftReport);
                console.log(draftReport.report);
                if (draftReport.report.report_id != undefined) {
                    draftReport.opreationType = "update";
                    draftReport.report_id = draftReport.report.report_id;
                } else if (draftReport.report.report_id == undefined && draftReport.report.draft_id != undefined) {
                    draftReport.opreationType = "save";
                    draftReport.report_id = draftReport.report.draft_id;
                } else
                    draftReport.opreationType = "save";


                draftReport.report = JSON.stringify(coreService.getDraftReport().report);
                console.log(draftReport.report);
                coreService.submitDraftReport(draftReport)
                        .then(function (response) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'success', message: "The report has been saved as a draft"});
                        }, function (error) {
                            coreService.resetAlert();
                            coreService.setAlert({type: 'exception', message: error.data});
                        });
                // set draft undefined
                coreService.setDraftReport(undefined);
            }
        }

        $rootScope.checkExistingDraft = function () {
            coreService.setDraftReport(undefined);

            var data = {
                org_id: coreService.getUser().org_id,
                employee_id: coreService.getUser().employee_id,
                report_id: null
            }
            if (coreService.getCurrentState() == 'createhazardreport') {
                data.product_code = 'hazard';
            } else if (coreService.getCurrentState() == 'addincident') {
                data.product_code = 'incident';
            }
            coreService.checkDraftExists(data)
                    .then(function (response) {
                        console.log(response);
                        if (response.data[0].result != "0") {
                            console.log("Has draft report");
                            if (data.product_code == "hazard") {
                                console.log(response.data[0].result);
                                var report = JSON.parse(response.data[0].result);
                            } else if (data.product_code == "incident") {
                                var res = response.data[0].result;
                                // console.log(res);
                                var index = res.indexOf("incidentImpactTypes");
                                // console.log(res.length , index);
                                var report1 = res.slice(0, index - 2);
                                var report11 = report1 + "}";
                                // console.log(report11);
                                var jReport1 = JSON.parse(report11);
                                //console.log(jReport1);

                                var report2 = res.slice(index - 1, res.length);
                                var report22 = "{" + report2;
                                // console.log(report22);
                                var jReport2 = JSON.parse(report22);
                                // console.log(jReport2);

                                var report = Object.assign(jReport1, jReport2);

                            }
                            console.log(report);

                            report.report_id = response.data[0].id;
                            report.type = data.product_code;
                            console.log(report);
                            coreService.setDraftReport(report);
                            var modalInstance = $uibModal.open({
                                backdrop: 'static',
                                keyboard: false,
                                templateUrl: 'app/modules/coreReportModule/views/draftPopup.html',
                                controller: 'draftController',
                            });

                            angular.element('.modal-backdrop').removeClass('hide');
                        }
                    }, function (error) {
                        coreService.resetAlert();
                        coreService.setAlert({type: 'exception', message: error.data});
                    });
        }
        // to handle case from edit to add thsame report type as from edit hazard to add hazard
        $rootScope.checkAfterSaveDraft = function () {
            // on create a new report as a draft 
            console.log(coreService.getDraftReport());
            if (coreService.getDraftReport() != undefined) {
                // insert draft on db
                var draftReport = coreService.getDraftReport();
                console.log("draftReport", coreService.getDraftReport());
                // draftReport.type = "hazard" ;
                draftReport.type = draftReport.type;
                console.log(draftReport);
                console.log(draftReport.report);
                if (draftReport.report != undefined) {
                    if (draftReport.report.report_id != undefined) {
                        draftReport.opreationType = "update";
                        draftReport.report_id = draftReport.report.report_id;
                    } else if (draftReport.report.report_id == undefined && draftReport.report.draft_id != undefined) {
                        draftReport.opreationType = "save";
                        draftReport.report_id = draftReport.report.draft_id;
                    } else
                        draftReport.opreationType = "save";


                    draftReport.report = JSON.stringify(coreService.getDraftReport().report);
                    console.log(draftReport.report);
                    coreService.submitDraftReport(draftReport)
                            .then(function (response) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'success', message: "The report has been saved as a draft"});
                                $rootScope.checkExistingDraft();
                            }, function (error) {
                                coreService.resetAlert();
                                coreService.setAlert({type: 'exception', message: error.data});
                            });
                } else
                    $rootScope.checkExistingDraft();
                // set draft undefined
                coreService.setDraftReport(undefined);
            }
        }

    }]);


app.config(function (ScrollBarsProvider) {
    // the following settings are defined for all scrollbars unless the
    // scrollbar has local scope configuration
    ScrollBarsProvider.defaults = {
        scrollButtons: {
            scrollAmount: 'auto', // scroll amount when button pressed
            enable: true // enable scrolling buttons by default
        },
        scrollInertia: 400, // adjust however you want
        axis: 'yx', // enable 2 axis scrollbars by default,
        theme: 'dark',
        autoHideScrollbar: true
    };
});




function IndexCtrl($scope, $http, $q, $timeout) {

}