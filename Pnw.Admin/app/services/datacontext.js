(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', 'entityManagerFactory', 'model', datacontext]);

    function datacontext(common, emFactory, model) {
        var EntityQuery = breeze.EntityQuery;
        var entityNames = model.entityNames;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var primePromise;
        var $q = common.$q;
        
        var storeMeta = {
            isLoaded: {
                teams: false,
                fixtures: false,
                results: false
            }
        };


        var service = {
            getResults: getResults,
            getPeople: getPeople,
            getMessageCount: getMessageCount,
            getFixturePartials: getFixturePartials,
            getTeamPartials: getTeamPartials,
            getTeamCount: getTeamCount,
            getFilteredTeamCount: getFilteredTeamCount,
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

        function getResults(forceRemote) {
            var orderBy = 'kickOff';
            var predicate = breeze.Predicate.create('isScheduled', '==', false);
            var results;

            if (_areResultsLoaded() && !forceRemote) {
                results = _getAllLocal(entityNames.result, orderBy, predicate);
                return $q.when(results);
            }
            
            return EntityQuery.from('Results')
                .select('id, kickOff, homeTeamId, awayTeamId, homeScore, venue')
                .orderBy(orderBy)
                .toType('Fixture')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                results = data.results;
                _areResultsLoaded(true);
                for (var i = results.length; i--;) {
                    results[i].isScheduled = false;
                }
                log('Retrieved [Results] from remote data source', results.length, true);
                return results;
            }
        }

        function getFixturePartials(forceRemote) {
            var predicate = breeze.Predicate.create('isScheduled', '==', true);
            var orderBy = 'kickOff, homeTeam.name';
            var fixtures;
            
            if (_areFixturesLoaded() && !forceRemote) {
                fixtures = _getAllLocal(entityNames.fixture, orderBy, predicate);
                return $q.when(fixtures);
            }
            
            return EntityQuery.from('Fixtures')
                .select('id, kickOff, homeTeamId, awayTeamId, venue, canPredict')
                .orderBy(orderBy)
                .toType('Fixture')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);
            
            function querySucceeded(data) {
                fixtures = data.results;
                _areFixturesLoaded(true);
                for (var i = fixtures.length; i--;) {
                    fixtures[i].isScheduled = true;
                }

                log('Retrieved [Fixture Partials] from remote data source', fixtures.length, true);
                return fixtures;
            }
        }
        
        function getTeamPartials(forceRemote, page, size, nameFilter) {
            var orderBy = 'name';
            
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            
            if (_areTeamsLoaded() && !forceRemote) {
                return $q.when(getByPage());
            }
            
            return EntityQuery.from('Teams')
                .select('id, name, code, tags')
                .orderBy(orderBy)
                .toType('Team')
                .using(manager).execute()
                .to$q(querySucceeded, _queryFailed);

            function querySucceeded(data) {
                _areTeamsLoaded(true);
                log('Retrieved [Team Partials] from remote data source', data.results.length, true);
                return getByPage();
            }
            
            function getByPage() {
                var predicate = null;

                if (nameFilter) {
                    predicate = _namePredicate(nameFilter);
                }

                var teams = EntityQuery.from(entityNames.team)
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(manager)
                    .executeLocally();

                return teams;
            }
        }
        
        function getTeamCount() {
            if (_areTeamsLoaded()) {
                return $q.when(_getLocalEntityCount(entityNames.team));
            }
            return EntityQuery.from(entityNames.team).take(0).inlineCount()
                .using(manager).execute()
                .to$q(_getInlineCount);
        }

        function getFilteredTeamCount(nameFilter) {
            var predicate = _namePredicate(nameFilter);

            var teams = EntityQuery.from(entityNames.team)
                .where(predicate)
                .using(manager)
                .executeLocally();

            return teams.length;
        }

        function _namePredicate(filterValue) {
            return breeze.Predicate.create('name', 'contains', filterValue);
        }

        function _getLocalEntityCount(resource) {
            var entities = EntityQuery.from(resource)
                .using(manager)
                .executeLocally();
            return entities.length;
        }

        function _getInlineCount(data) { return data.inlineCount; }

        function prime() {
            if (primePromise) return primePromise;

            primePromise = $q.all([getLookups()])
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
        
        function _getAllLocal(resource, ordering, predicate) {
            return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(manager)
                .executeLocally();
        }
        
        function _queryFailed(error) {
            var msg = config.appErrorPrefix + 'Error retreiving data.' + error.message;
            logError(msg, error);
            throw error;
        }
        
        function _areTeamsLoaded(value) {
            return _areItemsLoaded('teams', value);
        }
        
        function _areFixturesLoaded(value) {
            return _areItemsLoaded('fixtures', value);
        }

        function _areResultsLoaded(value) {
            return _areItemsLoaded('results', value);
        }

        function _areItemsLoaded(key, value) {
            if (value === undefined) {
                return storeMeta.isLoaded[key]; // get
            }
            return storeMeta.isLoaded[key] = value; // set
        }
    }
})();