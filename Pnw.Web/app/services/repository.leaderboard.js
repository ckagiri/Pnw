(function () {
    'use strict';

    var serviceId = 'repository.leaderboard';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryLeaderboard]);

    function RepositoryLeaderboard(model, AbstractRepository) {
        var entityName = model.entityNames.leaderboard;
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.get = get;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function get(forceRemote, leagueId, seasonId) {
            var self = this;
            var leaderboard = [];
            return EntityQuery.from('Leaderboard')
                .withParameters({ leagueId: leagueId, seasonId: seasonId })
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                leaderboard = data.results;
                self.log('Retrieved [Leaderboard] from remote data source', leaderboard.length, false);
                return leaderboard;
            }
        }
    }
})();