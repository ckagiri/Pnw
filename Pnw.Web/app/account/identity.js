(function() {
    'use strict';
    var serviceId = 'identity';

    angular.module('app').factory(serviceId, ['$window', 'User', identity]);

    function identity($window, User) {
        var currentUser = null;
        if (!!$window.bootstrappedUserObject) {
            currentUser = new User();
            angular.extend(currentUser, $window.bootstrappedUserObject);
        }
        return {
            currentUser: currentUser,
            isAuthenticated: function() {
                return !!this.currentUser;
            },
            isAuthorized: function(role) {
                return !!this.currentUser && this.currentUser.roles.indexOf(role) > -1;
            }
        };
    }
})();
