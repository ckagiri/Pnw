(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', 'entityManagerFactory', datacontext]);

    function datacontext(common, emFactory) {
        var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var primePromise;
        var $q = common.$q;
        var entityNames = {
            fixture: 'Fixture',
            result: 'Result',
            league: 'League',
            season: 'Season',
            team: 'Team'
        };

        var service = {
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getFixturePartials: getFixturePartials,
            getTeamPartials: getTeamPartials,
            prime: prime
        };

        return service;

        function getMessageCount() { return $q.when(72); }

        function getPeople() {
            var people = [
                { firstName: 'John', lastName: 'Papa', age: 25, location: 'Florida' },
                { firstName: 'Ward', lastName: 'Bell', age: 31, location: 'California' },
                { firstName: 'Colleen', lastName: 'Jones', age: 21, location: 'New York' },
                { firstName: 'Madelyn', lastName: 'Green', age: 18, location: 'North Dakota' },
                { firstName: 'Ella', lastName: 'Jobs', age: 18, location: 'South Dakota' },
                { firstName: 'Landon', lastName: 'Gates', age: 11, location: 'South Carolina' },
                { firstName: 'Haley', lastName: 'Guthrie', age: 35, location: 'Wyoming' }
            ];
            return $q.when(people);
        }

        function getFixturePartials() {
            var orderBy = 'kickOff, homeTeam.name';
            var fixtures;
            
            return EntityQuery.from('Fixtures')
                .select('id, kickOff, homeTeamId, awayTeamId, venue')
                .orderBy(orderBy)
                .toType('Fixture')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);
            
            function querySucceeded(data) {
                fixtures = data.results;
                log('Retrieved [Fixture Partials] from remote data source', fixtures.length, true);
                return fixtures;
            }
        }
        
        function getTeamPartials() {
            var orderBy = 'name';
            var teams;

            return EntityQuery.from('Teams')
                .select('id, name, code, tags')
                .orderBy(orderBy)
                .toType('Team')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                teams = data.results;
                log('Retrieved [Team Partials] from remote data source', teams.length, true);
                return teams;
            }
        }

        function prime() {
            if (primePromise) return primePromise;

            primePromise = $q.all([getLookups(), getTeamPartials()])
                .then(extendMetadata)
                .then(success);
            return primePromise;

            function success() {
                setLookups();
                log('Primed the data');
            }
            
            function extendMetadata() {
                var metadataStore = manager.metadataStore;
                var types = metadataStore.getEntityTypes();
                types.forEach(function (type) {
                    if (type instanceof breeze.EntityType) {
                        set(type.shortName, type);
                    }
                });

                var fixtureEntityName = 'Fixture';
                ['Result', 'Results', 'Fixtures'].forEach(function (r) {
                    set(r, fixtureEntityName);
                });

                function set(resourceName, entityName) {
                    metadataStore.setEntityTypeForResourceName(resourceName, entityName);
                }
            }
        }
        
        function setLookups() {
            service.lookupCachedData = {
                leagues: _getAllLocal('League', 'name'),
                seasons: _getAllLocal('Season', 'name'),
            };
        }

        function getLookups() {
            return EntityQuery.from('Lookups')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                log('Retrieved [Lookups]', data, true);
                return true;
            }
        }
        
        function _getAllLocal(resource, ordering) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .using(manager)
                .executeLocally();
        }
        
        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retreiving data.' + error.message;
            logError(msg, error);
            throw error;
        }
    }
})();