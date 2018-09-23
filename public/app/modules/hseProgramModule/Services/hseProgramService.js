(function () {
    var factory = function ($http, appSettings, $q, $filter) {
        var url = appSettings.api + appSettings.version + '/';
        var vars = {
            type: null
        }
        return {
            getDocumentsRoot: function (org_id) {
                return $http.get(url + 'documentsroot/'+org_id);
            },
            getFiles: function (item) {
                return $http.post(url + 'getfiles', item);
            },
            getVersions: function (item) {
                return $http.post(url + 'getversions', item);
            },
            deleteVersions: function (item) {
                return $http.post(url + 'deleteversions', item);
            },
            deleteFile: function (itemid) {
                return $http.get(url + 'deletefile/'+ itemid);
            },
            addFolder: function (post) {
                return $http.post(url + 'addfolder', post);
            },
            deleteFolder: function (folderid) {
                return $http.get(url + 'deletefolder/' + folderid);
            },
            renameFolder: function (post) {
                return $http.post(url + 'renamefolder', post);
            },
            getSelectedParents: function (treedata, mynode) {
                // if (mynode.type === "cattype") {
                //     vars.type = mynode.name
                // }
                var deferred = $q.defer()
                var expanded = []
                var node = treedata[0]
                expanded.push(node)
                var search = {
                        id: mynode.id,
                        parentid: mynode.parentid
                    }

                var foundchild = $filter('filter')(node.children, search, true)[0]


                if (angular.isDefined(foundchild)) {
                    expanded.push(foundchild)
                } else {
                    for (var x = 0; x < node.children.length; x++) {
                        var xfoundchild;
                        xfoundchild = $filter('filter')(node.children[x].children, search, true)[0]
                        if (angular.isDefined(xfoundchild)) {
                            expanded.push(node.children[x])
                            expanded.push(xfoundchild)
                        } else {
                            for (var y = 0; y < node.children[x].children.length; y++) {
                                var yfoundchild;
                                yfoundchild = $filter('filter')(node.children[x].children[y].children, search, true)[0]
                                if (angular.isDefined(yfoundchild)) {
                                    expanded.push(node.children[x])
                                    expanded.push(node.children[x].children[y])
                                    expanded.push(yfoundchild)
                                } else {
                                    for (var z = 0; z < node.children[x].children[y].children.length; z++) {
                                        var zfoundchild
                                        zfoundchild = $filter('filter')(node.children[x].children[y].children[z].children, search, true)[0]

                                        if (angular.isDefined(zfoundchild)) {
                                            expanded.push(node.children[x])
                                            expanded.push(node.children[x].children[y])
                                            expanded.push(node.children[x].children[y].children[z])
                                            expanded.push(zfoundchild)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // console.log(vars.type)
                console.log(expanded.length)
                if (expanded.length > 4) {
                    console.log(expanded)
                    // if (vars.type === "Staging") {
                    //     expandedret = []
                    //     expandedret.push(treedata[0])
                    //     expandedret = expandedret.concat(expanded.slice(4))
                    // } else if (vars.type === "Global")
                        expandedret = expanded.slice(0, 4)
                } else {
                    expandedret = expanded
                }
                console.log(expandedret)
                deferred.resolve(expandedret)
                return deferred.promise
            }
        }
    };
    factory.$inject = ['$http', 'appSettings', '$q', '$filter'];
    angular.module('hseProgramModule').factory('hseProgramService', factory);
}());