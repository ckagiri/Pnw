﻿(function () {
    'use strict';

    var serviceId = 'repository.league';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryLeague]);

    function RepositoryLeague(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.league;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'name';

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.create = create;
            this.getById = getById;
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function create() {
            return this.manager.createEntity(entityName);
        }

        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName, orderBy);
        }

        function getAll(forceRemote) {
            var self = this;
            var orderBy = 'name';
            var leagues = [];

            if (self.zStorage.areItemsLoaded('leagues') && !forceRemote) {
                leagues = self._getAllLocal(entityName, orderBy);
                return self.$q.when(leagues);
            }
            
            return EntityQuery.from('Leagues')
                .select('id, code, name')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                leagues = data.results;
                self.zStorage.areItemsLoaded('leagues', true);
                self.zStorage.save();
                self.log('Retrieved [League Partials] from remote data source', leagues.length, true);
                return leagues;
            }
        }
    }
})();