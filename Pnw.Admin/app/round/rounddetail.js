(function () {
    'use strict';

    var controllerId = 'rounddetail';

    angular.module('app').controller(controllerId,
        ['$location', '$route', '$routeParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', rounddetail]);

    function rounddetail($location, $route, $routeParams, $scope, $window, bsDialog, common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        vm.cancel = cancel;
        vm.deleteRound = deleteRound;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.round = undefined;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.leagueSeason = undefined;

        // datepickers
        vm.open1 = open1;
        vm.opened1 = false;
        vm.open2 = open2;
        vm.opened2 = false;

        Object.defineProperty(vm, 'canSave', { get: canSave });

        activate();

        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([init()], controllerId);
        }

        function init() {
            getRequestedSeasonRound()
                .then(getSelectedSeason)
                .then(getSelectedLeague)
                .then(setLeagueSeason);
        }

        function cancel() {
            datacontext.cancel();
            if (vm.round.entityAspect.entityState.isDetached()) {
                gotoSeasonRounds();
            }
        }

        function gotoSeasonRounds() { $location.path('/seasonrounds'); }

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

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function deleteRound() {
            return bsDialog.deleteDialog('Round')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.round);
                vm.save().then(success, failed);

                function success() {
                    gotoSeasonRounds();
                }

                function failed(error) {
                    cancel();
                }
            }
        }

        function getSelectedLeague() {
            var val;
            if (vm.selectedSeason.leagueId !== 0) {
                val = vm.selectedSeason.leagueId;
            } else {
                val = parseInt($route.current.params.leagueId, 10);
            }
            return datacontext.league.getById(val)
                .then(function(data) {
                    vm.selectedLeague = data.entity || data;
                }, function(error) {
                    logError('Unable to get league' + val);
                });
        }

        function getSelectedSeason() {
            var val;
            if (vm.round.seasonId !== 0) {
                val = vm.round.seasonId;
            } else {
                val = parseInt($route.current.params.seasonId, 10);
            }
            return datacontext.season.getById(val)
                .then(function(data) {
                    vm.selectedSeason = data.entity || data;
                }, function(error) {
                    logError('Unable to get season' + val);
                });
        }

        function getRequestedSeasonRound() {
            var val = $routeParams.id;
            if (val === 'new') {
                var seasonId = parseInt($route.current.params.seasonId, 10);
                vm.round = datacontext.round.create(seasonId);
                vm.round.startDate = new Date();
                vm.round.endDate = new Date();
                return $q.when(vm.round);
            }

            return datacontext.round.getById(val)
                .then(function (data) {
                    vm.round = data.entity || data;
                }, function (error) {
                    logError('Unable to get season-round ' + val);
                });
        }
        
        function setLeagueSeason() {
            if (vm.selectedLeague && vm.selectedSeason) {
                vm.leagueSeason = vm.selectedLeague.name + ' ' + vm.selectedSeason.name;
            }
        }

        function goBack() { $window.history.back(); }

        function save() {
            if (!canSave()) { return $q.when(null); }

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
                gotoSeasonRounds();
            }, function (error) {
                vm.isSaving = false;
            });
        }

        function open1($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.opened1 = true;
            vm.opened2 = false;
        }

        function open2($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.opened2 = true;
            vm.opened1 = false;
        }
    }
})();
