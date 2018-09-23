(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getAllOrganizations: function () {
                return $http.get(url + 'getallorganizations');
            },
            setTemplateParamters: function (data) {
                return $http.post(url + 'settemplateparamters', data);
            },
            getTemplateTypes: function (data) {
                return $http.post(url + 'getTemplateTypes', data);
            },
            checkUserTemplateName: function (data) {
                return $http.post(url + 'checkusertemplatename', data);
            },
            deleteUserTemplateReport: function (data) {
                return $http.post(url + 'deleteusertemplatereport', data);
            },
            printIncidentReport: function (data) {
                return $http.post(url + 'printincidentreport', data);
            },
            setTempTemplateParamters: function (data) {
                return $http.post(url + 'settemptemplateparamters', data);
            },
            getSelectedView: function (data) {
                return $http.post(url + 'getselectedview', data);
            },
            getDefaulTemplatesByReportType: function (data) {
                return $http.post(url + 'getDefaulTemplatesByReportType', data);
            },
            getDefTempDetails: function (data) {
                return $http.post(url + 'getDefTempDetails', data);
            },
            getSubTypesViews: function (data) {
                return $http.post(url + 'getSubTypesViews', data);
            },
            saveFavoritView: function (data) {
                return $http.post(url + 'saveFavoritView', data);
            },
            getSubTypesFavoritViews: function (data) {
                return $http.post(url + 'getSubTypesFavoritViews', data);
            },
            updateFavoritView: function (data) {
                return $http.post(url + 'updateFavoritView', data);
            },
            getUserEmail: function (data) {
                return $http.post(url + 'getUserEmail', data);
            },
            sendLockedEmail: function (data) {
                return $http.post(url + 'sendLockedEmail', data);
            },
            getFisledsByTab : function(data){
                return $http.post(url + 'getFisledsByTab', data);
            },
            getFisledsBySection : function(data){
                return $http.post(url + 'getFisledsBySection', data);
            },
            getTemplates: function (data) {
                return $http.post(url + 'gettemplates', data);
            },
            getTemplatesTypes: function (data) {
                return $http.post(url + 'gettemplatestypes', data);
            },
            checkTemplateType: function (data) {
                return $http.post(url + 'checkTemplateType', data);
            },
            getReportTemplateBody: function (data) {
                return $http.post(url + 'getreporttemplatebody', data);
            },
            getColumnsLabels: function (data) {
                return $http.post(url + 'getcolumnslabels', data);
            },
            CheckReportId: function (data) {
                return $http.post(url + 'CheckReportId', data);
            },
            printReportTemplate: function (data) {
                return $http.post(url + 'printReportTemplate', data);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('viewDataTablesModule').factory('viewDataTablesService', factory);
}());