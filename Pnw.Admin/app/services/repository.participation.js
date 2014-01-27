(function () {
    'use strict';

    var serviceId = 'repository.participation';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryParticipation]);

    function RepositoryParticipation(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.participation;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName);
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
    }
})();