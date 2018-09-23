(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getGroupsGrid: function (post) {
                return $http.post(url + 'getgroupsgrid', post);
            },
            deleteGroup: function (post) {
                return $http.post(url + 'deletegroup', post);
            },
            activateGroup: function (post) {
                return $http.post(url + 'activategroup', post);
            },
            deactivateGroup: function (post) {
                return $http.post(url + 'deactivategroup', post);
            },
            getOrgEmployeesByGroup: function (post) {
                return $http.post(url + 'getorgemployeesbygroup', post);
            },
            assignUserToGroup: function (post) {
                return $http.post(url + 'assignusertogroup', post);
            },
            getGroupTypes: function (post) {
                return $http.post(url + 'getgrouptypes', post);
            },
            getModuleTypes: function (post) {
                return $http.post(url + 'getmoduletypes', post);
            },
            getProductsPermissions: function (post) {
                return $http.post(url + 'getproductspermissions', post);
            },
            getDefaultPermissions: function (post) {
                return $http.post(url + 'getdefaultpermissions', post);
            },
            getOrgEmployeesNotHaveGroup: function (post) {
                return $http.post(url + 'getorgemployeesnothavegroup', post);
            },
            submitGroup: function (post) {
                return $http.post(url + 'submitgroup', post);
            },
            updateGroup: function (post) {
                return $http.post(url + 'updategroup', post);
            },
            getGroupInfo: function (post) {
                return $http.post(url + 'getgroupinfo', post);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('manageGroupsModule').factory('manageGroupsService', factory);
}());