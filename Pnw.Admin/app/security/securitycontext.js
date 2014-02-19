(function () {
    'use strict';
    var serviceId = 'securityContext';
    angular.module('app').service(serviceId, ['securityAPI', securityContext]);

    function securityContext(securityAPI) {
        var userSignedIn = false;

        this.isUserSignedIn = function () {
            return userSignedIn;
        };

        this.userSignedIn = function (options) {
            userSignedIn = true;
        };

        this.userSignedOut = function () {
            userSignedIn = false;
        };
    }
})();



