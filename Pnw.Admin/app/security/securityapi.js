(function() {
    'use strict';
    var controllerId = 'securityAPI';
    angular.module('app').factory(controllerId, ['$http', '$resource', securityAPI]);
    function securityAPI($http, $resource) {
        var urlPrefix = '/api';
        return {
            User: $resource(urlPrefix + '/users'),
            Session: $resource(urlPrefix + '/sessions'),
            password: {
                forgot: function (model) {
                    return $http.post(urlPrefix + '/passwords/forgot', model);
                },
                change: function (model) {
                    return $http.post(urlPrefix + '/passwords/change', model);
                }
            }
        };
    }
})();


