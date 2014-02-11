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
            this.getAll = getAll;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function create() {
            return this.manager.createEntity(entityName);
        }
        
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAll(forceRemote, seasonId) {
            var self = this;
            var fixtures = [];
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);

            if (self.zStorage.areItemsLoaded('fixtures') && !forceRemote) {
                fixtures = self._getAllLocal(entityName, orderBy, predicate);
                // passing an explicit false means you know what you're doing
                if (fixtures.length || forceRemote === false) {
                    return self.$q.when(fixtures);
                }
            }
            
            return EntityQuery.from('Fixtures')
                //.select('id, seasonId, kickOff, homeTeamId, awayTeamId, homeTeamImageSource, awayTeamImageSource, homeScore, awayScore, canPredict, matchStatus, venue')
                .where(predicate)
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                fixtures = data.results;
                for (var i = fixtures.length; i--;) {
                    fixtures[i].isScheduled = fixtures[i].matchStatus === "Scheduled";
                }
                self.zStorage.areItemsLoaded('fixtures', true);
                self.zStorage.save();
                self.log('Retrieved [Fixture Partials] from remote data source', fixtures.length, false);
                return fixtures;
            }
        }
    }
})();