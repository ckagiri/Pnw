(function () {
    'use strict';
    var controllerId = 'forgotpassword';
    angular.module('app').controller(controllerId, ['$location', 'auth', 'common', 'events', forgotpassword]);

    function forgotpassword($location, auth, common, events) {
        var vm = this;
        vm.password = {
            email: null
        };
        vm.modelErrors = void (0);
        vm.submit = submit;

        activate();

        function activate() {
            common.activateController([], controllerId);
        }
        
        function submit() {
            auth.forgotPassword(vm.password)
                .success(function() {
                    events.trigger('passwordResetRequested');
                    $location.path('/');
                })
                .error(function() {
                    vm.modelErrors = ['An unexpected error has occurred ' +
                        'while requesting password reset.'];
                });
        }
    }
})();


