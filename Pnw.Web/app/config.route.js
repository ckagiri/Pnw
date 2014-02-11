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
                    templateUrl: 'app/fixture/fixtures.html',
                    title: 'predict fixtures',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-calendar"></i> Fixtures'
                    }
                }
            }, {
                url: '/predictions',
                config: {
                    templateUrl: 'app/predict/predictions.html',
                    title: 'your predictions',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-list-ol"></i> Predictions'
                    }
                }
            }, {
                url: '/leaderboard',
                config: {
                    templateUrl: 'app/leaderboard/leaderboard.html',
                    title: 'leaderboard',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-trophy"></i> Leaderboard'
                    }
                }
            }, {
                url: '/howtoplay',
                config: {
                    templateUrl: 'app/general/howtoplay.html',
                    title: 'How To Play',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-book"></i> How To Play'
                    }
                }
            }
        ];
    }
})();