(function () {
    'use strict';
    var controllerId = 'signin';
    angular.module('app').controller(controllerId, ['$location', 'common', 'events', 'securityAPI', 'validation', signin]);

    function signin($location, common, events, securityAPI, validation) {
        var vm = this;
        vm.submit = submit;
        vm.session = new securityAPI.Session();

        activate();

        function activate() {
            common.activateController([], controllerId);
        }

        function submit() {
            vm.modelErrors = void(0);
            vm.session.$save(function() {
                events.trigger('signedIn');
                $location.path('/');
            }, function(response) {
                var error = validation.hasModelErrors(response) ?
                    'Invalid credentials.' :
                    'An unexpected error has occurred while signing in.';
                vm.modelErrors = [error];
            });
        }
    }
})();

