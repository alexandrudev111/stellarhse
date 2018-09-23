(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            
            getUserDetails: function (data) {
                return $http.post(url + 'getUserDetails', data);
            },
            getCrews: function (data) {
                return $http.post(url + 'getCrews', data);
            },
            getClassificationList : function(){
                return $http.get(url+'getClassificationList');
            },
            getDepartments : function(data){
                return $http.post(url+'getDepartments', data);
            },
            getUserGroup : function(data){
                return $http.post(url+'getUserGroup', data);
            },
            updateMyProfile : function(data){
                return $http.post(url+'updateMyProfile', data);
            },
            getRole : function(data){
                return $http.post(url+'getRole', data);
            },
             getSupervisors: function (post) {
                return $http.post(url + 'getSupervisors', post);
            },
            
        }
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('myAdminModule').factory('myAdminService', factory);
}());