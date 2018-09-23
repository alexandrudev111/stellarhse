/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        return {
            getCustomers: function (post) {
                return $http.post(url + 'customersgrid', post);
            },
            getCustomerData: function (post) {
                return $http.post(url + 'getCustomerData', post);
            },
            getSupervisorList: function (post) {
                return $http.post(url + 'supervisorlist', post);
            },
            statuslist: function (language_id) {
                return $http.get(url + 'statuslist/' + language_id);
            },
            getLanguages: function () {
                return $http.get(url + 'languagelist');
            },
            productList: function () {
                return $http.get(url + 'productlist');
            },
            orgProducts: function (org_id) {
                return $http.get(url + 'orgproducts/' + org_id);
            },
            updateCustomer: function (post) {
                return $http.post(url + 'updatecustomer', post);
            },
            getOrgGroups: function (org_id) {
                return $http.get(url + 'orggroups/' + org_id);
            },
            addCustomerAdminEmail: function (post) {
                return $http.post(url + 'addcustomeradmin', post);
            },
            assignAdminToCompany: function (post) {
                return $http.post(url + 'assignadmintocompany', post);
            },
            checkActivation: function (activationCode) {
                return $http.get(url + 'checkactivation/' + activationCode);
            },
            activateAccount: function (post) {
                return $http.post(url + 'activateaccount', post);
            },
            checkSystemAdmin: function (org_id) {
                return $http.get(url + 'checksystemadmin/' + org_id);
            },
            getActiveUsers: function (org_id) {
                return $http.get(url + 'getactiveusers/' + org_id);
            },
            setupCompanyAdmin: function (post) {
                return $http.post(url + 'changesystemadmin', post);
            },
            deleteCustomer: function (post) {
                return $http.post(url + 'deletecustomer', post);
            },
            addOrgUser: function (post) {
                return $http.post(url + 'addorguser', post);
            },
            getActiveEmployees: function (org_id) {
                return $http.get(url + 'getactiveorgemployees/' + org_id);
            },
            getOrgAdminInfo: function (post) {
                return $http.post(url + 'getorgadmininfo', post);
            },
            updateCompanyAdmin: function (post) {
                return $http.post(url + 'editcustomeradmin', post);
            },
            getCustomersHistory: function (post) {
                return $http.post(url + 'getcustomerhistory', post);
            },
            thirdParties: function (post) {
                return $http.post(url + 'thirdparties' , post);
            },
            updateThirdParties:function(post){
                return $http.post(url + 'updatethirdparties' ,post);
            },
            getThirdPartyTypes:function(post){
                return $http.post(url+'getThirdPartyTypes' , post);
            },
            deleteThirdParty: function(post){
                return $http.post(url + 'deleteThirdParty', post);
            },
            thirdPartyHistory : function(post){
                return $http.post(url + 'thirdPartyHistory', post);
            },
            updateThirdPartyCustomers:function(post){
                return $http.post(url+ 'updateThirdPartyCustomers',post);
            },
            getOrgCustomerStatus:function(org_id){
                return $http.get(url+'getOrgCustomerStatus/'+org_id);
            },
            updateOrgLocation: function(post){
                return $http.post(url+'updateOrgLocation',post);
            },
            getLocationsByOrgLevel : function(post){
                return $http.post(url+'getLocationsByOrgLevel',post);
            },
            getLocations1:function(org_id){
                return $http.get(url+'getLocations1/'+org_id);
            },
            getLocations2:function(loc1_id){
                return $http.get(url+'getLocations2/'+loc1_id);
            },
            getLocations3:function(loc2_id){
                return $http.get(url+'getLocations3/'+loc2_id);
            },
            getLocations4:function(loc3_id){
                return $http.get(url+'getLocations4/'+loc3_id);
            },
            updateLocations : function(post){
                return $http.post(url+'updateLocation',post);
            },
            deleteLocation : function(post){
                return $http.post(url+'delLocation',post);
            },
            getCountryHistory : function(org_id){
                return $http.get(url+'getCountryHistory/'+org_id);
            },
            getStateHistory : function(org_id){
                return $http.get(url+'getStateHistory/'+org_id);
            },
            getAreaHistory : function(org_id){
                return $http.get(url+'getAreaHistory/'+org_id);
            },
            getSiteHistory : function(org_id){
                return $http.get(url+'getSiteHistory/'+org_id);
            },
            getOrgPeople: function(post){
                return $http.post(url+'getPeople',post);
            },
            activePeople : function(post){
                return $http.post(url+'activePeople',post);
            },
            inActivePeopleFun : function(post){
                return $http.post(url+'inActivePeopleFun',post);
            },assignReassignGroup : function(post){
                return $http.post(url+'assignReassignGroup',post);
            },
            getActiveGroupsByOrgId : function(post){
                return $http.post(url+ 'getActiveGroupsByOrgId',post);
            },
            getCrews : function(post){
                 return $http.post(url+ 'getCrewsByOrgIdAndLangId',post);
            },
            getClassifications : function(lang_id){
                return $http.get(url+'getClassifications/'+lang_id);
            },
            productListByOrgId : function(org_id){
                return $http.get(url+'getProductListByOrgId/'+org_id);
            },
            getMatchedActiveUsers : function(post){
                 return $http.post(url+ 'getMatchedActiveUsers',post);
            },
            getGroupProducts : function(group_id){
                 return $http.get(url+'getGroupProducts/'+group_id);
            },
            updateUsersGeneralFun : function(post){
                return $http.post(url+ 'updateUsersGeneralFun',post);
            },
            getProviders : function(data){
                return $http.post(url+ 'getProviders', data);
            },
            updateTrainingProvider:function(post){
                return $http.post(url + 'updateTrainingProvider' ,post);
            },
            deleteTrainingProvider: function (post) {
                return $http.post(url + 'deleteTrainingProvider', post);
            },
            trainingProviderHistory: function (post) {
                return $http.post(url + 'trainingProviderHistory', post);
            },
            getTrainings : function(data){
                return $http.post(url+ 'getTrainings', data);
            },
            updateTrainingType:function(post){
                return $http.post(url + 'updateTrainingType' ,post);
            },
            deleteTrainingType:function(post){
                return $http.post(url + 'deleteTrainingType' ,post);
            },
            trainingTypeHistory: function (post) {
                return $http.post(url + 'trainingTypeHistory', post);
            },
            updateEquipment:function(post){
                return $http.post(url + 'updateEquipment' ,post);
            },
            getEquipments : function(data){
                return $http.post(url+ 'getEquipments', data);
            },
            equipmentHistory: function (post) {
                return $http.post(url + 'equipmentHistory', post);
            },
            deleteEquipment: function (post) {
                return $http.post(url + 'deleteEquipment', post);
            },
            getProviderData: function (post) {
                return $http.post(url + 'getProviderData', post);
            },
            getTrainingTypeData: function (post) {
                return $http.post(url + 'getTrainingTypeData', post);
            },
            submitPeopleFunction:function (data) {
                return $http.post(url + 'submitPeopleFunction', data);
            },
            deletePeopleFunction:function (data) {
                return $http.post(url + 'deletePeopleFunction', data);
            },
            getPeoplesHistory: function (post) {
                return $http.post(url + 'getPeoplesHistory', post);
            },
            CheckEmail: function(post){
                return $http.post(url+'checkEmail',post);
            },
            getProductsByOrg: function(post){
                return $http.post(url+'getProductsByOrg',post);
            },
            getAdminName: function(post){
                return $http.post(url+'getOrgAdminName',post);
            },
            setAsAdmin: function(post){
                return $http.post(url+'setOrgAdmin',post);
            }
        };
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('adminModule').factory('customersService', factory);
}());