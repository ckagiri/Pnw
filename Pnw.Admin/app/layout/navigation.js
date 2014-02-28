(function () {
    'use strict';
    var controllerId = 'navigation';
    angular.module('app').controller(controllerId, ['$dialog', '$location', '$scope', '$timeout', 'auth', 'events', 'identity', navigation]);

    function navigation($dialog, $location, $scope, $timeout, auth, events, identity) {
        var vm = this;
        
        vm.signin = function() {
            $location.path('/sign-in');
        };
        
        vm.register = function () {
            $location.path('/sign-up');
        };

        vm.identity = identity;

        vm.signout = function() {
            $dialog.messageBox('Sign out?', 'Are you sure you want to sign out?', [
                { label: 'Ok', result: true },
                { label: 'Cancel', result: false, cssClass: 'btn-primary' }
            ]).open().then(function (result) {
                if (result) {
                    auth.logoutUser().then(function() {
                        console.log('You have successfully signed out!');
                        $location.path('/');
                    });
                }
            });
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