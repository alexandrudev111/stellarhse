(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getMaintenanceReason: function (data) {
                return $http.post(url + 'getmaintenancereason', data);
            }, getMaintenanceTypes: function (data) {
                return $http.post(url + 'getmaintenancetype', data);
            },submitMaintenanceReport: function (data) {
                
                console.log( "before submit",data);
                return $http.post(url + 'submitmaintenancereport', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('maintenanceReportModule').factory('maintenanceReportService', factory);
}());