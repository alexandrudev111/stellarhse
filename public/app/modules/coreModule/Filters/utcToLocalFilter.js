(function () {
    var filter = function () {
        return function (myDate, type) {
            if (myDate === null || myDate === '') {
                return '';
            } else if (myDate !== null) {
                var localTime = moment.utc(myDate).toDate();
                if (type === 'datetime') {
                    if (moment(localTime).format('YYYY-MM-DD HH:mm:ss') == 'Invalid date')
                        return '';
                    else
                        return moment(localTime).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    if (moment(localTime).format('YYYY-MM-DD') == 'Invalid date')
                        return '';
                    else
                        return moment(localTime).format('YYYY-MM-DD');
                }
            }
            else {
                return myDate
            }
        }
    }
    angular.module('coreModule')
            .filter('utcToLocal', filter);
}());

(function () {
    var filter = function () {
        return function (myDate, type) {
            if (myDate !== null) {
                if (type === 'datetime') {
                    return moment.utc(myDate).format('YYYY-MM-DD HH:mm:ss')
                }
                else {
                    return moment.utc(myDate).format('YYYY-MM-DD')
                }
            } else {
                return myDate
            }
        }
    }
    angular.module('coreModule')
            .filter('localToUtc', filter)
}());

// with format MM-DD-YYYY
(function () {
    var filter = function () {
        return function (myDate, type) {
            if (myDate === null || myDate === '') {
                return '';
            } else if (myDate !== null) {
                var localTime = moment.utc(myDate).toDate();
                localTime.setDate(localTime.getDate() + 1);
                if (type === 'datetime') {
                    if (moment(localTime).format('MM-DD-YYYY HH:mm:ss') == 'Invalid date')
                        return '';
                    else
                        return moment(localTime).format('MM-DD-YYYY HH:mm:ss');
                } else {
                    if (moment(localTime).format('MM-DD-YYYY') == 'Invalid date')
                        return '';
                    else
                        return moment(localTime).format('MM-DD-YYYY');
                }
            }
            else {
                return myDate
            }
        }
    }
    angular.module('coreModule')
            .filter('utcToLocal2', filter);
}());

(function () {
    var filter = function () {
        return function (myDate, type) {
            if (myDate !== null) {
                if (type === 'datetime') {
                    return moment(myDate).format('MM-DD-YYYY HH:mm:ss')
                }
                else {
                    return moment(myDate).format('MM-DD-YYYY')
                }
            } else {
                return myDate
            }
        }
    }
    angular.module('coreModule')
            .filter('localToUtc2', filter)
}());