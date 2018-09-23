(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            saveTrainingCustomFields: function (data) {
                return $http.post(url + 'saveTrainingCustomFields', data);
            },
            getTrainingTabCustomFields: function (data) {
                return $http.post(url + 'getTrainingTabCustomFields', data);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('trainingCustomModule').factory('trainingCustomService', factory);
}());