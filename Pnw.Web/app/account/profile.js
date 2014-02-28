(function() {
    'use strict';
    var controllerId = 'profile';

    angular.module('app').controller(controllerId, ['auth', 'common', 'identity', profile]);

    function profile(auth, common, identity) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var logSuccess = getLogFn(controllerId, 'success');

        var vm = this;
        vm.username = identity.currentUser.username;
        vm.fname = identity.currentUser.firstName;
        vm.lname = identity.currentUser.lastName;
        vm.email = identity.currentUser.email;

        activate();

        function activate() {
            common.activateController([], controllerId);
        }

        vm.update = function() {
            var newUserData = {
                username: vm.username,
                firstName: vm.fname,
                lastName: vm.lname,
                email: vm.email
            };

            auth.updateCurrentUser(newUserData).then(function() {
                logSuccess('Your user account has been updated');
            }, function(reason) {
                logError(reason);
            });
        };
    }
})();
