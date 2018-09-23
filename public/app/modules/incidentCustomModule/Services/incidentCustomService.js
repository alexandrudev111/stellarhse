(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveIncidentCustomFields: function (data) {
                return $http.post(url + 'saveIncidentCustomFields', data);
            },
            getIncidentTabCustomFields: function (data) {
                return $http.post(url + 'getIncidentTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('incidentCustomModule').factory('incidentCustomService', factory);
}());