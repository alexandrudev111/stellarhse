(function () {
    var admin = angular.module('analyticsModule', []);
    admin.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider) {
            $stateProvider
                    //.state("externalData", {
                        //url: "/externalData",
                        //templateUrl: //"app/modules/analyticsModule/views/externalData.html",
                        //controller: "analyticsCtrl"
                    //})
                    .state("ManageKPIFactor", {
                        url: "/ManageKPIFactor",
                        templateUrl: "app/modules/analyticsModule/views/calculations.html",
                        controller: "calculationCtrl"
                    })
                    //.state("currentMetrics", {
                       // url: "/currentMetrics",
                        //templateUrl: //"app/modules/analyticsModule/views/currentMetric//s.html",
                        //controller: "metricGridCtrl"
                    //})
                    .state("chartgrid", {
                        url: "/chartgrid",
                        templateUrl: "app/modules/analyticsModule/views/KPITabs.html",
                        controller: "chartGridCtrl"
                    })

                    .state("generatechart", {
                        url: "/generatechart",
                        templateUrl: "app/modules/analyticsModule/views/generatechart.html",
                        controller: "chartCtrl"
                    })
                    .state("metricsGenerate", {
                        url: "/metricsGenerate",
                        templateUrl: "app/modules/analyticsModule/views/generateMetrics.html",
                        controller: "metricsCtrl"
                    })
        
                    .state("analytics", {
                        url: "/analytics",
                        templateUrl: "app/modules/analyticsModule/views/analytics.html",
                        controller: "analyticsCtrl"
                    })
        
        
        
                



        }]);
}());