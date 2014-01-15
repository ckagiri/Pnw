(function () {
    'use strict';

    var serviceId = 'repository.lookup';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryLookup]);

    function RepositoryLookup(model, AbstractRepository) {
        var entityName = 'lookups';
        var entityNames = model.entityNames;
        var EntityQuery = breeze.EntityQuery;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.getAll = getAll;
            this.setLookups = setLookups;
        }
        
        // Allow this repo to have access to the Abstract Repo's functions,
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAll() {
            var self = this;
            return EntityQuery.from('Lookups')
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                model.createNullos(self.manager);
                self.log('Retrieved [Lookups]', data, true);
                return true;
            }
        }

        function setLookups() {
            this.lookupCachedData = {
                leagues: this._getAllLocal(entityNames.league, 'name'),
                seasons: this._getAllLocal(entityNames.season, 'name'),
            };
        }
    }
})();