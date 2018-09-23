(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
//            getHazardNumber: function (data) {
//                return $http.post(url + 'gethazardnumber', data);
//            },
            getHazardTypes: function (data) {
                return $http.post(url + 'gethazardtypes', data);
            },
            submitHazardReport:function (data) {
                return $http.post(url + 'submithazardreport', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('hazardReportModule').factory('hazardReportService', factory);
}());