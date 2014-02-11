(function () {
    'use strict';

    var serviceId = 'repository.result';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryResult]);

    function RepositoryResult(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.result;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'kickOff, homeTeam.name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
            this.getCount = getCount;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllLocal() {
            var self = this;
            var predicate = Predicate.create('isScheduled', '==', false);
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getAll(forceRemote, seasonId, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            var predicate = breeze.Predicate.create('isScheduled', '==', false);
            var orderBy = 'kickOff, homeTeam.name';
            var results = [];

            if (self.zStorage.areItemsLoaded('results') && !forceRemote) {
                return self.$q.when(getByPage());
            }
            
            return EntityQuery.from('Results')
                .select('id,seasonId, kickOff, homeTeamId, awayTeamId, homeScore, awayScore, venue, matchStatus, canPredict')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                results = data.results;
                for (var i = results.length; i--;) {
                    results[i].isScheduled = false;
                }
                self.zStorage.areItemsLoaded('results', true);
                self.zStorage.save();
                self.log('Retrieved [Result Partials] from remote data source', results.length, true);
                return getByPage();
            }
            
            function getByPage() {
                predicate = predicate.and('seasonId', '==', seasonId);

                if (nameFilter) {
                    var namePredicate = breeze.Predicate.create('homeTeam.name', 'contains', nameFilter)
                        .or('homeTeam.code', 'contains', nameFilter)
                        .or('awayTeam.name', 'contains', nameFilter)
                        .or('awayTeam.code', 'contains', nameFilter);
                    predicate = predicate.and(namePredicate);
                }

                results = EntityQuery.from(entityName)
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return results;
            }
        }

        function getCount(seasonId, nameFilter) {
            var predicate = breeze.Predicate.create('isScheduled', '==', false).and('seasonId', '==', seasonId);

            if (nameFilter) {
                var namePredicate = breeze.Predicate.create('homeTeam.name', 'contains', nameFilter)
                        .or('homeTeam.code', 'contains', nameFilter)
                        .or('awayTeam.name', 'contains', nameFilter)
                        .or('awayTeam.code', 'contains', nameFilter);
                predicate = predicate.and(namePredicate);
            }

            var results = EntityQuery.from(entityName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return this.$q.when(results.length);
        }
    }
})();