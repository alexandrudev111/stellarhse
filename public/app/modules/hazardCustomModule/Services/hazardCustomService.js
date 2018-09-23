(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveHazardCustomFields: function (data) {
                return $http.post(url + 'saveHazardCustomFields', data);
            },
            getHazardTabCustomFields: function (data) {
                return $http.post(url + 'getHazardTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('hazardCustomModule').factory('hazardCustomService', factory);
}());