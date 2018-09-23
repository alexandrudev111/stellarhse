(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveMaintenanceCustomFields: function (data) {
                return $http.post(url + 'saveMaintenanceCustomFields', data);
            },
            getMaintenanceTabCustomFields: function (data) {
                return $http.post(url + 'getMaintenanceTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('maintenanceCustomModule').factory('maintenanceCustomService', factory);
}());