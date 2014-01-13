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
            this.getById = getById;
            this.getCount = getCount;
            this.getPartials = getPartials;
            this.getFilteredCount = getFilteredCount;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
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

        function getPartials(forceRemote, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;

            if (self._areItemsLoaded() && !forceRemote) {
                // Get the page of teams from local cache
                return self.$q.when(getByPage());
            }
        
            return EntityQuery.from('Teams')
               .select('id, name, code, tags')
               .orderBy(orderBy)
               .toType(entityName)
               .using(self.manager).execute()
               .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self._setIsPartialTrue(data.results);
                self._areItemsLoaded(true);
                self.log('Retrieved [Team Partials] from remote data source', data.results.length, true);
                self._areItemsLoaded(true);
                return getByPage();
            }
            
            function getByPage() {
                var predicate = null;

                if (nameFilter) {
                    predicate = _namePredicate(nameFilter);
                }

                var teams = EntityQuery.from(entityName)
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return teams;
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

        function _namePredicate(filterValue) {
            return Predicate.create('name', 'contains', filterValue);
        }
    }
})();