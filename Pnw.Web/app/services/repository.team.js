(function () {
    'use strict';

    var serviceId = 'repository.team';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', RepositoryTeam]);

    function RepositoryTeam(model, AbstractRepository) {
        var entityName = model.entityNames.team;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            // Exposed data access functions
            this.create = create;
            this.getById = getById;
            this.getCount = getCount;
            this.getAll = getAll;
            this.getFilteredCount = getFilteredCount;
            this.getAllLocal = getAllLocal;
            this.getBySeason = getBySeason;
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
            if (self._areItemsLoaded()) {
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

            if (self._areItemsLoaded() && !forceRemote) {
                // Get the page of teams from local cache
                var teams = self._getAllLocal(entityName, orderBy);
                return self.$q.when(teams);
            }
            
            return EntityQuery.from('Teams')
               .select('id, name, code, tags, imageSource')
               .orderBy(orderBy)
               .toType(entityName)
               .using(self.manager).execute()
               .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self._setIsPartialTrue(data.results);
                self._areItemsLoaded(true);
                self.log('Retrieved [Team Partials] from remote data source', data.results.length, false);
                return data.results;
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
        
        function getAllLocal() {
            var self = this,
                predicate = null;
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function _namePredicate(filterValue) {
            return Predicate.create('name', 'contains', filterValue);
        }
        
        function getBySeason(season) {
            var self = this;

            return EntityQuery.from('Teams')
                .withParameters({ seasonId: season.id })
                .select('id, name, code, tags, imageSource')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var teams = data.results;
                self._setIsPartialTrue(teams);
                if (teams.length) {
                    season.isPartial = false;
                }
                self._areItemsLoaded(true);
                self.log('Retrieved [Team Partials] from remote data source', teams.length, false);
                return teams;
            }
        }
    }
})();