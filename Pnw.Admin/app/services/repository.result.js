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
            //this.getTopLocal = getTopLocal;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllLocal() {
            var self = this;
            var predicate = Predicate.create('isScheduled', '==', false);
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getAll(forceRemote) {
            var self = this;
            var predicate = breeze.Predicate.create('isScheduled', '==', false);
            var orderBy = 'kickOff, homeTeam.name';
            var results = [];

            if (self.zStorage.areItemsLoaded('results') && !forceRemote) {
                results = self._getAllLocal(entityName, orderBy, predicate);
                return self.$q.when(results);
            }
            
            return EntityQuery.from('Results')
                .select('id, kickOff, homeTeamId, awayTeamId, homeScore, awayScore, venue')
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
                return results;
            }
        }

        function getTopLocal() {
            var self = this;
            var predicate = Predicate.create('homeTeam.name', '==', 'Chelsea')
                .and('isScheduled', '==', false);

            return self._getAllLocal(entityName, orderBy, predicate);
        }
    }
})();