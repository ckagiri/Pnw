(function () {
    'use strict';

    var serviceId = 'repository.leaderboard';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryLeaderboard]);

    function RepositoryLeaderboard(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.leaderboard;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.get = get;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function get(forceRemote, leagueId, seasonId) {
            var self = this;
            var leaderboard = [];
            //var predicate
            //if (self.zStorage.areItemsLoaded('leaderboard') && !forceRemote) {
            //    leaderboard = self._getAllLocal(entityName, null, predicate);
            //    return self.$q.when(leaderboard);
            //}

            return EntityQuery.from('Leaderboard')
                .withParameters({ leagueId: leagueId, seasonId: seasonId })
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                leaderboard = data.results;
                self.zStorage.areItemsLoaded('leaderboard', true);
                self.zStorage.save();
                self.log('Retrieved [Leaderboard] from remote data source', leaderboard.length, true);
                return leaderboard;
            }
        }
    }
})();