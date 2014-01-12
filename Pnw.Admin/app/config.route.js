﻿(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/fixtures',
                config: {
                    title: 'fixtures',
                    templateUrl: 'app/fixture/fixtures.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-calendar"></i> Fixtures'
                    }
                }
            }, {
                url: '/results',
                config: {
                    title: 'results',
                    templateUrl: 'app/result/results.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-calendar"></i> Results'
                    }
                }
            }, {
                url: '/teams',
                config: {
                    title: 'teams',
                    templateUrl: 'app/team/teams.html',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-lock"></i> Teams'
                    }
                }
            }
        ];
    }
})();