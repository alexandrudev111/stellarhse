(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveInspectionCustomFields: function (data) {
                return $http.post(url + 'saveInspectionCustomFields', data);
            },
            getInspectionTabCustomFields: function (data) {
                return $http.post(url + 'getInspectionTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('inspectionCustomModule').factory('inspectionCustomService', factory);
}());