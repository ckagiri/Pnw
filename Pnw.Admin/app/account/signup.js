(function () {
    'use strict';
    var controllerId = 'signup';
    angular.module('app').controller(controllerId, ['$location', 'auth', 'common', 'events', 'validation', signup]);

    function signup($location, auth, common, events, validation) {
        var vm = this;
        vm.submit = submit;
        vm.modelErrors = void (0);

        activate();

        function activate() {
            common.activateController([], controllerId);
        }
       
        function submit() {
            var newUserData = {
                username: vm.username,
                email: vm.email,
                password: vm.password,
                confirmPassword: vm.confirmPassword
            };

            auth.createUser(newUserData).then(function () {
                console.log('User account created!');
                $location.path('/');
            }, function (response) {
                if (validation.hasModelErrors(response)) {
                    vm.modelErrors = validation.getModelErrors(response);
                    return;
                }
                vm.modelErrors = ['An unexpected error has occurred while signing up.'];
            });
        };
    }
})();





