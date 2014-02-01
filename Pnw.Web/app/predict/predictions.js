(function () {
    'use strict';
    var controllerId = 'predictions';
    angular.module('app').controller(controllerId, ['$scope', 'bootstrappedData', 'common', 'config', 'datacontext', predictions]);

    function predictions($scope, bootstrappedData, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var vm = this;
        var defaultSeason = bootstrappedData.defaultSeason;
        var user = bootstrappedData.user;
        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.predictions = [];
        vm.summary = undefined;
        vm.title = 'predictions';
        vm.refresh = refresh;

        activate();

        function activate() {
            var promises = [getFixtures(), getPredictions()];
            initLookups();
            onDestroy();
            common.activateController(promises, controllerId).then(summarize).then(console.log("hi"));
        }

        function summarize() {
            var summary = {
                points: 0,
                correctScorePoints: 0,
                correctResultPoints: 0,
                crossProductPoints: 0,
                accuracyDifference: 0,
                spreadDifference: 0
            };
            vm.summary = vm.predictions.reduce(function(accum, prediction) {
                accum.points += prediction.points;
                accum.correctScorePoints += prediction.correctScorePoints;
                accum.correctResultPoints += prediction.correctResultPoints;
                accum.crossProductPoints += prediction.crossProductPoints;
                accum.accuracyDifference += prediction.accuracyDifference;
                accum.spreadDifference += prediction.spreadDifference;
                return accum;
            }, summary);
        }

        function refresh() {
            return $q.all([getFixtures(true), getPredictions(true)]);
        }

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.leagues = lookups.leagues;
            vm.seasons = lookups.seasons;
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
            });
        }

        function getFixtures(forceRemote) {
            return datacontext.fixture.getAll(forceRemote).then(function (data) {
                vm.fixtures = data;
            });
        }

        function getPredictions(forceRemote) {
            return datacontext.prediction.getAll(forceRemote).then(function (data) {
                return vm.predictions = data;
            });
        }
    }
})();