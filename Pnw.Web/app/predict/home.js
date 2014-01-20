(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['$scope', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($scope, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.predictions = [];
        vm.title = 'Home';
        vm.isSubmitting = false;

        activate();

        function activate() {
            var promises = [getFixtures()];
            initLookups();
            onDestroy();
            onHasChanges();

            common.activateController(controllerId)
                .then(function () { log('Activated Home-prediction View'); });
        }
        
        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.leagues = lookups.leagues;
            vm.seasons = lookups.seasons;
        }
        
        function canSubmit() { return vm.hasChanges && !vm.isSubmitting; }
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }
        
        function getFixtures() {
            return datacontext.fixture.getAll().then(function (data) {
                return vm.fixtures = data;
            });
        }

        function getPredictions() {
            return datacontext.prediction.getAll().then(function (data) {
                return vm.predictions = data;
            });
        }
        
        function submit() {
            if (!canSubmit()) { return $q.when(null); } // Must return a promise

            vm.isSubmitting = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSubmitting = false;
            }, function (error) {
                vm.isSubmitting = false;
            });
        }
    }
})();