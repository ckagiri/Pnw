(function () {
    'use strict';

    var serviceId = 'repository.prediction';
    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', RepositoryPrediction]);

    function RepositoryPrediction(model, AbstractRepository, zStorage) {
        var entityName = model.entityNames.prediction;
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
            this.getByUserAndFixtureId = getByUserAndFixtureId;
            this.getAllLocal = getAllLocal;
            //this.getTopLocal = getTopLocal;
            this.getAll = getAll;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;
        
        function create(userId, fixture) {
            var values = {
                id: breeze.core.getUuid(),
                userId: userId,
                fixtureId: fixture.id,
                fixtureDate: fixture.kickOff,
                seasonId: fixture.seasonId,
                leagueId: fixture.leagueId,
                homeGoals: fixture.prediction.homeGoals,
                awayGoals: fixture.prediction.awayGoals,
            };
            return this.manager.createEntity(entityName, values);
        }
        
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }

        function getAllLocal() {
            var self = this;
            return self._getAllLocal(entityName, orderBy);
        }
        
        function getByUserAndFixtureId(userId, fixtureId) {
            var self = this;
            var predicate = breeze.Predicate.create('userId', '==', userId)
                .and('fixtureId', '==', fixtureId);
            var xs = EntityQuery.from(entityName)
                    .where(predicate)
                    .using(self.manager)
                    .executeLocally();
            var prediction = xs && xs[0];
            if (prediction) {
                var id = prediction.id;
                return self._getById(entityName, id);
            } else
                return self.$q.when(false);
        }

        function getAll(forceRemote, userId, seasonId) {
            var self = this;
            var orderBy = 'fixtureDate, points';
            var predictions = [];
            var predicate = breeze.Predicate.create('userId', '==', userId).and('seasonId','==', seasonId);

            if (self.zStorage.areItemsLoaded('predictions') && !forceRemote) {
                predictions = self._getAllLocal(entityName, orderBy, predicate);
                // passing an explicit false means you know what you're doing
                if (predictions.length || forceRemote === false) {
                    return self.$q.when(predictions);
                }
            }

            return EntityQuery.from('Predictions')
                //.select('id, userId, seasonId, fixtureId, homeGoals, awayGoals, points, fixtureDate, isProcessed')
                .withParameters({ userId: userId, seasonId: seasonId })
                .where(predicate)
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                predictions = data.results;
                self.zStorage.areItemsLoaded('predictions', true);
                self.zStorage.save();
                self.log('Retrieved [Prediction Partials] from remote data source', predictions.length, true);
                return predictions;
            }
        }
    }
})();