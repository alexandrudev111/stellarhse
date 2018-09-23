
(function () {
    var factory = function ($http, appSettings) {
        var url = appSettings.api + appSettings.version + '/';
        var successHandler = function (response) {
            return response;
        };
        return {
            getOrgCharts: function (post) {
                return $http.post(url + 'getorgcharts', post);
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
            },
            getChartOtherFields: function (post) {
                return $http.post(url + 'getchartotherfields', post);
            },
            getTimeFrame: function (post) {
                return $http.post(url + 'getorgtimeframe', post);
            },
            getChartData: function (post) {
                return $http.post(url + 'getchartdata', post);
            },
            getTableData: function (post) {
                return $http.post(url + 'gettabledata', post);
            },
            saveOrgChart: function (post) {
                return $http.post(url + 'saveorgchart', post);
            },
            setOrgSettings: function (post) {
                return $http.post(url + 'setorgsetting', post);
            },
            getOrgSettings: function (post) {
                return $http.post(url + 'getorgsetting', post);
            },
            getOrgExternslData: function (post) {
                return $http.post(url + 'getorgexternsldata', post);
            },
            addOrgExternslData: function (post) {
                return $http.post(url + 'addorgexternsldata', post);
            },
            getOrgMetrics: function (post) {
                return $http.post(url + 'getorgmetrics', post);
            },
            getSharingOptions: function (language_id) {
                return $http.get(url + 'getsharingoptions/' + language_id);
            },
            getMatchedActiveUsers: function (post) {
                return $http.post(url + 'getMatchedActiveUsers', post);
            },
            shareFunc: function (post) {
                return $http.post(url + 'shareFunc', post);
            },
            deleteMetric: function (post) {
                return $http.post(url + 'deletemetric', post);
            },
            getMetrSharingBoards: function (metrics_id) {
                return $http.get(url + 'getmetricssharingboards/' + metrics_id);
            },
            getChartOrMetricsSharingBoards: function (post) {
                return $http.post(url + 'getChartOrMetricsSharingBoards' , post);
            },
            getDefaultKPI: function (post) {
                return $http.post(url + 'getdefaultKPI', post);
            },
            assignToFavourit: function (post) {
                return $http.post(url + 'assigntofavourit', post);
            },
            getFavouritKPI: function (post) {
                return $http.post(url + 'getfavouritKPI', post);
            },
            getMetricPeriodItems: function (lang_id) {
                return $http.get(url + 'getmetricperitems/' + lang_id);
            },
            getMetricProuducts: function (post) {
                return $http.post(url + 'getmetricproducts', post);
            },
            getMetricScope: function (lang_id) {
                return $http.get(url + 'getmetricscope/' + lang_id);
            },
            getMetricSubTypes: function (post) {
                return $http.post(url + 'getmetricsubtypes', post);
            },
            addMetFunc: function (post) {
                return $http.post(url + 'addmetfunc', post);
            },
            getDefChartData: function (table_field_name) {
                return $http.get(url + 'getdefchartdata/' + table_field_name);
            },
            assignToFavouritCharts: function (post) {
                return $http.post(url + 'assigntofavouritcharts', post);
            },
            viewFavChartFun: function(post){
                return $http.post(url + 'viewfavchart', post);
            },
            getOutputcodeId:function(post){
                return $http.post(url + 'getoutputcodeid', post);
            },
            drawChart : function(post){
                return $http.post(url + 'drawChart', post);
            },

        };
    };
    factory.$inject = ['$http', 'appSettings'];
    angular.module('analyticsModule').factory('analyticsService', factory);
}());