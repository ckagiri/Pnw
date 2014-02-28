(function () {
    'use strict';
    var serviceId = 'events';
    angular.module('app').service(serviceId, ['$rootScope', events]);

    function events($rootScope) {
        this.trigger = function (name, args) {
            $rootScope.$broadcast(name, args);
        };

        this.on = function (name, handler) {
            $rootScope.$on(name, handler);
        };
    }
})();


