(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getYesNoValuse: function(data){
                return $http.post(url + 'getyesnovalues', data);
            },
            getEmployees: function (data) {
                return $http.post(url + 'getemployees', data);
            },
            getEmployeesByOrgId: function (data) {
                return $http.post(url + 'getemployeesbyorgid', data);
            },
            getthirdpartyinfo: function (data) {
                return $http.post(url + 'getthirdpartyinfo', data);
            },
            getLocations1: function (data) {
                return $http.post(url + 'locations1', data);
            },
            getLocations2: function (data) {
                return $http.post(url + 'locations2', data);
            },
            getLocations3: function (data) {
                return $http.post(url + 'locations3', data);
            },
            getLocations4: function (data) {
                return $http.post(url + 'locations4', data);
            },
            getOperationTypes: function (data) {
                return $http.post(url + 'operationtypes', data);
            },
            getEquipments: function (orgid, letters) {
                return $http.get(url + 'equipments/' + orgid + '/' + letters);
            },
            getCrews: function (data) {
                return $http.post(url + 'crews', data);
            },
            getHazardStatuses: function (data) {
                return $http.post(url + 'hazardstatuses', data);
            },
            getImpactTypes: function (data) {
                return $http.post(url + 'impacttypes', data);
            },
            getImpactSubTypes: function (data) {
                return $http.post(url + 'impactsubtypes', data);
            },
            getRiskControls: function (data) {
                return $http.post(url + 'riskcontrols', data);
            },
            getRiskLevels: function (data) {
                return $http.post(url + 'risklevels', data);
            },
            getEffectsTypes: function (data) {
                return $http.post(url + 'effectstypes', data);
            },
            getCauseTypes: function (data) {
                return $http.post(url + 'causetypes', data);
            },
            getCorrectiveActionEmployees: function (data) {
                return $http.post(url + 'correctiveactionemployees', data);
            },
            getCorrectiveActionPriorities: function (data) {
                return $http.post(url + 'correctiveactionpriorities', data);
            },
            getCorrectiveActionStatuses: function (data) {
                return $http.post(url + 'correctiveactionstatuses', data);
            }, 
            getHowInvolvedField: function (data) {
                return $http.post(url + 'howinvolvedfield', data);
            },
            getPeopleCertificates: function (data) {
                return $http.post(url + 'getpeoplecertificates', data);
            },
            getPeopleActingAs: function (data) {
                return $http.post(url + 'getpeopleactingas', data);
            },
            getInvestigatorsEmployees: function (data) {
                return $http.post(url + 'investigatorsemployees', data);
            },
            getReportData: function (data) {
                return $http.post(url + 'getreportdata', data);
            },
            getReportFields: function (data) {
                return $http.post(url + 'getreportfields', data);
            },
            getDataTablesReportFields: function (data) {
                return $http.post(url + 'getdatatablesreportfields', data);
            },
            getFieldValues: function (data) {
                return $http.post(url + 'getfieldvalues', data);
            },
            getFieldSubValues: function (data) {
                return $http.post(url + 'getfieldsubvalues', data);
            },
            saveField: function (data) {
                return $http.post(url + 'savefield', data);
            },
            deleteFieldValue: function (data) {
                return $http.post(url + 'deletefieldvalue', data);
            },
            saveFieldValue: function (data) {
                return $http.post(url + 'savefieldvalue', data);
            },
            getTrainingProviders: function (data) {
                return $http.post(url + 'getTrainingProviders', data);
            },
            deleteTempFiles: function (data) {
                return $http.post(url + 'deleteTempFiles', data);
            },
            setDraftFiles: function (data) {
                return $http.post(url + 'setDraftFiles', data);
            },
            callFileManager: function (data) {
                return $http.post('bridges/php-local/index.php', {action:'list' ,path:'/'});
            },
            copyReportFilesToTemp: function (data) {
                return $http.post(url + 'copyReportFilesToTemp', data);
            },
            submitReportFiles: function (data) {
                return $http.post(url + 'submitReportFiles', data);
            },
            dirSize: function (data) {
                return $http.post(url + 'dirSize', data);
            },
            getAllTypeReportNo: function (data) {
                return $http.post(url + 'getAllTypeReportNo', data);
            },
            updateEditingBy: function (data) {
                return $http.post(url + 'updateEditingBy', data);
            },
            checkEditingBy: function (data) {
                return $http.post(url + 'checkEditingBy', data);
            },

            getRiskLevelTotal: function (data) {
                return $http.post(url + 'getRiskLevelTotal', data);
            },
            getTabCustomFields:function (data) {
                return $http.post(url + 'getTabCustomFields', data);
            },
            getReportStatus:function (data) {
                return $http.post(url + 'getReportStatus', data);
            },
            getReportDepartments:function (data) {
                return $http.post(url + 'getReportDepartments', data);
            },
            getRelatedHazard:function (data) {
                return $http.post(url + 'getRelatedHazard', data);
            },
            getDataTablesReportCustomFields:function (data) {
                return $http.post(url + 'getDataTablesReportCustomFields', data);
            },
            getCorrectiveActionsResultStatus:function (data) {
                return $http.post(url + 'getCorrectiveActionsResultStatus', data);
            },
            getReportOwners:function (data) {
                return $http.post(url + 'getReportOwners', data);
            },
            getOrgLocationLevel:function (data) {
                return $http.post(url + 'getOrgLocationLevel', data);
            },
            getStatusLable:function (data) {
                return $http.post(url + 'getStatusLable', data);
            }
        }
    };

    factory.$inject = ['$http', 'appSettings']
    angular.module('coreReportModule')
            .factory('coreReportService', factory)
}())