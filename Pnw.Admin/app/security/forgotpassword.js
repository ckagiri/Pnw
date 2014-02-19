(function () {
    'use strict';
    var controllerId = 'forgotpassword';
    angular.module('app').controller(controllerId, ['$location', 'common', 'events', 'securityAPI', forgotpassword]);

    function forgotpassword($location, common, events, securityAPI) {
        var vm = this;
        vm.password = {
            email: null
        };
        vm.submit = submit;

        activate();

        function activate() {
            common.activateController([], controllerId);
        }
        
        function submit() {
            vm.modelErrors = void(0);
            securityAPI.password.forgot(vm.password).
                success(function() {
                    events.trigger('passwordResetRequested');
                    $location.path('/');
                }).
                error(function() {
                    vm.modelErrors = ['An unexpected error has occurred ' +
                        'while requesting password reset.'];
                });
        }
    }
})();


