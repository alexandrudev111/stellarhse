(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getInspectionReason: function (data) {
                return $http.post(url + 'getinspectionreason', data);
            },
            getInsData: function (data) {
                return $http.post(url + 'getinsdata', data);
            },
            getInspectionTypes: function (data) {
                return $http.post(url + 'getinspectiontypes', data);
            },
            submitInspectionReport: function (data) {
                return $http.post(url + 'submitinspectionreport', data);
            }

        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('inspectionReportModule').factory('inspectionReportService', factory);
}());