(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            //$routeProvider.when(r.url, r.config);
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });

        function setRoute(url, definition) {
            // Sets resolvers for all of the routes
            // by extending any existing resolvers (or creating a new one).
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime
            });
            $routeProvider.when(url, definition);
            return $routeProvider;
        }
    }

    prime.$inject = ['datacontext'];
    function prime(dc) { return dc.prime(); }

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
                url: '/fixture/:id',
                config: {
                    title: 'fixture',
                    templateUrl: 'app/fixture/fixturedetail.html',
                    settings: {}
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
            }, {
                url: '/team/:id',
                config: {
                    title: 'team',
                    templateUrl: 'app/team/teamdetail.html',
                    settings: {}
                }
            }, {
                url: '/workinprogress',
                config: {
                    templateUrl: 'app/wip/wip.html',
                    title: 'workinprogress',
                    settings: {
                        content: '<i class="icon-asterisk"></i> Work In Progress'
                    }
                }
            }
        ];
    }
})();