(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            submitIncidentReport:function (data) {
                return $http.post(url + 'submitincidentreport', data);
            },
            getIncidentTypes: function (data) {
                return $http.post(url + 'getincidenttypes', data);
            },
            getEnvConditions: function (data) {
                return $http.post(url + 'getenvconditions', data);
            },
            getOEDepartments: function (data) {
                return $http.post(url + 'getoedepartments', data);
            },
            getObservationAndAnalysis: function (data) {
                return $http.post(url + 'getobservationandanalysis', data);
            },
            getExternalAgencies: function (data) {
                return $http.post(url + 'getexternalagencies', data);
            },
            getInvStatus: function (data) {
                return $http.post(url + 'getinvstatus', data);
            },
            getInvRiskOfRecurrence: function (data) {
                return $http.post(url + 'getinvriskofrecurrence', data);
            },
            getInvSeverity: function (data) {
                return $http.post(url + 'getinvseverity', data);
            },
            getInvSource: function (data) {
                return $http.post(url + 'getinvsource', data);
            },
            getInvRootCauses: function (data) {
                return $http.post(url + 'getinvrootcauses', data);
            },
            getSpillReleaseSource: function (data) {
                return $http.post(url + 'getspillreleasesource', data);
            },
            getSpillReleaseAgency: function (data) {
                return $http.post(url + 'getspillreleaseagency', data);
            },
            getDurationUnit: function (data) {
                return $http.post(url + 'getdurationunit', data);
            },
            getQuantityUnit: function (data) {
                return $http.post(url + 'getquantityunit', data);
            },
            getVehicleTypes: function (data) {
                return $http.post(url + 'getvehicletypes', data);
            },
            getInitialTreatments: function (data) {
                return $http.post(url + 'getinititaltreatments', data);
            },
            getSymptoms: function (data) {
                return $http.post(url + 'getsymptoms', data);
            },
            getRestrictedWork: function (data) {
                return $http.post(url + 'getrestrictedwork', data);
            },
            getInjuryRecordable: function (data) {
                return $http.post(url + 'getinjuryrecordable', data);
            },
            getInjuryBodyParts: function (data) {
                return $http.post(url + 'getinjurybodyparts', data);
            },
            getInjuryContactCodes: function (data) {
                return $http.post(url + 'getinjurycontactcodes', data);
            },
            getInjuryTypes: function (data) {
                return $http.post(url + 'getinjurytypes', data);
            },
            getInjuryContactAgencies: function (data) {
                return $http.post(url + 'getinjurycontactagencies', data);
            },
            getInjuryBodyAreas: function (data) {
                return $http.post(url + 'getinjurybodyareas', data);
            },
            getSCATContactTypes: function (data) {
                return $http.post(url + 'getscatcontacttypes', data);
            },
            getSCATDirectCauses: function (data) {
                return $http.post(url + 'getscatdirectcauses', data);
            },
            getSCATBasicCauses: function (data) {
                return $http.post(url + 'getscatbasiccauses', data);
            },
            getSCATSubCauses: function (data) {
                return $http.post(url + 'getscatsubcauses', data);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings']
    angular.module('incidentReportModule')
            .factory('incidentReportService', factory);
}())