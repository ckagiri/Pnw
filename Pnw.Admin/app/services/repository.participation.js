(function () {
    'use strict';

    var serviceId = 'repository.participation';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryParticipation]);

    function RepositoryParticipation(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.participation;
        var orderBy = 'team.name';
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
            this.getBySeasonId = getBySeasonId;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName, orderBy);
        }

        function getAll(forceRemote) {
            var self = this;
            var participations = [];

            if (self.zStorage.areItemsLoaded('participations') && !forceRemote) {
                participations = self._getAllLocal(entityName);
                return self.$q.when(participations);
            }
            
            return EntityQuery.from('Participations')
                .select('teamId, seasonId')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                participations = data.results;
                self.zStorage.areItemsLoaded('participations', true);
                self.zStorage.save();
                self.log('Retrieved [Participation Partials] from remote data source', participations.length, true);
                return participations;
            }
        }
        
        function getBySeasonId(seasonId) {
            var self = this;
            var predicate = breeze.Predicate.create('seasonId', '==', seasonId);
            var xs = EntityQuery.from(entityName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();
            var participations = xs;
            return self.$q.when(participations);
        }
    }
})();