(function () {
    var factory = function ($http, appSettings, $filter, coreService, $window) {
        var url = appSettings.api + appSettings.version + '/';
        var usergroups = {};
        // usergroups.permissions = {
        //     ManageCompanies: false,
        //     GenerateStatsandCharts: false,
        //     AddLocations :false,
        //     AddThirdparties :false,
        //     ManageEmployees : false
        // };
        usergroups.products = {
            Hazard: false,
            ABCanTrack: false,
            Inspection: false,
            SafetyMeeting: false,
            Training: false,
            MaintenanceManagement: false,
            Analytics: false,
            myadmintools: false,
            Dashboard: false,
            HSE: false,
            Myaccount: false,
            Notifications: false
        };

        var response = {
            getAllAlertMsgs: function (data) {
                return $http.get(url + 'getallalertmsgs/' + data.LanguageId);
            },
            getUserPermissions: function (data) {
                return $http.get(url + 'userpermissions/' + data.OrgId + '/' + data.EmployeeId);
            },
            getOrgnizationSetting: function (val) {
                return $http.get(url + 'getorgnizationsetting/' + val.OrgId);
            },
            setUserGroups: function (user) {
                usergroups.permissions = {};
                usergroups.products = {};
                angular.forEach(user.products, function (product) {
                    console.log(product.permissions);
                    usergroups.products[product.product_code] = true;
                    usergroups.permissions[product.product_code] = {};
                    angular.forEach(product.permissions, function (permission) {
                        usergroups.permissions[product.product_code][permission.permission_code] = true;
                    });
                });
                console.log(usergroups.permissions);
                coreService.setPermissions(usergroups.permissions);
                // usergroups.permissions = user.products[0].permissions;
                // if ($filter('filter')(user.permissions, {
                //     permission_code: 'ManageCompanies'
                // }).length)
                //     usergroups.permissions.ManageCompanies = true;
                // else
                //     usergroups.permissions.ManageCompanies = false;

                // if ($filter('filter')(user.permissions, {
                //     permission_code: 'GenerateStatsandCharts'
                // }).length)
                //     usergroups.permissions.GenerateStatsandCharts = true;
                // else
                //     usergroups.permissions.GenerateStatsandCharts = false;

                // if ($filter('filter')(user.permissions, {
                //     permission_code: 'AddLocations'
                // }).length)
                //     usergroups.permissions.AddLocations = true;
                // else
                //     usergroups.permissions.AddLocations = false;    
                // if ($filter('filter')(user.permissions, {
                //     permission_code: 'AddThirdparties'
                // }).length)
                //     usergroups.permissions.AddThirdparties = true;
                // else
                //     usergroups.permissions.AddThirdparties = false; 

                //  if ($filter('filter')(user.permissions, {
                //     permission_code: 'ManageEmployees'
                // }).length)
                //     usergroups.permissions.ManageEmployees = true;
                // else
                //     usergroups.permissions.ManageEmployees = false; 

                // $window.localStorage["usergroupsPermissions"] = JSON.stringify(usergroups.permissions);

                /* show/hide module */
                // if ($filter('filter')(user.products, {
                //     product_code: 'Hazard'
                // }).length)
                //     usergroups.products.Hazard = true;
                // else
                //     usergroups.products.Hazard = false;


                // if ($filter('filter')(user.products, {
                //     product_code: 'ABCanTrack'
                // }).length)
                //     usergroups.products.ABCanTrack = true;
                // else
                //     usergroups.products.ABCanTrack = false;

                // if ($filter('filter')(user.products, {
                //     product_code: 'Inspection'
                // }).length)
                //     usergroups.products.Inspection = true;
                // else
                //     usergroups.products.Inspection = false;


                // if ($filter('filter')(user.products, {
                //     product_code: 'SafetyMeeting'
                // }).length)
                //     usergroups.products.SafetyMeeting = true;
                // else
                //     usergroups.products.SafetyMeeting = false;

                // if ($filter('filter')(user.products, {
                //     product_code: 'Training'
                // }).length)
                //     usergroups.products.Training = true;
                // else
                //     usergroups.products.Training = false;

                // if ($filter('filter')(user.products, {
                //     product_code: 'MaintenanceManagement'
                // }).length)
                //     usergroups.products.MaintenanceManagement = true;
                // else
                //     usergroups.products.MaintenanceManagement = false;

                $window.localStorage["usergroupsProducts"] = JSON.stringify(usergroups.products);
                coreService.setProducts(usergroups.products);

            },
            login: function (user) {
                return $http.post(url + 'login', user);
            },
            siteuserlogin: function (activ_code) {
                return $http.get(url + 'siteuserlogin/' + activ_code);
            },
            getOrgInfo: function (org_id) {
                return $http.get(url + 'getorginfo/' + org_id);
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

                usergroups.permissions = angular.fromJson($window.localStorage["usergroupsPermissions"]);
                usergroups.products = angular.fromJson($window.localStorage["usergroupsProducts"]);

            }
        }
        ;

        init();

        return response;
    };
    factory.$inject = ['$http', 'appSettings', '$filter', 'coreService', '$window'];
    angular.module('userModule').factory('userService', factory);
}());