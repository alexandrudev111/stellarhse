(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
//            getSafetyMeetingNumber: function (data) {
//                return $http.post(url + 'getsafetymeetingnumber', data);
//            },
            getTrainingTypes: function (data) {
                return $http.post(url + 'gettrainingtypes', data);
            },
            getTrainingReasons: function (data) {
                return $http.post(url + 'gettrainingreasons', data);
            },
            getTrainingLevelAchieved: function (data) {
                return $http.post(url + 'gettraininglevelachieved', data);
            },
            getTrainingQuality: function (data) {
                return $http.post(url + 'gettrainingquality', data);
            },
            submitTrainingReport:function (data) {
                return $http.post(url + 'submittrainingreport', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('trainingReportModule').factory('trainingReportService', factory);
}());