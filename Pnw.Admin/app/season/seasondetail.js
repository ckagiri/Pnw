(function () {
    'use strict';

    var controllerId = 'seasondetail';

    angular.module('app').controller(controllerId,
        ['$location', '$route', '$routeParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', seasondetail]);

    function seasondetail($location, $route, $routeParams, $scope, $window, bsDialog, common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        vm.cancel = cancel;
        vm.deleteSeason = deleteSeason;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.season = undefined;
        vm.selectedLeague = undefined;
      
        Object.defineProperty(vm, 'canSave', { get: canSave });
        
        activate();
        
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([init()], controllerId);
        }
        
        function init() {
            getRequestedSeason().then(getSelectedLeague);
        }
       
        function cancel() {
            datacontext.cancel();
            if (vm.season.entityAspect.entityState.isDetached()) {
                gotoSeasons();
            }
        }
        
        function gotoSeasons() { $location.path('/seasons'); }
        
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
        
        function deleteSeason() {
            return bsDialog.deleteDialog('Season')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.season);
                vm.save().then(success, failed);

                function success() {
                    gotoSeasons();
                }

                function failed(error) {
                    cancel(); 
                }
            }
        }

        function getSelectedLeague() {
            var val;
            if (vm.season.leagueId !== 0) {
                val = vm.season.leagueId;
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
        
        function getRequestedSeason() {
            var val = $routeParams.id;
            if (val === 'new') {
                var leagueId = parseInt($route.current.params.leagueId, 10);
                return $q.when(vm.season = datacontext.season.create(leagueId));
            }

            return datacontext.season.getById(val)
                .then(function (data) {
                    vm.season = data.entity || data;
                }, function (error) {
                    logError('Unable to get season' + val);
                });
        }
       
        function goBack() { $window.history.back(); }
       
        function save() {
            if (!canSave()) { return $q.when(null); } 

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
            }, function (error) {
                vm.isSaving = false;
            });
        }
    }
})();
