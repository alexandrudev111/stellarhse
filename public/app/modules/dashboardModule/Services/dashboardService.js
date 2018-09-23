(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getFieldLabels: function (data) {
                return $http.post(url + 'getFieldLabDashboard', data);
            },
            getMyNotificationDashboard : function(post){
                return $http.post(url + 'getMyNotificationDashboard', post);
            },
            getMyIncompleteActions : function(post){
                return $http.post(url + 'getMyIncompleteActions', post);
            },
            getMyIncompleteTraining : function(post){
                return $http.post(url + 'getMyIncompleteTraining', post);
            },
            getMyRecentReports : function(post){
                return $http.post(url + 'getMyRecentReports', post);
            },
            getAllNotificationDashboard : function(post){
                return $http.post(url + 'getAllNotificationDashboard', post);
            },
            getAllIncompleteActions : function(post){
                return $http.post(url + 'getAllIncompleteActions', post);
            },
            getAllIncompleteTraining : function(post){
                return $http.post(url + 'getAllIncompleteTraining', post);
            },
            getAllRecentReports : function(post){
                return $http.post(url + 'getAllRecentReports', post);
            },
            getReportPopUpData: function (data) {
                return $http.post(url + 'getReportPopupdata', data);
            },
            getemailContent : function(data){
                return $http.post(url + 'getEmailContent' , data);
            },
            updateActionStatus : function(data){
                return $http.post(url + 'updateActionStatus' , data);
            },
            getMyRecentReport : function(data){
                return $http.post(url + 'getMyRecentReport' , data);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('dashboardModule').factory('dashboardService', factory);
}());


