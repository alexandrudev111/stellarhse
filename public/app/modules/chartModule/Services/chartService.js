
(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getIncidentCharts: function (post) {
                return $http.post(url + 'getincidentchart', post);
            },
            getHazaredCharts: function (post) {
                return $http.post(url + 'gethazardchart', post);
            },
            deleteChart: function (post) {
                return $http.post(url + 'deletechart', post);
            },
            getOutputFormula: function (language_id) {
                return $http.get(url + 'getoutputformula/' + language_id);
            },
            getChartFields: function (post) {
                return $http.post(url + 'getchartfields', post);
            },
            getDecimalFields: function (post) {
                return $http.post(url + 'getdecimalfields', post);
            }
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('chartModule').factory('chartService', factory);
}());