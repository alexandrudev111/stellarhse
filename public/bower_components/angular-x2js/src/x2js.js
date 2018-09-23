/**
@fileOverview

@toc

*/

'use strict';

angular.module('cb.x2js', [])
  .factory('x2js', [ function () {
    return new X2JS({
        attributePrefix: '@'
    });
}]);
