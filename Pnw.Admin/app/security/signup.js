(function () {
    'use strict';
    var controllerId = 'signup';
    angular.module('app').controller(controllerId, ['$location', 'common', 'events', 'validation', 'securityAPI', signup]);

    function signup($location, common, events, validation, securityAPI) {
        var vm = this;
        vm.user = new securityAPI.User();
        vm.submit = submit;
        
        activate();

        function activate() {
            common.activateController([], controllerId);
        }

        function submit() {
            vm.modelErrors = void(0);
            vm.user.$save(function() {
                events.trigger('signedUp');
                $location.path('/');
            }, function(response) {
                if (validation.hasModelErrors(response)) {
                    vm.modelErrors = validation.getModelErrors(response);
                    return;
                }
                vm.modelErrors = ['An unexpected error has occurred while signing up.'];
            });
        }
    }
})();





