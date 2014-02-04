(function () {
    'use strict';

    var controllerId = 'addfixture';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$window',
            'common', 'config', 'datacontext', addfixture]);

    function addfixture($location, $scope, $routeParams, $window,
            common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        vm.season = null;
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
        vm.kickOff = new Date();
        vm.matchStatuses = ['Scheduled', 'InProgress', 'Played', 'Cancelled', 'Abandoned', 'PostPoned'];
        vm.homeTeamChanged = onHomeTeamChanged;

        activate();

        Object.defineProperty(vm, 'canSave', { get: canSave });

        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([init(), getRequestedFixture()], controllerId);
        }

        function cancel() {
            datacontext.cancel();
            if (vm.fixture.entityAspect.entityState.isDetached()) {
                gotoFixtures();
            }
        }

        function onHomeTeamChanged() {
            var homeGround = '';
            if (vm.fixture.homeTeam) {
                homeGround = angular.copy(vm.fixture.homeTeam.homeGround);
            }
            vm.fixture.venue = homeGround;
        }

        function canSave() { return vm.hasChanges && !vm.isSaving; }
        
        function init() {
            var sId = $routeParams.seasonId;
            return datacontext.team.getAll()
                .then(function () {
                    datacontext.season.getById(sId)
                        .then(function (data) {
                            vm.season = data;
                            datacontext.participation.getAll()
                                .then(function () {
                                    vm.season.participationList.forEach(function (p) {
                                        vm.teams.push(p.team);
                                    });
                                });
                        });
                });
        }

        function getRequestedFixture() {
           return vm.fixture = datacontext.fixture.create(); 
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
            vm.fixture.seasonId = vm.season.id;
            vm.fixture.leagueId = vm.season.leagueId;
            vm.fixture.kickOff = vm.kickOff;
            
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
                datacontext.fixture.calcIsScheduled();
            }, function (error) {
                vm.isSaving = false;
            });
        }
    }
})();
