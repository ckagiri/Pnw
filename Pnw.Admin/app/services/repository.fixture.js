(function () {
    'use strict';

    var serviceId = 'repository.fixture';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryFixture]);

    function RepositoryFixture(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.fixture;
        var EntityQuery = breeze.EntityQuery;
        var orderBy = 'kickOff, homeTeam.name';
        var Predicate = breeze.Predicate;

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            // Exposed data access functions
            this.create = create;
            this.getById = getById;
            this.getAll = getAll;
            this.calcIsScheduled = calcIsScheduled;
            this.getAllLocal = getAllLocal;
            this.getCount = getCount;
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
            var predicate = Predicate.create('isScheduled', '==', true);
            return self._getAllLocal(entityName, orderBy, predicate);
        }

        function getAll(forceRemote, seasonId, page, size, nameFilter) {
            var self = this;
            var take = size || 20;
            var skip = page ? (page - 1) * size : 0;
            var predicate = breeze.Predicate.create('isScheduled', '==', true);
            var orderBy = 'kickOff, homeTeam.name';
            var fixtures = [];

            if (self.zStorage.areItemsLoaded('fixtures') && !forceRemote) {
                return self.$q.when(getByPage());
            }

            return EntityQuery.from('Fixtures')
                .select('id, seasonId, leagueId, kickOff, homeTeamId, awayTeamId, matchStatus, venue, canPredict')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                fixtures = data.results;
                for (var i = fixtures.length; i--;) {
                    fixtures[i].isScheduled = true;
                }
                self.zStorage.areItemsLoaded('fixtures', true);
                self.zStorage.save();
                self.log('Retrieved [Fixture Partials] from remote data source', fixtures.length, true);
                return getByPage();
            }
            
            function getByPage() {
                predicate = predicate.and('seasonId', '==', seasonId);

                if (nameFilter) {
                    var namePredicate = breeze.Predicate.create('homeTeam.name', 'contains', nameFilter)
                        .or('homeTeam.code', 'contains', nameFilter)
                        .or('awayTeam.name', 'contains', nameFilter)
                        .or('awayTeam.code', 'contains', nameFilter);
                    predicate = predicate.and(namePredicate);
                }

                fixtures = EntityQuery.from(entityName)
                    .where(predicate)
                    .orderBy(orderBy)
                    .take(take).skip(skip)
                    .using(self.manager)
                    .executeLocally();

                return fixtures;
            }
        }
        
        function calcIsScheduled() {
            var self = this;
            var fixtures = self.manager.getEntities(model.entityNames.fixture);
            fixtures.forEach(function (f) { f.isScheduled = (f.matchStatus === "Scheduled"); });
            self.zStorage.save();
        }

        function getCount(seasonId, nameFilter) {
            var predicate = breeze.Predicate.create('isScheduled', '==', true).and('seasonId', '==', seasonId);

            if (nameFilter) {
                var namePredicate = breeze.Predicate.create('homeTeam.name', 'contains', nameFilter)
                        .or('homeTeam.code', 'contains', nameFilter)
                        .or('awayTeam.name', 'contains', nameFilter)
                        .or('awayTeam.code', 'contains', nameFilter);
                predicate = predicate.and(namePredicate);
            }

            var xs = EntityQuery.from(entityName)
                .where(predicate)
                .using(this.manager)
                .executeLocally();

            return this.$q.when(xs.length);
        }
    }
})();