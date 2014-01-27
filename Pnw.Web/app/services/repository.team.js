﻿(function () {
    'use strict';

    var serviceId = 'repository.team';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryTeam]);

    function RepositoryTeam(model, AbstractRepository, zStorage, zStorageWip) {
        var entityName = model.entityNames.team;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.create = create;
            this.getById = getById;
            this.getCount = getCount;
            this.getAll = getAll;
            this.getFilteredCount = getFilteredCount;
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

        function getCount() {
            var self = this;
            if (self.zStorage.areItemsLoaded('teams')) {
                return self.$q.when(self._getLocalEntityCount(entityName));
            }
            // Teams aren't loaded; ask the server for a count.
            return EntityQuery.from('Teams')
                .take(0).inlineCount()
                .using(self.manager).execute()
                .to$q(self._getInlineCount);
        }

        function getAll(forceRemote) {
            var self = this;

            if (self.zStorage.areItemsLoaded('teams') && !forceRemote) {
                // Get the page of teams from local cache
                return self.$q.when(getByPage());
            }
        
            return EntityQuery.from('Teams')
               .select('id, name, code, tags, imageSource')
               .orderBy(orderBy)
               .toType(entityName)
               .using(self.manager).execute()
               .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self._setIsPartialTrue(data.results);
                self.zStorage.areItemsLoaded('teams', true);
                self.zStorage.save();
                self.log('Retrieved [Team Partials] from remote data source', data.results.length, true);
                return data;
            }
        }
        
        function getFilteredCount(nameFilter) {
            var predicate = _namePredicate(nameFilter);

            var teams = EntityQuery.from(entityName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return teams.length;
        }
        
        function getAllLocal(includeNullo) {
            var self = this,
                predicate = null;
            if (includeNullo) {
                predicate = this._predicates.isNullo;
            } 
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function _namePredicate(filterValue) {
            return Predicate.create('name', 'contains', filterValue);
        }
    }
})();