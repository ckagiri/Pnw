(function() {
    'use strict';
    var controllerId = 'securityAPI';
    angular.module('app').factory(controllerId, ['$http', '$resource', securityAPI]);
    function securityAPI($http, $resource) {
        var urlPrefix = '/api';
        return {
            User: $resource(urlPrefix + '/user'),
            Session: $resource(urlPrefix + '/session'),
            password: {
                forgot: function (model) {
                    return $http.post(urlPrefix + '/password/forgot', model);
                },
                change: function (model) {
                    return $http.post(urlPrefix + '/password/change', model);
                }
            }
        };
    }
})();


