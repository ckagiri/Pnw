(function () {
    'use strict';

    var serviceId = 'repository.season';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositorySeason]);

    function RepositorySeason(model, AbstractRepository) {
        var entityName = model.entityNames.season;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'startDate desc';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.getById = getById;
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
       
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName, orderBy);
        }

        function getAll(forceRemote) {
            var self = this;
            var seasons = [];

            if (self._areItemsLoaded() && !forceRemote) {
                seasons = self._getAllLocal(entityName, orderBy);
                return self.$q.when(seasons);
            }
            
            return EntityQuery.from('Seasons')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                seasons = data.results;
                self._areItemsLoaded(true);
                self.log('Retrieved [Season Partials] from remote data source', seasons.length, false);
                return seasons;
            }
        }
    }
})();