(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngResource',

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'ui.validate',
        'breeze.directives', // breeze validation directive (zValidate)
        'ngzWip',            // local storage and WIP module
        'ui.bootstrap.alert',
        'ui.bootstrap.dialog'
    ]);
    
    // Handle routing errors and success events
    app.run(['$route', '$rootScope', '$q', 'events', 'routemediator',
        function ($route, $rootScope, $q, events, routemediator) {
            // Include $route to kick start the router.
            breeze.core.extendQ($rootScope, $q);
            routemediator.setRoutingHandlers();
            events.on('signedIn', function () {
                showFlashSuccess('You are now signed in.');
            });
            function showFlashSuccess(message) {
                events.trigger('flash:success', {
                    message: message
                });
            }
        }]);
})();