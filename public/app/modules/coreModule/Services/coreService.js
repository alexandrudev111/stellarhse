(function () {
    var factory = function ($http, toaster, appSettings, $filter, $window) {
        var url = appSettings.api + appSettings.version + '/';
        var service = {
            user: null,
            org: null,
            alerts: [],
            login: true,
            permissions: null,
            products: null,
            userOrgs: null,
            currentParams: null,
            currentState: null,
            previousState: null,
            baseUrl: null,
            expireTime: (1000 * 60 * 5),
            allRecentReports: null
        };

        var alertSet = function (alert) {
            var m;
            var type;
            switch (alert.type) {
                case "exception":
                    m = 'Exception: ';
                    angular.forEach(alert.message, function (value, key) {
                        if (key !== 'type') {
                            if (key === 'file') {
                                m += key + ':' + value.replace(/\/data\/www\/api\//, '') + ' ';
                            } else
                                m += key + '' + value + '';
                        }
                    });
                    type = 'danger';
                    break;
                case "error":
                    m = alert.message;
                    type = 'danger';
                    break;
                case "success":
                    //                case "info":
                    m = alert.message;
                    type = 'success';
                    break;
                case "info":
                    m = alert.message;
                    type = 'info';
                    break;
                case "wait":
                    m = alert.message;
                    type = 'info';
                    break;
            }
            return {
                type: type,
                message: m,
                timeout: type === 'info' || type === 'success' ? 5000 : 1000000
            };
        };

        var response = {
            clearAll: function () {
                angular.forEach(service, function (val, key) {
                    if (Array.isArray(val)) {
                        service[key] = [];
                    } else {
                        service[key] = null;
                    }
                });
            },
            setPermissions: function (val) {
                $window.localStorage["permissions"] = JSON.stringify(val);
                service.permissions = val;
            },
            getPermissions: function () {
                return service.permissions;
            },
            setProducts: function (val) {
                $window.localStorage["products"] = JSON.stringify(val);
                service.products = val;
            },
            getUserOrgs: function () {
                return service.userOrgs;
            },
            setUserOrgs: function (val) {
                $window.localStorage["userOrgs"] = JSON.stringify(val);
                service.userOrgs = val;
            },
            getProducts: function () {
                return service.products;
            },
            setPreviousState: function (val) {
                service.previousState = val;
            },
            getPreviousState: function () {
                return service.previousState;
            },
            setCurrentState: function (val) {
                service.currentState = val;
            },
            getCurrentState: function () {
                return service.currentState;
            },
            setDB: function (val) {
                service[service.currentState] = val;
            },
            getDB: function () {
                return service[service.currentState];
            }, setCurrentParams: function (val) {
                service.currentParams = val;
            },
            getParentDB: function (parent) {
                return service[parent];
            },
            getCurrentParams: function () {
                return service.currentParams;
            },
            setLogin: function (val) {
                $window.localStorage["login"] = val;
                service.login = val;
            },
            setBaseUrl: function (val) {
                service.baseUrl = val;
            },
            getBaseUrl: function () {
                return service.baseUrl;
            },
            getLogin: function () {
                return service.login;
            },
            setUser: function (val) {
                $window.localStorage["currentUser"] = JSON.stringify(val);
                service.user = val;
            },
            getUser: function () {
                return service.user;
            },
            getUuid: function () {
                return $http.get(url + 'uuid');
            },
            setAlert: function (val) {
                service.alerts.push(alertSet(val));
            },
            getAlert: function () {
                return service.alerts;
            },
            resetAlert: function () {
                service.alerts = [];
            },
            setOrg: function (val) {
                $window.localStorage["org"] = JSON.stringify(val);
                service.org = val;
            },
            getOrg: function () {
                return service.org;
            },
            filterRecords: function (post) {
                return $http.post(url + 'filter', post);
            },
            setMessage: function (type, message, title) {
                var title = title || '';
                if (type == 'error') {
                    toaster.pop(type, title, message, 0, 'trustedHtml');
                } else {
                    toaster.pop(type, title, message);
                }
            },
            clearMessage: function () {
                toaster.clear();
            },
            getAllLabels: function (data) {
                return $http.post(url + 'getalllabels', data);
            },
            getGridOptions: function () {
                var gridOptions = {
                    //sorting
                    enableSorting: true,
                   // useExternalSorting: true,
                    //pagination 
                    minRowsToShow: 10,
                    enablePagination: true,
                    enablePaginationControls: true,
                    paginationPageSizes: [10, 20, 30, 50, 100],
                    paginationPageSize: 10,
                    enableColumnResizing: true,
                    enableFiltering: true,
                    columnDefs: [],
                    enableFullRowSelection: false,
                    enableRowSelection: true,
                    enableSelectAll: false,
                    multiSelect: false,
                    enableSelectionBatchEvent: true,
                    exporterMenuPdf: false,
                    exporterMenuCsv: false,
                    showGridFooter: true,
                    showColumnFooter: true,
                    exporterCsvFilename: 'ecport.csv',
                    exporterPdfDefaultStyle: {fontSize: 9},
                    exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
                    exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
                    exporterPdfHeader: {text: "Customers", style: 'headerStyle'},
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
                    exporterPdfMaxGridWidth: 700,
                    exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                    //appScopeProvider: $scope.myAppScopeProvider,
                    // rowTemplate: "<div ng-dblclick=\"alert('ok')\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
                };
                return gridOptions;
            },
            getcountry: function () {
                return $http.get(url + 'getcountry');
            },
            getprovince: function (country_id) {
                return $http.get(url + 'getcountry/' + country_id);
            },
            getcity: function (province_id) {
                return $http.get(url + 'getcity/' + province_id);
            },
            getAlertMessageByCode: function (post) {
                return $http.post(url + 'getalertmessage', post);
            },
            switchUser: function (post) {
                return $http.post(url + 'switchuser', post);
            },
            setExpiryDate: function () {
                $window.localStorage["expireDate"] = new Date().getTime() + service.expireTime;
            },
            getDefaultFields: function (data) {
                return $http.post(url + 'getdefaultfields', data);
            },
            getDefaultEmailTypes: function (data) {
                return $http.post(url + 'defaultemailtypes', data);
            },

            setDraftReport: function (val) {
                service.draftReport = val;
            },
            getDraftReport: function () {
                return service.draftReport;
            },
            submitDraftReport: function (data) {
                return $http.post(url + 'submitDraftReport', data);
            },
            checkDraftExists: function (data) {
                return $http.post(url + 'checkDraftExists', data);
            },
            deleteDraft: function (data) {
                return $http.post(url + 'deleteDraft', data);
            },
            getSecurityQuestion: function () {
                return $http.get(url + 'getSecurityQuestion');

            },

            setCanCustom: function (val) {
                service.canCustom = val;
            },
            getCanCustom: function () {
                return service.canCustom;
            },
            setAllRecentReport: function (val) {
                service.allRecentReports = val;
            },
            getAllRecentReport: function () {
                return service.allRecentReports;
            },

            setIsMyDraft: function (val) {
                service.IsMyDraft = val;
            },
            getIsMyDraft: function () {
                return service.IsMyDraft;
            }
        };

        var isNotExpire = function isNotExpire() {
            if (!$window.localStorage["expireDate"]) {
                return false;
            }
            var nowdate = new Date().getTime();
            var expireDate = parseInt($window.localStorage["expireDate"]);
            if (nowdate > expireDate) {
                return false;
            }

            return true;
        };

        function init() {
            if ($window.localStorage["currentUser"] && isNotExpire()) {
//                setExpireDate();
//                updateExpireDate();
                service.user = angular.fromJson($window.localStorage["currentUser"]);
//                response.setOrg(angular.fromJson($window.localStorage["org"]));
                service.login = $window.localStorage["login"];
                service.permissions = angular.fromJson($window.localStorage["permissions"]);
                service.products = angular.fromJson($window.localStorage["products"]);
                service.userOrgs = angular.fromJson($window.localStorage["userOrgs"]);
            }
        }
        ;

        init();


        return response;
    };
    factory.$inject = ['$http', 'toaster', 'appSettings', '$filter', '$window'];
    angular.module('coreModule')
            .factory('coreService', factory);
}());