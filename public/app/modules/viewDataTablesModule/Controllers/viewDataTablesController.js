(function () {
    var controller = function ($scope, coreService, $state, viewDataTablesService, $filter, $stateParams) {
        var fields;
        coreService.setCurrentState('viewdatatables');
        /*$scope.moduleType = $stateParams.moduleType;
        console.log($scope.moduleType);*/
        // prepare permissions
        $scope.user = coreService.getUser();
        $scope.products = coreService.getProducts();
        $scope.permissions = coreService.getPermissions();
        $scope.dataTablesPermissions = [];
        $scope.dataTablesPermissions['general'] = $scope.permissions.general;
        $scope.dataTablesPermissions[1] = $scope.permissions.Hazard;
        $scope.dataTablesPermissions[2] = $scope.permissions.ABCanTrack;
        $scope.dataTablesPermissions[3] = $scope.permissions.Inspection;
        $scope.dataTablesPermissions[4] = $scope.permissions.SafetyMeeting;
        $scope.dataTablesPermissions[5] = $scope.permissions.MaintenanceManagement;
        $scope.dataTablesPermissions[6] = $scope.permissions.Training;

        for(var i = 1; i <= 6; i++){
            if($scope.dataTablesPermissions[i]){
                if($scope.dataTablesPermissions[i].ownwhathappened || $scope.dataTablesPermissions[i].ownhazarddetails || 
                    $scope.dataTablesPermissions[i].ownpeopleinvolved || $scope.dataTablesPermissions[i].ownaction ||
                    $scope.dataTablesPermissions[i].owndocuments)
                    $scope.dataTablesPermissions[i].ownreport = true;
                if($scope.dataTablesPermissions[i].readonlywhathappened || $scope.dataTablesPermissions[i].readonlyhazarddetails || 
                    $scope.dataTablesPermissions[i].readonlypeopleinvolved || $scope.dataTablesPermissions[i].readonlyaction ||
                    $scope.dataTablesPermissions[i].readonlydocuments)
                    $scope.dataTablesPermissions[i].readonlyreport = true;
                if($scope.dataTablesPermissions[i].otherwhathappened || $scope.dataTablesPermissions[i].otherhazarddetails || 
                    $scope.dataTablesPermissions[i].otherpeopleinvolved || $scope.dataTablesPermissions[i].otheraction ||
                    $scope.dataTablesPermissions[i].otherdocuments)
                    $scope.dataTablesPermissions[i].otherreport = true;
            }
        }
                    console.log($scope.dataTablesPermissions);
        if (!$scope.user)
            $state.go('login');
            var reportTypes = [];
            angular.forEach($scope.products, function(value, key){
                if(key === 'Hazard' && value)
                    reportTypes.push({id: 1, name: 'Hazard ID'});
                if(key === 'ABCanTrack' && value)
                    reportTypes.push({id: 2, name: 'Incident'});
                if(key === 'Inspection' && value)
                    reportTypes.push({id: 3, name: 'Inspection'});
                if(key === 'SafetyMeeting' && value)
                    reportTypes.push({id: 4, name: 'Safety Meeting'});
                if(key === 'MaintenanceManagement' && value)
                    reportTypes.push({id: 5, name: 'Maintenance'});
                if(key === 'Training' && value)
                    reportTypes.push({id: 6, name: 'Training'});
            });
            console.log(reportTypes);
        // var reportTypes = [
        //     {id: 1, name: 'Hazard ID'},
        //     {id: 2, name: 'Incident'},
        //     {id: 3, name: 'Inspection'},
        //     {id: 4, name: 'Safety Meeting'},
        //     {id: 5, name: 'Maintenance'},
        //     {id: 6, name: 'Training'}
        // ];
        var viewTypes = [
            {id: 10, name: 'Default'},
            {id: 20, name: 'Favorite'}
        ];
        $scope.selectedViews = [] ;
        //for get default types of module 1- hazard
        viewDataTablesService.getSubTypesViews({module: 1}).then(function (response) {
            console.log(response.data);
            var views = response.data ; 
            angular.forEach(views, function (value, key) {
               // if ($scope.moduleType == 1) {
                    if (value.type_code=="100" || value.type_code=="200" || value.type_code=="600" || value.type_code=="800" ) {
                        $scope.selectedViews.push({
                            name: value.favorite_type_name,
                            id: parseInt(value.type_code),
                            dBId: value.favorite_type_id,
                        });
                    }
               // }
               /* if ($scope.moduleType == 2) {
                    if (value.type_code=="100" || value.type_code=="200" || value.type_code=="300" || value.type_code=="400" ) {

                        $scope.selectedViews.push({
                            name: value.favorite_type_name,
                            id: parseInt(value.type_code),
                            dBId: value.favorite_type_id,
                        });
                    }
                }
                */

            });
            console.log("selectedViews", $scope.selectedViews );
            var viewTypeSubTypes = $scope.selectedViews ; 
            $scope.db.select = [
                {name: 'Report Type', selectArray: reportTypes},
                {name: 'Type', selectArray: viewTypes},
                {name: selectedViewTypeName + ' Type', selectArray: viewTypeSubTypes}
            ];
            $scope.db.selectArrays = [];
            angular.forEach($scope.db.select, function (select) {
                /*if (select.name == 'Report Type') 
                    $scope.db.selectArrays[select.name] = select.selectArray[($scope.moduleType-1)].id;
                else*/
                    $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                $scope.db.selectedView += $scope.db.selectArrays[select.name];
            });
            init();
        }, function (response) {
            coreService.resetAlert();
            coreService.setAlert({
                type: 'exception',
                message: response.data
            });
        });
       /* var viewTypeSubTypes = [
            {id: 100, name: 'All Corrective Actions'},
            {id: 200, name: 'All Hazards'},
            {id: 300, name: 'Supporting Documents'},
            {id: 400, name: 'People Involved'},
            {id: 500, name: 'Potential Impacts of hazards'},
            {id: 600, name: 'My Hazard Reports'},
            {id: 700, name: 'Hazard Report Versions'},
            {id: 800, name: 'My Corrective Actions'},
           {id: 900, name: 'Risk Controls Required'},
           {id: 1000, name: 'Third-parties involved'},
           {id: 1100, name: 'Equipment involved'},
           {id: 1200, name: 'Hazard Classifications '},
           {id: 1300, name: 'Deleted Hazard Reports '},
           {id: 1400, name: 'Corrective Action email log '},
        ];*/
//        $scope.selectedReportType = 1;
//        $scope.selectedViewType = 10;
        var selectedViewTypeName = viewTypes[0].name;
//        $scope.selectedViewTypeSubType = 100;
        $scope.db = [];
//        $scope.db.exportedData = {};
        $scope.db.module = coreService.getCurrentState();
        $scope.db.filters = {};
        $scope.db.filtersselect = {};
        $scope.db.search = '';
        $scope.db.org_id = $scope.user.org_id;
        $scope.db.selectedView = 0;

        $scope.db.title = "View Data Tables";
        $scope.db.start = 0;
        $scope.db.limit = 10;
        $scope.getSelectArrays = function (source) {
            console.log(source);
            if (source === $scope.db.select[0].name)
                $scope.db.selectArrays[$scope.db.select[2].name] = 100;//document.getElementById('').value = 1;

            if ($scope.db.selectArrays['Report Type'] === 1 && $scope.db.selectArrays['Type'] === 10) {                
                $scope.selectedViews = [] ;
                viewDataTablesService.getSubTypesViews({module: $scope.db.selectArrays['Report Type']}).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        if (value.type_code=="100" || value.type_code=="200" || value.type_code=="600" || value.type_code=="800" ) {
                            $scope.selectedViews.push({
                                name: value.favorite_type_name,
                                id: parseInt(value.type_code),
                                dBId: value.favorite_type_id,
                            });
                        }
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 1 && $scope.db.selectArrays['Type'] === 20) {                
                console.log("favorit");
                $scope.selectedViews = [] ;
                var data = {
                    module: $scope.db.selectArrays['Report Type'],
                    org_id: $scope.user.org_id,
                    employee_id: $scope.user.employee_id
                }
                viewDataTablesService.getSubTypesFavoritViews(data).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        $scope.selectedViews.push({
                            name: value.favorite_table_name,
                            defaultid: parseInt(value.type_code),
                            fields: value.field_id,
                            fields_name: value.field_name,
                            dBId: value.favorite_type_id,
                           // dBFavoritId: value.favorite_table_id
                            id: value.favorite_table_id
                        });
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 

                     // $scope.db.selectArrays = [];
                   //  $scope.db.selectedView = 0;
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 4 && $scope.db.selectArrays['Type'] === 10) {
               /* $filter('filter')($scope.db.select, {name: selectedViewTypeName + ' Type'})[0].selectArray =
                        [
                            {id: 100, name: 'All Safety Meeting Reports'},
                            {id: 200, name: 'My Safety Meeting Reports'},
                            {id: 300, name: 'All Follow-up Actions'},
                            {id: 400, name: 'My Follow-up Actions'},
                            {id: 500, name: 'People Involved'},
                            {id: 600, name: 'Third-parties Involved'},
                            {id: 700, name: 'Safety Meeting Report Versions'}
                //            {id: 300, name: 'Access Deleted Hazards'}
                        ];*/
                $scope.selectedViews = [] ;
                viewDataTablesService.getSubTypesViews({module: $scope.db.selectArrays['Report Type']}).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        // teporarly for publish response
                        if (value.type_code=="100" || value.type_code=="200" || value.type_code=="300" || value.type_code=="400" ) {
                            $scope.selectedViews.push({
                                name: value.favorite_type_name,
                                id: parseInt(value.type_code),
                                dBId: value.favorite_type_id,
                            });
                        }
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 4 && $scope.db.selectArrays['Type'] === 20) {                
                console.log("favorit");
                $scope.selectedViews = [] ;
                var data = {
                    module: $scope.db.selectArrays['Report Type'],
                    org_id: $scope.user.org_id,
                    employee_id: $scope.user.employee_id
                }
                viewDataTablesService.getSubTypesFavoritViews(data).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        $scope.selectedViews.push({
                            name: value.favorite_table_name,
                            defaultid: parseInt(value.type_code),
                            fields: value.field_id,
                            fields_name: value.field_name,
                            dBId: value.favorite_type_id,
                           // dBFavoritId: value.favorite_table_id
                            id: value.favorite_table_id
                        });
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 

                     // $scope.db.selectArrays = [];
                   //  $scope.db.selectedView = 0;
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 3 && $scope.db.selectArrays['Type'] === 10) {
                /*$filter('filter')($scope.db.select, {name: selectedViewTypeName + ' Type'})[0].selectArray =
                        [
                            {id: 100, name: 'All Corrective Actions'},
                            {id: 200, name: 'All Inspection'},
                            {id: 300, name: 'Equipment Inspected'},
                            {id: 400, name: 'Third-parties Involved'},
                            {id: 500, name: 'My Inspection Reports'},
                            {id: 600, name: 'My Corrective Actions'},
                            {id: 700, name: 'Hazard Classifications'},
                            {id: 800, name: 'People Involved'},
                            {id: 900, name: 'Risk Controls Required'},
                            {id: 1000, name: 'Potential Impacts of hazards'},
                            {id: 1100, name: 'Inspection Report Versions'},
                        ];*/
                $scope.selectedViews = [] ;
                viewDataTablesService.getSubTypesViews({module: $scope.db.selectArrays['Report Type']}).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        if (value.type_code=="100" || value.type_code=="200" || value.type_code=="500" || value.type_code=="600" ) {
                            $scope.selectedViews.push({
                                name: value.favorite_type_name,
                                id: parseInt(value.type_code),
                                dBId: value.favorite_type_id,
                            });
                        }
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 3 && $scope.db.selectArrays['Type'] === 20) {                
                console.log("favorit");
                $scope.selectedViews = [] ;
                var data = {
                    module: $scope.db.selectArrays['Report Type'],
                    org_id: $scope.user.org_id,
                    employee_id: $scope.user.employee_id
                }
                viewDataTablesService.getSubTypesFavoritViews(data).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        $scope.selectedViews.push({
                            name: value.favorite_table_name,
                            defaultid: parseInt(value.type_code),
                            fields: value.field_id,
                            fields_name: value.field_name,
                            dBId: value.favorite_type_id,
                           // dBFavoritId: value.favorite_table_id
                            id: value.favorite_table_id
                        });
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 

                     // $scope.db.selectArrays = [];
                   //  $scope.db.selectedView = 0;
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 2 && $scope.db.selectArrays['Type'] === 10) {
               /* $filter('filter')($scope.db.select, {name: selectedViewTypeName + ' Type'})[0].selectArray =
                        [
                            {id: 100, name: 'All Incidents'},
                            {id: 200, name: 'My Incidents'},
                            {id: 1500, name: 'Incident Report Versions'},
                            {id: 300, name: 'All Corrective Actions'},
                            {id: 400, name: 'My Corrective Actions'},
                            {id: 1600, name: 'Corrective Action email log'},
                            {id: 1700, name: 'Supporting Documents'},
                            {id: 500, name: 'Cause Analysis'},
                            {id: 1800, name: 'Deleted Incident Reports'},
                            {id: 600, name: 'People Involved'},
                            {id: 700, name: 'Risk Controls Required'},
                            {id: 800, name: 'Third-parties Involved'},
                            {id: 900, name: 'Equipment Involved'},
                            {id: 1000, name: 'Observations'},
                            {id: 1100, name: 'Environmental Conditions'},
                            {id: 1200, name: 'Impacts'},
                            {id: 1300, name: 'Investigation findings'},
                            {id: 1400, name: 'Injured body parts'}
                        ];*/
                $scope.selectedViews = [] ;
                viewDataTablesService.getSubTypesViews({module: $scope.db.selectArrays['Report Type']}).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        if (value.type_code=="100" || value.type_code=="200" || value.type_code=="300" || value.type_code=="400" ) {
                            $scope.selectedViews.push({
                                name: value.favorite_type_name,
                                id: parseInt(value.type_code),
                                dBId: value.favorite_type_id,
                            });
                        }
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 2 && $scope.db.selectArrays['Type'] === 20) {                
                console.log("favorit");
                $scope.selectedViews = [] ;
                var data = {
                    module: $scope.db.selectArrays['Report Type'],
                    org_id: $scope.user.org_id,
                    employee_id: $scope.user.employee_id
                }
                viewDataTablesService.getSubTypesFavoritViews(data).then(function (response) {
                    console.log(response.data);
                    var views = response.data ; 
                    angular.forEach(views, function (value, key) {
                        $scope.selectedViews.push({
                            name: value.favorite_table_name,
                            defaultid: parseInt(value.type_code),
                            fields: value.field_id,
                            fields_name: value.field_name,
                            dBId: value.favorite_type_id,
                           // dBFavoritId: value.favorite_table_id
                            id: value.favorite_table_id
                        });
                    });
                    console.log("selectedViews", $scope.selectedViews );
                     $scope.db.select[2].selectArray = $scope.selectedViews ; 

                     // $scope.db.selectArrays = [];
                   //  $scope.db.selectedView = 0;
                    angular.forEach($scope.db.select, function (select) {
                        if(!$scope.db.selectArrays[select.name])
                            $scope.db.selectArrays[select.name] = select.selectArray[0].id;
                        $scope.db.selectedView += $scope.db.selectArrays[select.name];
                    });
                }, function (response) {
                    coreService.resetAlert();
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    });
                });
            } else if ($scope.db.selectArrays['Report Type'] === 5 && $scope.db.selectArrays['Type'] === 10) {
                $filter('filter')($scope.db.select, {name: selectedViewTypeName + ' Type'})[0].selectArray =
                        [
                            {id: 100, name: 'All Maintenance Reports'},
                            {id: 200, name: 'My Maintenance Reports'},
                            //{id: 300, name: 'Maintenance Report Versions'},
                            {id: 400, name: 'All Follow-up Actions'},
                            {id: 500, name: 'My Follow-up Actions'},
                            //{id: 700, name: 'Follow-up Action email log'},
                            //{id: 800, name: 'Supporting Documents'},
                            //{id: 900, name: 'Deleted Maintenance Reports'},
                            {id: 1000, name: 'People Involved'},
                            {id: 1100, name: 'Third-parties involved'},
                            {id: 1200, name: 'Maintenance Report Versions'}
                        ];
            } else if ($scope.db.selectArrays['Report Type'] === 6 && $scope.db.selectArrays['Type'] === 10) {
                $filter('filter')($scope.db.select, {name: selectedViewTypeName + ' Type'})[0].selectArray =
                        [
                            {id: 100, name: 'All Training Reports'},
                            {id: 200, name: 'My Training Reports'},
                            {id: 300, name: 'All Follow-up Actions'},
                            {id: 400, name: 'My Follow-up Actions'},
                            {id: 500, name: 'People Involved'},
                            {id: 600, name: 'Training Providers'},
                            {id: 700, name: 'Training Report Versions'},
                        ];
            }
        };
        $scope.$watch('db.selectedView', function (newVal) {
            console.log("==>  newVal " + newVal);

            if ($scope.db.select){
                console.log($scope.db.select[2].selectArray);
                $scope.db.selectedObj =  $filter('filter')($scope.db.select[2].selectArray, {id: $scope.db.selectArrays['Default Type']})[0];
            }
            console.log( $scope.db.selectedObj);
            switch (newVal) {
                case 111: // Hazard Report & Default view & All Corrective Actions subtype
                case 811: // My Corrective Actions
                    fields = [
                        {
                            name: 'number',
                        },{
                            name: 'corrective_action_priority_id',
                        },{
                            name: 'corrective_action_status_id',
                        },{
                            name: 'assigned_to_id',
                        },{
                            name: 'supervisor_notify',
                        },{
                            name: 'notified_id',
                        },{
                             name: 'target_end_date',
                        },{
                            name: 'task_description',
                        }
                    ];
                    break;
                case 211: // Hazard Report & Default view & All Hazard subtype
                case 611: // My Hazard Reports
                    fields = [
                        {
                            name: 'locked_id',
                        },
                        {
                            name: 'number',
                        },
                        {
                            name: 'event_type_id',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'location4_id',
                        },
                        {
                            name: 'status_id',
                        },
                        {
                            name: 'risk_level',
                        }
                    ];
                    break;
                case 311: // Hazard Report & Default view & Supporting Documents
                    fields = [
                        {
                            name: 'locked',
                        },
                        {
                            name: 'number',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'attachment_name',
                        },
                        {
                            name: 'attachment_size',
                        }
                    ];
                    break;
                case 411: // Hazard Report & Default view & People Involved
                    fields = [
                        {
                            name: 'locked',
                        },
                        {
                            name: 'company',

                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'how_he_involved',
                        },{
                            name: 'number',
                        },{
                            name: 'people_involved_name',
                        },{
                            name: 'position',
                        },{
                            name: 'role_description',
                        }
                    ];
                    break;
                case 511: // Hazard Report & Default view & Impacts 
                    fields = [
                        {
                            name: 'locked_id',
                        },
                        {
                            name: 'number',
                        },
                        {
                            name: 'location4_id',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'potential_impact_of_hazard',
                        },
                        {
                            name: 'potential_impacts_description',
                        }
                    ];
                    break;
                case 711: // Hazard Report Versions
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'event_type_id',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'version_date',
                        },
                        {
                            name: 'version_number',
                        },
                        {
                            name: "updated_by_id",
                        }
                    ];
                    break;
                case 911: // Risk Controls Required
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'risk_control_id',
                        },
                        {
                            name: 'location4_id',
                        },
                    ];
                    break;
                case 1011: // Third-parties involved 
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'third_party_name',
                        },
                        {
                            name: 'third_party_type',
                        },
                        {
                            name: 'third_party_jop_number',
                        },
                        {
                            name: 'how_he_involved',
                        },
                        {
                            name: 'role_description',
                        },
                        {
                            name: 'third_party_representative_name ',
                        }
                    ];
                    break;
                case 1111: // Equipment involved 
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'location4_id',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'equipment_number',
                        },
                        {
                            name: 'equipment_name',
                        }
                    ];
                    break;
                case 1211: // Hazard Classifications
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'location4_id',
                        },
                        {
                            name: 'date',
                        },
                        {
                            name: 'classification_type',
                        },
                        {
                            name: 'type',
                        },
                        {
                            name: 'sub_type',
                        },
                        {
                            name: "potential_impacts_description",
                        }
                    ];
                    break;
                case 1311: //  Deleted Hazard Reports
                    fields = [
                        {
                            name: 'number',
                        },
                        {
                            name: 'event_type_id',
                        },
                        {
                            name: 'deletion_date',
                        },
                        {
                            name: 'deletion_reason',
                        },
                        {
                            name: 'deleted_by',
                        },
                        {
                            name: 'position',
                        }
                    ];
                    break;
                //////////// Safety Meeting ///////////////////
                case 114: // Safety Meeting Report & Default view & All Safety Meetings subtype
                case 214: // Safety Meeting Report & Default view & My Safety Meetings subtype
                    fields = [
                        {
                            name: 'locked_id',
                        },{
                            name: 'number',
                        },{
                            name: 'date',
                        },{
                            name: 'event_type_id',
                        },{
                            name: 'location4_id',
                        },{
                            name: 'identified_by',
                        },{
                            name: 'updated_by_id',
                        }
                    ];
                    break;
                case 314: // Safety Meeting Report & Default view & All Follow-up Actions subtype
                case 414: // Safety Meeting Report & Default view & My Follow-up Actions subtype
                    fields = [
                        {
                            name: 'number',
                        },{
                            name: 'date',
                        },{
                            name: 'target_end_date',
                        },{
                            name: 'corrective_action_status_id',
                        },{
                            name: 'corrective_action_priority_id',
                        },{
                            name: 'assigned_to_id',
                        },{
                            name: 'supervisor',
                        },{
                            name: 'notified_id',
                        },{
                            name: 'task_description',
                        },{
                            name: 'supervisor_notify',
                        },{
                            name: 'locked_id',
                        },{
                            name: 'updated_by_id',
                        },{
                            name: 'sent_date',
                        }           
                    ];
                    break;
                case 514: // Safety Meeting Report & Default view & People Involved subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'safetymeeting_number',
                            display: 'Safety Meeting report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'safetymeeting_date',
                            display: 'Meeting Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'person_name',
                            display: 'Name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'company',
                            display: 'Company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 614: // Safety Meeting Report & Default view & Third-parties Involved subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'safetymeeting_number',
                            display: 'Safety Meeting report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'safetymeeting_date',
                            display: 'Meeting Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'third_party_name',
                            display: 'Third-party company name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'contact_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'third_party_type_name',
                            display: 'Third-party type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 714: // Safety Meeting Report & Default view &  Safety Meetings Report Verssions
                    fields = [
                       
                        {
                            name: 'safetymeeting_number',
                            display: 'Safety Meeting report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'version_number',
                            display: 'Version Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_date',
                            display: 'Version date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'safetymeeting_type_name',
                            display: 'Meeting Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'safetymeeting_date',
                            display: 'Meeting Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'community',
                            display: 'Community',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'reporter_name',
                            display: 'Who chaired the meeting',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }
                    ];
                    break;
                    //////////// Inspection ///////////////////
                case 113:
                case 613: // Inspection Report & Default view & All Corrective Actions subtype
                    fields = [
                       {
                            name: 'number',
                        },{
                            name: 'date',
                        },{
                            name: 'target_end_date',
                        },{
                            name: 'corrective_action_status_id',
                        },{
                            name: 'corrective_action_priority_id',
                        },{
                            name: 'assigned_to_id',
                        },{
                            name: 'notified_id',
                        },{
                            name: 'task_description',
                        },{
                            name: 'supervisor_notify',
                        },{
                            name: 'locked_id',
                        },{
                            name: 'sent_date',
                        }
                 
                    ];
                    break;
                case 213 :
                case 513: // Inspection Report & Default view & All Inspection subtype
                    fields = [
                        {
                            name: 'locked_id',
                        },{
                            name: 'number',
                        },{
                            name: 'date',
                        },{
                            name: 'event_type_id',
                        },{
                            name: 'location4_id',
                        },{
                            name: 'status_id',
                        }
                    ];
                    break;
                case 313: // Inspection Report Equipment inspected
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_number',
                            display: 'Inspection Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'equipment_name',
                            display: 'Equipment name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'equipment_number',
                            display: 'Equipment #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'community',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }
                    ];
                    break;
                case 413: // Inspection Report Third-parties involved
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_number',
                            display: 'Hazard Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'organization_name',
                            display: 'Third-party company name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'third_party_name',
                            display: 'Third-party representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'third_party_type_name',
                            display: 'Third-party type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }
                    ];
                    break;
                case 713: // Inspection Hazard Classifications
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_number',
                            display: 'Hazard Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'classification_type',
                            display: 'Hazard Classification ',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'hazard_type',
                            display: 'Hazard Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'sub_type',
                            display: 'Hazard Subtype',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'type',
                            display: 'Cause Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'cause_subtype',
                            display: 'Cause Subtype',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }

                    ];
                    break;
                case 813: // Inspection Peopple involved
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_number',
                            display: 'Hazard Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'people_involved_name',
                            display: 'Name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'company',
                            display: 'Company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }

                    ];
                    break;
                case 913: // Inspection Risk Controls Required
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_type_name',
                            display: 'Inspection Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'community',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'risk_control',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }

                    ];
                    break;
                case 1013: // Inspection Potential Impacts of hazards
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_number',
                            display: 'Inspection Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'community',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'impact_type_name',
                            display: 'Potential impact',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'inspection_description',
                            display: 'Description of potential impacts',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }
                    ];
                    break;
                case 1113: // Inspection Report & Default view &  Inspection Report Versions
                    fields = [
                        {
                            name: 'inspection_number',
                            display: 'Inspection Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_number',
                            display: 'Version Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_date',
                            display: 'Version date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_type_name',
                            display: 'Inspection Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'inspection_date',
                            display: 'Inspection Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'community',
                            display: 'Community',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;

                //////// incident ////////
                case 112: // Incident Report & Default view & All Incident 
                case 212: // Incident Report & Default view & My Incident subtype
                    fields = [
                        {
                            name: 'locked_id'
                        },
                        {
                            name: 'incident_number'
                        },
                        {
                            name: 'date'
                        },
                        {
                            name: 'hour'
                        },
                        {
                            name: 'min'
                        }
                    ];
                    break;
                case 312: // Incident Report & Default view & All Corrective Actions subtype
                case 412: // Incident Report & Default view & My Corrective Actions subtype
                    fields = [
                        {
                            name: 'locked_id',
                        },{
                            name: 'incident_number',
                        },{
                            name: 'incident_date',
                        },{
                            name: 'corrective_action_status_id',
                        },{
                            name: 'corrective_action_priority_id',
                        },{
                            name: 'assigned_to_id',
                        },{
                            name: 'notified_id',
                        },{
                            name: 'target_end_date',
                        },{
                            name: 'task_description',
                        },{
                            name: 'corrective_action_supervisor',
                        },{
                            name: 'sent_date',
                        }
                    ];
                    break;
                case 512: // Incident Report & Default view & Cause Analysis subtype
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_type',
                            display: 'Incident Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'type_of_action',
                            display: 'Type of action',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'immdeiate_cause_type',
                            display: 'Immediate/Direct cause type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'substandard_acts',
                            display: 'Substandard acts',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'substandard_conditions',
                            display: 'Substandard conditions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'root_cause_type',
                            display: 'Root cause type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'job_factors',
                            display: 'Job factors',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'personal_factors',
                            display: 'Personal factors',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'individual_factor_type',
                            display: 'Individual factor type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'sub_cause_name',
                            display: 'Individual factor subtype',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;
                case 612: // Incident Report & Default view & People Involved subtype
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'person_name',
                            display: 'Name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'company',
                            display: 'Company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'other_location',
                            display: 'Other Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_name',
                            display: 'People involved name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_supervisor',
                            display: 'People involved supervisor',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'risk_control',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 712: // Incident Report & Default view & Risk Controls Required  subtype
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'location',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'risk_control_name',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'rep_name',
                            display: 'Reported by',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_company',
                            display: 'Reporter company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_position',
                            display: 'Reporter position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_crew',
                            display: 'Reporter crew',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_primary_phone',
                            display: 'Reporter phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_alternate_phone',
                            display: 'Reporter alternate phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'other_location',
                            display: 'Other location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'operation_type_name',
                            display: 'Operation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'crew_involved',
                            display: 'Crew involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'thirdparty_involved',
                            display: 'Third-party involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_name',
                            display: 'People involved name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_supervisor',
                            display: 'People involved supervisor',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipment_involved',
                            display: 'Equipment involved ',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident ',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 812: // Incident Report & Default view & Third-parties Involved subtype
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'third_party_name',
                            display: 'Third-party company name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'rep_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'third_party_type_name',
                            display: 'Third-party type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'rep_company',
                            display: 'Reporter company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_position',
                            display: 'Reporter position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_crew',
                            display: 'Reporter crew',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_primary_phone',
                            display: 'Reporter phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_alternate_phone',
                            display: 'Reporter alternate phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'other_location',
                            display: 'Other location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'crew_involved',
                            display: 'Crew involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'operation_type_name',
                            display: 'Operation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipment_involved',
                            display: 'Equipment involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident ',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'risk_control_name',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 912: // Incident Report & Default view & Equipment Involved

                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0

                        },
                        {
                            name: 'rep_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_company',
                            display: 'Reporter company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_position',
                            display: 'Reporter position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_crew',
                            display: 'Reporter crew',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_primary_phone',
                            display: 'Reporter phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_alternate_phone',
                            display: 'Reporter alternate phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipment_name',
                            display: 'Equipment name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'equipment_type',
                            display: 'Equipment type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipment_number',
                            display: 'Equipment #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'equipment_category_name',
                            display: 'Equipment category name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'other_location',
                            display: 'Other location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'location',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'operation_type_name',
                            display: 'Operation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'crew_involved',
                            display: 'Crew involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'third_party_involved',
                            display: 'Third-party involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_name',
                            display: 'People involved name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'people_involved_supervisor',
                            display: 'People involved supervisor',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident ',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'risk_control_name',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }

                    ];
                    break;
                case 1012: // Incident Report & Default view & Observations
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'rep_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_company',
                            display: 'Reporter company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_position',
                            display: 'Reporter position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_crew',
                            display: 'Reporter crew',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_primary_phone',
                            display: 'Reporter phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_alternate_phone',
                            display: 'Reporter alternate phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'other_location',
                            display: 'Other location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'community',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'observation_type',
                            display: 'Observation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'observation_sub_type',
                            display: 'Observation subtype',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'operation_type_name',
                            display: 'Operation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipments_name',
                            display: 'Equipment involved fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'risk_control',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 1112: // Incident Report & Default view &  Environmental Conditions
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'rep_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_company',
                            display: 'Reporter company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_position',
                            display: 'Reporter position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_crew',
                            display: 'Reporter crew',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_primary_phone',
                            display: 'Reporter phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'rep_alternate_phone',
                            display: 'Reporter alternate phone',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'other_location',
                            display: 'Other location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'community',
                            display: 'Location',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'env_condition_type',
                            display: 'Environmental condition type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'env_condition_sub_type',
                            display: 'Environmental condition subtype',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'operation_type_name',
                            display: 'Operation type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'equipments_name',
                            display: 'Equipment involved fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_description',
                            display: 'Description of incident',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'Probability_of_potential_consequences',
                            display: 'Sequence of activities and actions',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'total_risk_level_value',
                            display: 'Risk level',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'risk_control',
                            display: 'Risk controls required',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 1212: // Incident Report & Default view & Impacts subtype
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident Date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'impact_type_name',
                            display: 'Main Impact subcategory',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'imapct_sub_type_name',
                            display: 'Main Impact Category',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;
                case 1312: // Incident Report & Default view & Investigation findings
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'root_cause_param_name',
                            display: 'Root cause category investigation',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1},
                        {
                            name: 'root_cause_name',
                            display: 'Root cause category',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1}
                    ];
                    break;
                case 1412: // Incident Report & Default view & Injured body parts
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'impact_type_name',
                            display: 'Main Impact Category',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'impact_sub_type_name',
                            display: 'Main Impact Subcategory',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1},
                        {
                            name: 'body_part_name',
                            display: 'Body Parts Injured',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1}
                    ];
                    break;
                case 1512: // Incident Report Versions
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'version_number',
                            display: 'Version Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'event_type_name',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_date',
                            display: 'Version date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'ubdated_by',
                            display: 'Modified by',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;
                case 1612: // Incident Report Versions
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'sent_date',
                            display: 'Sent date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'target_end_date',
                            display: 'Target end date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'subject',
                            display: 'Subject',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'TO',
                            display: 'To',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'CC',
                            display: 'CC',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'sent',
                            display: 'Sent',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'resent',
                            display: 'Resent',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;
                case 1712: // Supporting Documents
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1

                        },
                        {
                            name: 'supp_doc_name',
                            display: 'Supporting document name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'supp_doc_size',
                            display: 'Supporting document size',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'doc_added_date',
                            display: 'Date document added',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'incident_date',
                            display: 'Incident date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'incident_type',
                            display: 'Incident type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        },
                        {
                            name: 'location_fields',
                            display: 'Location fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 0
                        }
                    ];
                    break;
                case 1812: // Deleted Incident Reports
                    fields = [
                        {
                            name: 'incident_number',
                            display: 'Incident report #',
                            type: 'number',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'deleted_by',
                            display: 'Deleted by',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'deletion_date',
                            display: 'Deletion date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'deletion_reason',
                            display: 'Deletion reason',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                    ];
                    break;
                    //////////////////// Maintenance ///////////////////

                case 115: // Maintenance Report & Default view & All Maintenance Reports
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'maintenance_type_name',
                            display: 'Maintenance type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_date',
                            display: 'Date maintenance completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'location4_name',
                            display: 'Facility location fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'equipment_name',
                            display: 'Equipment fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_reason_name',
                            display: 'Reason for maintenance',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                                /*
                                 {
                                 name: 'person_name',
                                 display: 'Name',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'rep_email',
                                 display: 'Email',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'rep_primary_phone',
                                 display: 'Phone',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'crew_involved',
                                 display: 'Crew involved',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'operation_type_name',
                                 display: 'Operation type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_type_name',
                                 display: 'Maintenance type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 
                                 
                                 {
                                 name: 'maintenance_description',
                                 display: 'Maintenance Description',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },*/
                    ];
                    break;
                case 215:  // Maintenance Report & Default view & My Maintenance Reports
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'maintenance_type_name',
                            display: 'Maintenance type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_date',
                            display: 'Date maintenance completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'location4_name',
                            display: 'Facility location fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'equipment_name',
                            display: 'Equipment fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_reason_name',
                            display: 'Reason for maintenance',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                    ];
                    break;
                case 415:  // Maintenance Report & Default view & All Follow-up Actions
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'followup_action_priority_name',
                            display: 'Priority',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: '`followup_action_status_name`',
                            display: 'Status',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'assigned_to_name',
                            display: 'Assigned to',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'supervisor_notify',
                            display: 'Supervisor notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'notified_names',
                            display: 'Also notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'target_end_date',
                            display: 'Target end date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'task_description',
                            display: 'Task description',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                                /* {
                                 name: 'rep_primary_phone',
                                 display: 'Phone',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'crew_involved',
                                 display: 'Crew involved',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'operation_type_name',
                                 display: 'Operation type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_type_name',
                                 display: 'Maintenance type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_description',
                                 display: 'Maintenance Description',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },*/
                    ];
                    break;
                case 515:  // Maintenance Report & Default view & My Follow-up Actions
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'followup_action_priority_name',
                            display: 'Priority',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: '`followup_action_status_name`',
                            display: 'Status',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'assigned_to_name',
                            display: 'Assigned to',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'supervisor_notify',
                            display: 'Supervisor notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'notified_names',
                            display: 'Also notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'target_end_date',
                            display: 'Target end date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                                /*    {
                                 name: 'task_description',
                                 display: 'Task description',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'rep_primary_phone',
                                 display: 'Phone',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'crew_involved',
                                 display: 'Crew involved',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'operation_type_name',
                                 display: 'Operation type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_type_name',
                                 display: 'Maintenance type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_description',
                                 display: 'Maintenance Description',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },*/
                    ];
                    break;

                case 1115: // Maintenance Report & Default view & Third - parties involved
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_date',
                            display: 'Date maintenance completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'third_party_name',
                            display: 'Third-party company name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }, {
                            name: 'contact_name',
                            display: 'Third-party company representative name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }, {
                            name: 'third_party_type',
                            display: 'Third-party type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        }, {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'maintenance_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                        /*
                         {
                         name: 'rep_email',
                         display: 'Email',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'rep_primary_phone',
                         display: 'Phone',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'crew_involved',
                         display: 'Crew involved',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'operation_type_name',
                         display: 'Operation type',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_type_name',
                         display: 'Maintenance type',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'community',
                         display: 'Facility location fields',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'equipment_name',
                         display: 'Equipment fields',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_reason_name',
                         display: 'Reason for maintenance',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_description',
                         display: 'Maintenance Description',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },*/
                    ];
                    break;
                case 1015: // Maintenance People involved
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_date',
                            display: 'Date maintenance completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'rep_name',
                            display: 'Name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'company',
                            display: 'Company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }
                        /*{
                         name: 'rep_email',
                         display: 'Email',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'rep_primary_phone',
                         display: 'Phone',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'crew_involved',
                         display: 'Crew involved',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'operation_type_name',
                         display: 'Operation type',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_type_name',
                         display: 'Maintenance type',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'community',
                         display: 'Facility location fields',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'equipment_name',
                         display: 'Equipment fields',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_reason_name',
                         display: 'Reason for maintenance',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },
                         {
                         name: 'maintenance_description',
                         display: 'Maintenance Description',
                         type: 'string',
                         filter_isfilter: 1,
                         filter_type: 'string',
                         show: 1,
                         },*/
                    ];
                    break;

                    //////////// Training ///////////////////
                case 1215: // Maintenance Report & Default view & All Maintenance Reports
                    fields = [
                        {
                            name: 'maintenance_number',
                            display: 'Maintenance report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_number',
                            display: 'Version Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_date',
                            display: 'Version date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'maintenance_type_name',
                            display: 'Maintenance type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_date',
                            display: 'Date maintenance completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        }, {
                            name: 'location4_name',
                            display: 'Facility location fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'equipment_name',
                            display: 'Equipment fields',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                        {
                            name: 'maintenance_reason_name',
                            display: 'Reason for maintenance',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
                        },
                                /*
                                 {
                                 name: 'person_name',
                                 display: 'Name',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'rep_email',
                                 display: 'Email',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'rep_primary_phone',
                                 display: 'Phone',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'crew_involved',
                                 display: 'Crew involved',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'operation_type_name',
                                 display: 'Operation type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 {
                                 name: 'maintenance_type_name',
                                 display: 'Maintenance type',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },
                                 
                                 
                                 {
                                 name: 'maintenance_description',
                                 display: 'Maintenance Description',
                                 type: 'string',
                                 filter_isfilter: 1,
                                 filter_type: 'string',
                                 show: 1,
                                 },*/
                    ];
                    break;
                case 116: // Training Report & Default view & All Training subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'training_type',
                            display: 'Training Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'traininy_completed_by',
                            display: 'Training to be completed by date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'assigned_to_name',
                            display: 'Training assigned to name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'completed_date',
                            display: 'Date training completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'level_achieved',
                            display: 'Level achieved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'expiry_date',
                            display: 'Recertification/expiry date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 216: // Training Report & Default view & My Training subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'training_type',
                            display: 'Training Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'training_reason',
                            display: 'Reason for training',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'traininy_completed_by',
                            display: 'Training to be completed by date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'assigned_to_name',
                            display: 'Training assigned to name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'completed_date',
                            display: 'Date training completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'level_achieved',
                            display: 'Level achieved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'course_mark',
                            display: 'Course mark',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'expiry_date',
                            display: 'Recertification/expiry date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 316: // Training Report & Default view & All Follow-up Actions subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'followup_action_priority_name',
                            display: 'Priority',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'followup_action_status_name',
                            display: 'Status',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'assigned_name',
                            display: 'Assigned to',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'followup_action_supervisor',
                            display: 'Supervisor notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'notified_names',
                            display: 'Also notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 6,
//                designclass: 'fixedWidth'
                        },
                        {
                            name: 'target_end_date',
                            display: 'Target end date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 7,
//                designclass: 'fixedWidth'
                        },
                        {
                            name: 'task_description',
                            display: 'Task description',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 7,
//                designclass: 'fixedWidth'
                        }
                    ];
                    break;
                case 416: // Training Report & Default view & My Follow-up Actions subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'followup_action_priority_name',
                            display: 'Priority',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'followup_action_status_name',
                            display: 'Status',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'assigned_name',
                            display: 'Assigned to',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'followup_action_supervisor',
                            display: 'Supervisor notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'notified_names',
                            display: 'Also notified',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 6,
//                designclass: 'fixedWidth'
                        },
                        {
                            name: 'target_end_date',
                            display: 'Target end date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 7,
//                designclass: 'fixedWidth'
                        },
                        {
                            name: 'task_description',
                            display: 'Task description',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 7,
//                designclass: 'fixedWidth'
                        }
                    ];
                    break;
                case 516: // Training Report & Default view & People Involved subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'completed_date',
                            display: 'Date training completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'training_type',
                            display: 'Training Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'people_name',
                            display: 'Name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'position',
                            display: 'Position',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'company',
                            display: 'Company',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'how_he_involved',
                            display: 'How was this person involved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'role_description',
                            display: 'Description of role',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 616: // Training Report & Default view & Training Providers subtype
                    fields = [
                        {
                            name: 'locked',
                            display: 'Locked',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 1,
//                customizeindex: 0,
//                designclass: 'mediumWidth'
                        },
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'training_type',
                            display: 'Training Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'completed_date',
                            display: 'Date training completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'provided_by',
                            display: 'Training provided by',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'training_quality',
                            display: 'Quality of training',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'comments',
                            display: 'Comments',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;
                case 716: // Training Report & Default view & All Training subtype
                    fields = [
                        {
                            name: 'training_number',
                            display: 'Training report #',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 1,
//                designclass: 'smallWidth'

                        },
                        {
                            name: 'version_number',
                            display: 'Version Number',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'version_date',
                            display: 'Version date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1
                        },
                        {
                            name: 'training_type',
                            display: 'Training Type',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 2,
//                designclass: 'typeWidth'
                        },
                        {
                            name: 'traininy_completed_by',
                            display: 'Training to be completed by date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 3,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'assigned_to_name',
                            display: 'Training assigned to name',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'completed_date',
                            display: 'Date training completed',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'level_achieved',
                            display: 'Level achieved',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        },
                        {
                            name: 'expiry_date',
                            display: 'Recertification/expiry date',
                            type: 'string',
                            filter_isfilter: 1,
                            filter_type: 'string',
                            show: 1,
//                customizeshow: 1,
//                customizedisable: 0,
//                customizeindex: 4,
//                designclass: 'bigWidth'
                        }
                    ];
                    break;

            }
            $scope.db.fields = fields;
            $scope.db.currentfields = fields;
        });
//        $scope.db.export = false;
//        $scope.db.editdocument = false;

//        $scope.$watch("db.export", function (newVal) {
//            if (newVal) {
//                var data = {
//                    partnertype: $scope.db.partnertype,
//                    partnerid: $scope.db.partnerid,
//                    search: $scope.db.search,
//                    doctypecount: doctypecount,
//                    start: 0,
//                    limit: 1844674407 // using big number to return all rows
//
//                };
//                console.log(data);
//                /* We should export all items not only the limit */
//                $scope.exportData(data);
//            }
//        })
//
//        $scope.$watch("db.editdocument", function (newVal) {
//            if (newVal) {
//                console.log($scope.db.selectedrow);
//                /* we should pass the selectedrow */
//                $scope.getDocumentPDF();
//            }
//        })
        var init = function (){
            var db = coreService.getDB();
            if (angular.isDefined(db) && db.length) {
                $scope.db = db;
               //  console.log($scope.db);
            }
           // console.log($scope.db);

    //        if ($scope.db.hasOwnProperty('items') && $scope.db.items.length) {

           $scope.user = coreService.getUser();
           // $scope.chooseView();
             $scope.xmlData = '<org_id>' +$scope.db.org_id+ '</org_id>\n';
            var data = {
                org_id: $scope.db.org_id,
                creator_id: $scope.user.employee_id,
                search: $se.db.search,
                start: $scope.db.start,
                limit: $scope.db.limit,
                selectedView: $scope.db.selectedView,
                xmlData: $scope.xmlData,
                xmlUpdate:  "1"
            };
            coreService.resetAlert();
            coreService.setAlert({type: 'wait', message: 'Loading Documents .. Please wait'});
            viewDataTablesService.getSelectedView(data).then(function (response) {
                coreService.resetAlert();
                $scope.db.items = response.data.items;
                $scope.db.count = response.data.count;
                $scope.db.currentPage = 1;
                $scope.db.numPages = Math.ceil($scope.db.count / $scope.db.limit);
                coreService.setDB($scope.db);
            }, function (response) {
                coreService.resetAlert();
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                });
            });
            console.log($scope.db.selectArrays['Report Type']);
        }
//        } else {
//            var data = {
//                org_id: $scope.db.org_id,
//                search: $scope.db.search,
//                start: $scope.db.start,
//                limit: $scope.db.limit,
//                select: $scope.db.select
//            };
//            console.log(data);
//            coreService.resetAlert();
//            coreService.setAlert({type: 'wait', message: 'Loading Documents .. Please wait'});
//            viewDataTablesService.getHazardAllCorrectiveActions(data).then(function (response) {
//                coreService.resetAlert();
//                $scope.db.items = response.data.items;
//                $scope.db.count = response.data.count;
//                $scope.db.currentPage = 1;
//                $scope.db.numPages = Math.ceil($scope.db.count / $scope.db.limit);
//                coreService.setDB($scope.db);
//            }, function (response) {
//                coreService.resetAlert();
//                coreService.setAlert({
//                    type: 'exception',
//                    message: response.data
//                });
//            });
//        }
    };
    controller.$inject = ['$scope', 'coreService', '$state', 'viewDataTablesService', '$filter', '$stateParams'];
    angular.module("viewDataTablesModule").controller("viewDataTablesController", controller);
})();