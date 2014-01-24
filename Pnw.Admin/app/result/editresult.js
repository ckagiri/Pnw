(function () {
    'use strict';

    var controllerId = 'editresult';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$window',
            'common', 'config', 'datacontext', editresult]);

    function editresult($location, $scope, $routeParams, $window,
            common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        vm.cancel = cancel;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.fixture = undefined;
        vm.league = undefined;
        vm.leagues = [];
        vm.seasons = [];
        vm.teams = [];
        vm.matchStatuses = ['InProgress', 'Played', 'Cancelled', 'Abandoned', 'PostPoned'];
        
        activate();

        Object.defineProperty(vm, 'canSave', { get: canSave });

        function activate() {
            initLookups();
            onDestroy();
            onHasChanges();
            common.activateController([datacontext.team.getAll(), getRequestedFixture()], controllerId);
        }

        function cancel() {
            datacontext.cancel();
            if (vm.fixture.entityAspect.entityState.isDetached()) {
                gotoFixtures();
            }
        }

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function getRequestedFixture() {
            var val = $routeParams.id;

            return datacontext.fixture.getById(val)
                .then(function (data) {
                    vm.fixture = data;
                }, function (error) {
                    logError('Unable to get fixture ' + val);
                });
        }

        function goBack() { $window.history.back(); }
        
        function gotoFixtures() { $location.path('/fixtures'); }

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.leagues = lookups.leagues;
            vm.seasons = lookups.seasons;
            vm.teams = datacontext.team.getAllLocal();
        }

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

        function save() {
            if (!canSave()) { return $q.when(null); } // Must return a promise

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
            }, function (error) {
                vm.isSaving = false;
            });
        }
    }
})();
