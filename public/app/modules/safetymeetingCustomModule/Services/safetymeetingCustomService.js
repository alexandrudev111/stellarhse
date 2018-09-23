(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveSafetymeetingCustomFields: function (data) {
                return $http.post(url + 'saveSafetymeetingCustomFields', data);
            },
            getSafetymeetingTabCustomFields: function (data) {
                return $http.post(url + 'getSafetymeetingTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('safetymeetingCustomModule').factory('safetymeetingCustomService', factory);
}());