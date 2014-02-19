(function () {
    'use strict';
    var controllerId = 'navigation';
    angular.module('app').controller(controllerId, ['$location', '$scope', '$timeout', 'events', 'securityContext', navigation]);

    function navigation($location, $scope, $timeout, events, securityContext) {
        var vm = this;
        
        vm.myAccount = function () {
            var path = securityContext.isUserSignedIn() ?
                '/my-account' :
                '/sign-in';
            $location.path(path);
        };

        activate();

        function activate() {
            events.on('signedIn', sync);
            events.on('signedOut', sync);
        }

        function sync() {
            $timeout(function () {
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }, 0);
        }
    }
})();