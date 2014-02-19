(function() {
    'use strict';
    var controllerId = 'myaccount';
    angular.module('app').controller(controllerId, ['$dialog', '$location', 'common', 'events', 'securityAPI', 'validation', myaccount]);

    function myaccount($dialog, $location, common, events, securityAPI, validation) {
        var vm = this;
        vm.password = {
            oldPassword: null,
            newPassword: null,
            confirmPassword: null
        };
        vm.changePassword = changePassword;
        vm.signOut = signOut;

        activate();
        
        function activate() {
            common.activateController([], controllerId);
        }

        function changePassword() {
            vm.modelErrors = void(0);
            securityAPI.password.change(vm.password)
                .success(function() {
                    events.trigger('passwordChanged');
                    $location.path('/');
                }).error(function(response) {
                    if (validation.hasModelErrors(response)) {
                        vm.modelErrors = validation.getModelErrors(response);
                        return;
                    }
                    vm.modelErrors = ['An unexpected error has occurred ' +
                        'while changing your password.'];
                });
        }

        function signOut() {
            $dialog.messageBox('Sign out?', 'Are you sure you want to sign out?', [
                { label: 'Ok', result: true },
                { label: 'Cancel', result: false, cssClass: 'btn-primary' }
            ]).open().then(function(result) {
                if (result) {
                    doSignOut();
                }
            });
        }

        function doSignOut() {
            var session = new securityAPI.Session();
            session.$delete(function() {
                events.trigger('signedOut');
                $location.path('/');
            }, function() {
                events.trigger('flash:error', {
                    message: 'An unexpected error has occurred while signing out.'
                });
            });
        }
    }
})();













