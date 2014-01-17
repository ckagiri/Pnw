(function () {
    'use strict';

    var serviceId = 'repository.fixture';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryFixture]);

    function RepositoryFixture(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.fixture;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'kickOff, homeTeam.name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.create = create;
            this.getById = getById;
            this.getAllLocal = getAllLocal;
            //this.getTopLocal = getTopLocal;
            this.getPartials = getPartials;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function create() {
            return this.manager.createEntity(entityName);
        }
        
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

            if (self.zStorage.areItemsLoaded('fixtures') && !forceRemote) {
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
                self.zStorage.areItemsLoaded('fixtures', true);
                self.zStorage.save();
                self.log('Retrieved [Fixture Partials] from remote data source', fixtures.length, true);
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