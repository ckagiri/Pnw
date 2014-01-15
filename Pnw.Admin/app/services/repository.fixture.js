(function () {
    'use strict';

    var serviceId = 'repository.fixture';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryFixture]);

    function RepositoryFixture(model, AbstractRepository) {
        var entityName = model.entityNames.fixture;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'kickOff, homeTeam.name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.getById = getById;
            this.getAllLocal = getAllLocal;
            //this.getTopLocal = getTopLocal;
            this.getPartials = getPartials;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            var predicate = Predicate.create('isScheduled', '==', true);
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getPartials(forceRemote) {
            var self = this;
            var predicate = breeze.Predicate.create('isScheduled', '==', true);
            var orderBy = 'kickOff, homeTeam.name';
            var fixtures = [];

            if (self._areItemsLoaded() && !forceRemote) {
                fixtures = self._getAllLocal(entityName, orderBy, predicate);
                return self.$q.when(fixtures);
            }

            return EntityQuery.from('Fixtures')
                .select('id, seasonId, kickOff, homeTeamId, awayTeamId, matchStatus, venue')
                .orderBy(orderBy)
                .toType('Fixture')
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                fixtures = data.results;
                for (var i = fixtures.length; i--;) {
                    fixtures[i].isScheduled = true;
                }
                self.log('Retrieved [Fixture Partials] from remote data source', fixtures.length, true);
                self._areItemsLoaded(true);
                return fixtures;
            }
        }

        function getTopLocal() {
            var self = this;
            var predicate = Predicate.create('homeTeam.name', '==', 'Chelsea')
                .and('isScheduled', '==', true);

            return self._getAllLocal(entityName, orderBy, predicate);
        }
    }
})();