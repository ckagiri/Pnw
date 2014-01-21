(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['$scope', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($scope, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var $q = common.$q;
        var vm = this;
        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.predictions = [];
        vm.toSubmitCounter = 0;
        vm.title = 'Home';
        vm.isSubmitting = false;
        vm.goalRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        vm.goals = null;
        vm.submitPredictions = submit;
        vm.predictionsToSubmit = [];
        vm.cancel = cancel;
        vm.homePredictionChanged = predictionChanged;
        vm.awayPredictionChanged = predictionChanged;
        
        activate();

        function activate() {
            var promises = [getFixtures(), getPredictions()];
            initLookups();
            onDestroy();
            common.activateController(promises, controllerId)
                .then(addPredictionToFixture).then(console.log("hi"));
        }

        function predictionChanged(f) {
            var homePrediction = f.prediction.homeGoals;
            var awayPrediction = f.prediction.awayGoals;
            var existing = null;
            var match = null;
            var validPrediction = common.isNumber(homePrediction) && common.isNumber(awayPrediction);
            datacontext.prediction.getByUserAndFixtureId(3, f.id).then(function (data) {
                existing = data && data[0];
            });
            vm.predictions.some(function (p) {
                if (p.fixtureId === f.id) {
                    match = p;
                    return true;
                }
                return false;
            });
            if (validPrediction && match) {
                match.homeGoals = f.prediction.homeGoals;
                match.awayGoals = f.prediction.awayGoals;
            }
            if (validPrediction && !match) {
                var newOne = datacontext.prediction.create(3, f);
                vm.predictions.push(newOne);
            }
            if (!validPrediction && match) {
                var index = vm.predictions.indexOf(match);
                vm.predictions.splice(index, 1);
            }
            vm.predictionsToSubmit = vm.predictions.filter(function(p) {
                return p.entityAspect.entityState.isAdded() || p.entityAspect.entityState.isModified();
            });
            return false;
        }
        
        function cancel() {
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
                activate();
            }
        }

        function addPredictionToFixture() {
            vm.fixtures.forEach(function (f) {
                var match = vm.predictions.filter(function (p) {
                    return p.fixtureId === f.id;
                });
                var prediction = (match && match[0]) || { };
                f.prediction = prediction;
                f.prediction.homeGoals = prediction.homeGoals || null;
                f.prediction.awayGoals = prediction.awayGoals || null;
                f.prediction.points = prediction.points || null;
                if(!!prediction.isProcessed) {
                    f.prediction.isProcessed = true;
                } else {
                    if (f.prediction.isProcessed === false) {
                        f.prediction.isProcessed = false;
                    } else {
                        f.prediction.isProcessed = null;
                    }
                }
            });
            datacontext.clean();
        }
        
        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.leagues = lookups.leagues;
            vm.seasons = lookups.seasons;
        }
        
        function canSubmit() { return !vm.isSubmitting && vm.predictionsToSubmit.length; };
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }
        
        function getFixtures() {
            return datacontext.fixture.getAll().then(function (data) {
                vm.fixtures = data;
            });
        }

        function getPredictions() {
            return datacontext.prediction.getAll().then(function (data) {
                return vm.predictions = data;
            });
        }
        
        function submit() {
            if (!canSubmit()) { return $q.when(null); } 

            vm.isSubmitting = true;
            return datacontext.save().then(function (saveResult) {
                getPredictions().then(function () {
                    addPredictionToFixture();
                    vm.predictionsToSubmit = [];
                    vm.isSubmitting = false;
                });
                
            }, function (error) {
                getPredictions().then(function () {
                    addPredictionToFixture();
                    vm.predictionsToSubmit = [];
                    vm.isSubmitting = false;
                });
            });
        }
    }
})();