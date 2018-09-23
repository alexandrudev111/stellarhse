(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
//            getSafetyMeetingNumber: function (data) {
//                return $http.post(url + 'getsafetymeetingnumber', data);
//            },
            getSafetyMeetingTypes: function (data) {
                return $http.post(url + 'getsafetymeetingtypes', data);
            },
            submitSafetyMeetingReport:function (data) {
                return $http.post(url + 'submitsafetymeetingreport', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('safetyMeetingReportModule').factory('safetyMeetingReportService', factory);
}());