/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function () {
    var factory = function ($http, appSettings, $filter, coreService, $window) {
        var url = appSettings.api + appSettings.version + '/';

        return {
            getNotificationModulesTypes: function(data){
                return $http.post(url + 'notificationmodulestypes', data);
            },
            getNotificationTypes: function(data){
                return $http.post(url + 'notificationtypes', data);
            },
            getNotifications: function(data){
                return $http.post(url + 'notifications', data);
            },
            getNotifiedEmployees: function(data){
                return $http.post(url + 'notifiedemployees', data);
            },
            getNotifiedGroups: function(data){
                return $http.post(url + 'notifiedgroups', data);
            },
            getFilterFields: function(data){
                return $http.post(url + 'filterfields', data);
            },
            getFilterValues: function(data){
                return $http.post(url + 'filtervalues', data);
            },
            getFilterEscalatedFields: function(data){
                return $http.post(url + 'filterescalatedfields', data);
            },
            saveNotification: function(data){
                return $http.post(url + 'savenotification', data);
            },
            deleteNotification: function(data){
                return $http.post(url + 'deletenotification', data);
            },
            getEmailTemplates: function(data){
                return $http.post(url + 'emailtemplates', data);
            },
            getNotificationData: function(data){
                return $http.post(url + 'getnotificationdata', data);
            },
            updateNotification: function(data){
                return $http.post(url + 'updatenotification', data);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings', '$filter', 'coreService', '$window'];
    angular.module('manageNotificationModule').factory('manageNotificationService', factory);
}());


