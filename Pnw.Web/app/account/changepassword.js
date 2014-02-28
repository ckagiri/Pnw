(function() {
    'use strict';
    var controllerId = 'changepassword';
    angular.module('app').controller(controllerId, ['$dialog', '$location', 'auth', 'common', 'events', 'validation', changepassword]);

    function changepassword($dialog, $location, auth, common, events, validation) {
        var vm = this;
        vm.password = {
            oldPassword: null,
            newPassword: null,
            confirmPassword: null
        };
        vm.modelErrors = void (0);
        vm.submit = submit;
        vm.signout = signout;

        activate();
        
        function activate() {
            common.activateController([], controllerId);
        }

        function submit() {
            auth.changePassword(vm.password)
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
        
        function signout() {
            $dialog.messageBox('Sign out?', 'Are you sure you want to sign out?', [
                { label: 'Ok', result: true },
                { label: 'Cancel', result: false, cssClass: 'btn-primary' }
            ]).open().then(function (result) {
                if (result) {
                    auth.logoutUser().then(function () {
                        console.log('You have successfully signed out!');
                        $location.path('/');
                    });
                }
            });
        };

    }
})();













