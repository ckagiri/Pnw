(function () {
    'use strict';

    var serviceId = 'repository.round';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryRound]);

    function RepositoryRound(model, AbstractRepository) {
        var entityName = model.entityNames.round;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllLocal(seasonId) {
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var self = this;
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getAll(forceRemote, seasonId) {
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var orderBy = 'startDate';
            var rounds;
            var self = this;

            if (self._areItemsLoaded() && !forceRemote) {
                rounds = self._getAllLocal(entityName, orderBy);
                return self.$q.when(rounds);
            }
            
            return EntityQuery.from('Rounds')
                .select('id, seasonId, leagueId, name, startDate, endDate')
                .where(predicate)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                rounds = data.results;
                self._areItemsLoaded(true);
                self.log('Retrieved [Season-Round Partials] from remote data source', rounds.length, true);
                return rounds;
            }
        }
    }
})();