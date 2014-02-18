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
        
        function create(obj) {
            return this.manager.createEntity(entityName, { leagueId: obj.leagueId, seasonId: obj.seasonId });
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal(seasonId) {
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var self = this;
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getAll(forceRemote, page, size, seasonId) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var orderBy = 'startDate';

            if (self.zStorage.areItemsLoaded('rounds') && !forceRemote) {
                return self.$q.when(getByPage());
            }
            
            return EntityQuery.from('Rounds')
                .select('id, seasonId, leagueId, name, startDate, endDate')
                .where(predicate)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var rounds = data.results;
                self.zStorage.areItemsLoaded('rounds', true);
                self.zStorage.save();
                self.log('Retrieved [Season-Round Partials] from remote data source', rounds.length, true);
                return getByPage();
            }

            function getByPage() {
                var rounds = EntityQuery.from(entityName)
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

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