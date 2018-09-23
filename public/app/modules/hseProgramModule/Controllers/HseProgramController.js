(function () {
    var controller = function ($scope, Upload, $timeout, constantService, $state, $filter, coreService, uiGridExporterConstants, $q, $uibModal, hseProgramService, $rootScope) {
        $scope.user = coreService.getUser();
        $scope.$watch(function(){
            return coreService.getUser();
        }, function(newVal, oldVal){
            if(newVal !== oldVal){
                $scope.user = newVal;
                console.log($scope.user);
                init();
            }
        }, true);
        $rootScope.HSEDocumentsOptions = coreService.getGridOptions();
        $rootScope.HSEDocumentsOptions.exporterCsvFilename = 'hse_documents.csv';
        $rootScope.HSEDocumentsOptions.columnDefs = [
            {
                name: 'file_name',
                minWidth: 150,
                // categoryDisplayName: 'address',
                displayName: 'Document Name'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_extension',
                minWidth: 150,
                displayName: 'Document Type'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_uploadby',
                minWidth: 150,
                displayName: 'Owner Name'
                ,cellTooltip: true, headerTooltip: true
            },
            // {
            //     name: 'OwnerType',
            //     minWidth: 150,
            //     categoryDisplayName: 'address',
            //     displayName: 'Owner Type'
            // },
            {
                name: 'file_description',
                minWidth: 150,
                displayName: 'Summary Description'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_version',
                minWidth: 150,
                displayName: 'Version'
                ,cellTooltip: true, headerTooltip: true
            },
            {
                name: 'file_lastupdated',
                minWidth: 150,
                displayName: 'Last update '
                ,cellTooltip: true, headerTooltip: true
            },
            // {
            //     name: 'SummaryOflastDate',
            //     minWidth: 150,
            //     displayName: 'Summary Of last Date'
            // },
            // {
            //     name: 'Approvedby',
            //     minWidth: 150,
            //     displayName: 'Approved by'
            // },
            // {
            //     name: 'DateApproved',
            //     minWidth: 150,
            //     displayName: 'Date Approved'
            // },
            // {
            //     name: 'Datelastopenedbyuser',
            //     minWidth: 150,
            //     displayName: 'Date last opened by user'
            // }
        ];
        $rootScope.HSEDocumentsOptions.onRegisterApi = function (gridApi) {
            $rootScope.gridApi = gridApi;
        };
        $rootScope.HSEDocumentsOptions.showGridFooter = true;
        $rootScope.HSEDocumentsOptions.showColumnFooter = true;

        var init = function(){
            hseProgramService.getDocumentsRoot($scope.user.org_id)
            .then(function(response){
                if(!response.data.hasOwnProperty('file')){
                    $scope.treedata = response.data;
                    console.log($scope.treedata);
                    // $scope.selectedNode = $scope.treedata[0].children[0];
                    var selectedNode;
                    var parents = [];
                    console.log(angular.isDefined($scope.parents));
                    if (angular.isDefined($scope.parents) && $scope.parents.length !== 0) {
                        parents.push($scope.treedata[0]);
                        angular.forEach(parents, function ($value, $key) {
                            if ($key > 0 && angular.isDefined(parents[$key - 1]) && angular.isDefined($value))
                                parents.push($filter('filter')(parents[$key - 1].children, {'id': $value.id})[0])
                            if ($key === parents.length - 1) {
                                if (angular.isDefined(parents[parents.length - 1]))
                                    selectedNode = parents[parents.length - 1]; // in case of create new folder
                                else
                                    selectedNode = parents[parents.length - 2]; // in case of delete folder
                            }
                        })
                        console.log(parents);
                    }
                    $scope.selectedNode= angular.isDefined(selectedNode) ? selectedNode : $scope.treedata[0],
                    $scope.parents= angular.isDefined(parents) && parents.length ? parents : [$scope.treedata[0]]
                    console.log($scope.treedata);
                    console.log($scope.parents);
                    console.log($scope.selectedNode);
                    // setMenuOptions()
                    // $scope.tree.menuOptions = $scope.menuOptions
                    // if ($scope.parents.length > 1) {
                        getFiles()
                    // console.log($scope.files);
                        // $scope.HSEDocumentsOptions.data = getFiles()
                    // } 
                    // else {
                    //     $scope.db.filelist = []
                    //     if (!$scope.db.hasOwnProperty('upload'))
                    //         $scope.db.upload = {}
                    //     $scope.db.upload = {
                    //         showUpload: false
                    //     }
                    // }
                }else{
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: response.data});
                }
            }, function(error){
                coreService.resetAlert();
                coreService.setAlert({type: 'exception', message: error.data});
            });
        };
        $scope.$watch('parents', function(newVal, oldVal){
            if(newVal !== oldVal){
                $rootScope.currentPath = '';
                angular.forEach(newVal, function(parent, key){
                    $rootScope.currentPath += parent.name;
                    if(key < newVal.length-1)
                        $rootScope.currentPath += ' / ';
                });
            }
            console.log($rootScope.currentPath);
        }, true);
        // $scope.$watch('selectedNode', function(newVal, oldVal){
        //     if(newVal !== oldVal){
        //         getFiles();
        //         // $scope.HSEDocumentsOptions.data = files;
        //         // console.log($scope.HSEDocumentsOptions.data);
        //     }
        // });

        var getFiles = function () {
            // coreService.resetAlert()
            // coreService.setAlert({
            //     type: 'wait',
            //     message: 'Fetching files .. Please wait'
            // })
            var data = {
                item: $scope.selectedNode,
                org_id: $scope.user.org_id
            }
            hseProgramService.getFiles(data).then(function (response) {
                if (!response.data.hasOwnProperty('file')) {
                    coreService.resetAlert()
                    $rootScope.HSEDocumentsOptions.data = response.data;
                    console.log($rootScope.HSEDocumentsOptions.data);
                    // if ($scope.HSEDocumentsOptions.data.length)
                    //     $scope.selectedNode.hasFiles = true
                    // else
                    //     $scope.selectedNode.hasFiles = false
                    // if ($scope.hasOwnProperty('filesChanged'))
                    //     delete $scope.filesChanged
                    // if ($scope.hasOwnProperty('upload') && $scope.upload.hasOwnProperty('doneUpload')) {
                    //     $scope.upload.doneUpload = false
                    // }
                } else {
                    coreService.resetAlert()
                    coreService.setAlert({
                        type: 'exception',
                        message: response.data
                    })
                }
            }, function (response) {
                coreService.resetAlert()
                coreService.setAlert({
                    type: 'exception',
                    message: response.data
                })
            })
        };

        $scope.viewFile = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                // "api/getfile.php?id={{item.file_map_id}}&mod={{module}}" ng-class="{'is_a_primary': item.file_version > 1,'is_a_file': item.file_version == 1}"
                    // var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                    var item = $scope.gridApi.selection.getSelectedRows()[0];
                    console.log(item)
                    // hseProgramService.viewFile()
                    //         .then(function (response) {
                    //             console.log(response.data);
                    window.open('/hseprogram/'+item.file_id+'.'+item.file_extension, '_blank');
                            // }, function (error) {
                            //     coreService.resetAlert();
                            //     coreService.setAlert({type: 'exception', message: error.data});
                            // });
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.getVersions = function(){
            coreService.resetAlert();
            if ($scope.gridApi.selection.getSelectedRows().length) {
                var index = $rootScope.HSEDocumentsOptions.data.indexOf($scope.gridApi.selection.getSelectedRows()[0]);
                var item = $scope.gridApi.selection.getSelectedRows()[0];
                if (item.file_version > 1) {
                    console.log(item);
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'app/modules/hseProgramModule/views/fileVersions.html',
                        controller: 'FileVersionsController',
                        backdrop: 'static',
                        resolve: {
                            item: item
                        }
                    });
                    modalInstance.result.then(function (result) {
                        console.log(result);
                    }, function () {
                        console.log('modal-component dismissed at: ' + new Date());
                    });
                } else {
                    coreService.resetAlert();
                    coreService.setAlert({type: 'error', message: constantService.getMessage('fileversion')});
                }
            } else {
                coreService.resetAlert();
                coreService.setAlert({type: 'error', message: constantService.getMessage('selectrow')});
            }
        };

        $scope.getSelected = function (node, selected, parent) {
            if (selected) {
                hseProgramService.getSelectedParents($scope.treedata, node).then(function (response) {
                    $scope.parents = response
                    $scope.selectedNode = node
                    $rootScope.HSEDocumentsOptions.data = getFiles();
                })

            }
        }
        $scope.getToggled = function (node, expanded, parent) {
            if (expanded) {
                hseProgramService.getSelectedParents($scope.treedata, node).then(function (response) {
                    $scope.parents = response
                })
            }
        }
    
        // grid Code
    
        $scope.downloadCSV = function () {
            $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
            //$scope.gridApi.exporter.csvExport(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.ALL);
        }
    
        $scope.downloadPDF = function () {
            $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
        }
        $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
            if (col.filters[0].term) {
                return 'header-filtered';
            } else {
                return '';
            }
        };

        // $scope.$watch('files', function () {
        //     $scope.upload($scope.files);
        // });
        // $scope.$watch('file', function () {
        //     if ($scope.file != null) {
        //         $scope.upload([$scope.file]);
        //     }
        // });
        // $scope.log = '';
    
        // $scope.upload = function (files) {
        //     if (files && files.length) {
        //         for (var i = 0; i < files.length; i++) {
        //             var file = files[i];
        //             Upload.upload({
        //                 url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
        //                 fields: {
        //                     'username': $scope.username
        //                 },
        //                 file: file
        //             }).progress(function (evt) {
        //                 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //                 $scope.log = 'progress: ' + progressPercentage + '% ' + evt.config.file.name + '\n' + $scope.log;
        //             }).success(function (data, status, headers, config) {
        //                 $timeout(function () {
        //                     $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
        //                 });
        //             });
        //         }
        //     }
        // };
        // $scope.gridOptions = {
        //     paginationPageSizes: [10, 20, 30],
        //     paginationPageSize: 10,
        //     enableColumnResizing: true,
        //     enableFiltering: true,
        //     "Document Name": "Document One",
        //     "Document Type": "type",
        //     "Owner Name": "Enormo",
        //     "Owner Type": "Owner type",
        //     "Summary Description": "Description Here",
        //     "Version Number": "1.5",
        //     "Last Update date": "Enormo",
        //     "Summary Of last Date": "12-12-2016",
        //     "Approved by": "Carney",
        //     "Date Approved": "12-12-2016",
        //     "Date last opened by user": "02-01-2017",
        //     columnDefs: [
        //         {
        //             name: 'DocumentName',
        //             minWidth: 150,
        //             categoryDisplayName: 'address',
        //             displayName: 'Document Name'
        //         },
        //         {
        //             name: 'DocumentType',
        //             minWidth: 150,
        //             categoryDisplayName: 'Document Type'
        //         },
        //         {
        //             name: 'OwnerName',
        //             minWidth: 150,
        //             categoryDisplayName: 'Owner Name'
        //         },
        //         {
        //             name: 'OwnerType',
        //             minWidth: 150,
        //             categoryDisplayName: 'address',
        //             displayName: 'Owner Type'
        //         },
        //         {
        //             name: 'SummaryDescription',
        //             minWidth: 150,
        //             categoryDisplayName: 'Summary Description'
        //         },
        //         {
        //             name: 'VersionNumber',
        //             minWidth: 150,
        //             categoryDisplayName: 'Version Number'
        //         },
        //         {
        //             name: 'LastUpdatedate',
        //             minWidth: 150,
        //             categoryDisplayName: 'Last Update date'
        //         },
        //         {
        //             name: 'SummaryOflastDate',
        //             minWidth: 150,
        //             categoryDisplayName: 'Summary Of last Date'
        //         },
        //         {
        //             name: 'Approvedby',
        //             minWidth: 150,
        //             categoryDisplayName: 'Approved by'
        //         },
        //         {
        //             name: 'DateApproved',
        //             minWidth: 150,
        //             categoryDisplayName: 'Date Approved'
        //         },
        //         {
        //             name: 'Datelastopenedbyuser',
        //             minWidth: 150,
        //             categoryDisplayName: 'Date last opened by user'
        //         }],
        //     enableGridMenu: false,
        //     enableSelectAll: false,
        //     exporterMenuPdf: false,
        //     exporterMenuCsv: false,
        //     exporterCsvFilename: 'myFile.csv',
        //     exporterPdfDefaultStyle: {
        //         fontSize: 9
        //     },
        //     exporterPdfTableStyle: {
        //         margin: [30, 30, 30, 30]
        //     },
        //     exporterPdfTableHeaderStyle: {
        //         fontSize: 10,
        //         bold: true,
        //         italics: true,
        //         color: 'red'
        //     },
        //     exporterPdfHeader: {
        //         text: "My Header",
        //         style: 'headerStyle'
        //     },
        //     exporterPdfFooter: function (currentPage, pageCount) {
        //         return {
        //             text: currentPage.toString() + ' of ' + pageCount.toString(),
        //             style: 'footerStyle'
        //         };
        //     },
        //     exporterPdfCustomFormatter: function (docDefinition) {
        //         docDefinition.styles.headerStyle = {
        //             fontSize: 22,
        //             bold: true
        //         };
        //         docDefinition.styles.footerStyle = {
        //             fontSize: 10,
        //             bold: true
        //         };
        //         return docDefinition;
        //     },
        //     exporterPdfOrientation: 'portrait',
        //     exporterPdfPageSize: 'LETTER',
        //     exporterPdfMaxGridWidth: 500,
        //     exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
        //     onRegisterApi: function (gridApi) {
        //         $scope.gridApi = gridApi;
        //     }
        // };
    
    
    
        // get data
        // var data = [
        //     {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
    
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
        //         }, {
        //         "DocumentName": "Document One",
        //         "DocumentType": "type",
        //         "OwnerName": "Enormo",
        //         "OwnerType": "Owner type",
        //         "SummaryDescription": "Description Here",
        //         "VersionNumber": "1.5",
        //         "LastUpdatedate": "Enormo",
        //         "SummaryOflastDate": "12-12-2016",
        //         "Approvedby": "Carney",
        //         "DateApproved": "12-12-2016",
        //         "Datelastopenedbyuser": "02-01-2017"
        //         }
    
        //     ];
    
        
    
        // $scope.dataForTheTree =
        // [
        //     { "name" : "HSE Policies and Work Practices ",  "children" : [
        //         { "name" : "Management Commitment & Involvement", "children" : [] },
        //         { "name" : "Hazard Identification & Control", "children" : [] },
        //         { "name" : "Health & Hygiene", "children" : [] },
        //         { "name" : "Safe work Practices ", "children" : [] },
        //         { "name" : "Environmental Practices ", "children" : [] },
        //         { "name" : "Emergency Response", "children" : [] },
        //         { "name" : "Incidents", "children" : [] },
        //         { "name" : "Comunications", "children" : [] },
        //         { "name" : "Training", "children" : [] },
        //         { "name" : "Continuous Improvement", "children" : [] }
                
        //     ]},
        //     { "name" : "Operational Procedures ",  "children" : [
        //         { "name" : "Sub Item", "children" : [] },
                
        //     ]},
        //     { "name" : "Regulatory Compliance",  "children" : [
        //         { "name" : "Sub Item", "children" : [] },
                
        //     ]},
        //     { "name" : "Forms",  "children" : [
        //         { "name" : "Sub Item", "children" : [] },
                
        //     ]},
        //     { "name" : "What's New?",  "children" : [
        //         { "name" : "Sub Item", "children" : [] },
                
        //     ]},
        // ];
    };
    controller.$inject = ['$scope', 'Upload', '$timeout', 'constantService', '$state', '$filter', 'coreService', 'uiGridExporterConstants', '$q', '$uibModal', 'hseProgramService', '$rootScope'];
    angular.module("hseProgramModule").controller("HseProgramController", controller);
}());