(function () {
    var factory = function ($http, appSettings, $q, $filter) {
        var url = appSettings.api + appSettings.version + '/';
        var vars = {
            type: null
        }
        return {
            
        }
    };
    factory.$inject = ['$http', 'appSettings', '$q', '$filter'];
    angular.module('manageHseProgramModule').factory('manageHseProgramService', factory);
}());