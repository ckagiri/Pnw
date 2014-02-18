(function () {
    'use strict';

    var serviceId = 'repository.round';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryRound]);

    function RepositoryRound(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.round;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.create = create;
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
            this.getById = getById;
            this.getBySeasonId = getBySeasonId;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function create(seasonId) {
            return this.manager.createEntity(entityName, { seasonId: seasonId });
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName, orderBy);
        }

        function getAll(forceRemote) {
            var self = this;
            var rounds = [];

            if (self.zStorage.areItemsLoaded('rounds') && !forceRemote) {
                rounds = self._getAllLocal(entityName);
                return self.$q.when(rounds);
            }
            
            return EntityQuery.from('MatchWeeks')
                .select('id, seasonId, leagueId, name, startDate, endDate')
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                rounds = data.results;
                self.zStorage.areItemsLoaded('rounds', true);
                self.zStorage.save();
                self.log('Retrieved [Season-Round Partials] from remote data source', rounds.length, true);
                return rounds;
            }
        }
        
        function getBySeasonId(seasonId) {
            var self = this;
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var xs = EntityQuery.from(entityName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();
            var rounds = xs;
            return self.$q.when(rounds);
        }
    }
})();