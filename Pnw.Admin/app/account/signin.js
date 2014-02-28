(function () {
    'use strict';
    var controllerId = 'signin';
    angular.module('app').controller(controllerId, ['$location', 'auth', 'common', 'events', 'validation', signin]);

    function signin($location, auth, common, events, validation) {
        var vm = this;
        vm.submit = submit;
        vm.username = undefined;
        vm.password = undefined;

        activate();

        function activate() {
            common.activateController([], controllerId);
        }

        function submit(username, password) {
            vm.modelErrors = void(0);
            auth.authenticateUser(username, password).then(function(success) {
                if (success) {
                    events.trigger('signedIn');
                    $location.path('/');
                } else {
                    var error = 'Username/Password combination incorrect';
                    vm.modelErrors = [error];
                    console.log(error);
                }
            },
                function(response) {
                    var error = validation.hasModelErrors(response) ?
                        'Invalid credentials.' :
                        'An unexpected error has occurred while signing in.';
                    vm.modelErrors = [error];
                });
        }
    }
})();

