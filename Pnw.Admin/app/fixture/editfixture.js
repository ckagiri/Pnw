(function () {
    'use strict';

    var controllerId = 'editfixture';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$route', '$window',
            'common', 'config', 'datacontext', editfixture]);

    function editfixture($location, $scope, $routeParams, $route, $window,
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
        //vm.matchStatuses = [
        //    {key: '0', value: 'Scheduled'},
        //    {key: '1', value: 'InProgress'},
        //    {key: '2', value: 'Played'},
        //    {key: '3', value: 'Cancelled'},
        //    {key: '4', value: 'Abandoned'},
        //    {key: '5', value: 'PostPoned'}
        //];
        
        vm.matchStatuses = ['Scheduled', 'InProgress', 'Played', 'Cancelled', 'Abandoned', 'PostPoned'];
        
        activate();

        Object.defineProperty(vm, 'canSave', { get: canSave });

        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([loadTeams(), getRequestedFixture()], controllerId);
        }

        function cancel() {
            datacontext.cancel();
            if (vm.fixture.entityAspect.entityState.isDetached()) {
                gotoFixtures();
            }
        }

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function loadTeams () {
            datacontext.team.getAll(false, 1, 25).then(function(data) {
                vm.teams = data;
            });
        }

        function getRequestedFixture() {
            var fId = $routeParams.fixtureId;
            var sId = $routeParams.seasonid;

            return datacontext.fixture.getById(fId)
                .then(function (data) {
                    vm.fixture = data;
                }, function (error) {
                    logError('Unable to get fixture ' + fId);
                });
        }

        function goBack() { $window.history.back(); }
        
        function gotoFixtures() { $location.path('/fixtures'); }

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
                datacontext.fixture.calcIsScheduled();
            }, function (error) {
                vm.isSaving = false;
            });
        }
    }
})();
