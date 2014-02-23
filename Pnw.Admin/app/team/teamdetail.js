(function () {
    'use strict';

    var controllerId = 'teamdetail';

    angular.module('app').controller(controllerId,
        ['$location', '$routeParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', 'helper', 'model', teamdetail]);

    function teamdetail($location, $routeParams, $scope, $window, bsDialog, common, config, datacontext, helper, model) {
        var vm = this;
        var entityName = model.entityNames.team;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var wipEntityKey = undefined;

        vm.cancel = cancel;
        vm.deleteTeam = deleteTeam;
        vm.goBack = goBack;
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.team = undefined;
      
        Object.defineProperty(vm, 'canSave', { get: canSave });
        
        activate();
        
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedTeam()], controllerId)
                .then(onEveryChange);
        }
        
        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }
        
        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            helper.replaceLocationUrlGuidWithId(vm.team.id);

            if (vm.team.entityAspect.entityState.isDetached()) {
                gotoTeams();
            }
        }
        
        function gotoTeams() { $location.path('/teams'); }
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                autoStoreWip();
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
        
        function deleteTeam() {
            return bsDialog.deleteDialog('Team')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.team);
                vm.save().then(success, failed);

                function success() {
                    removeWipEntity();
                    gotoTeams();
                }

                function failed(error) {
                    cancel(); // Makes the entity available to edit again
                }
            }
        }
        
        function getRequestedTeam() {
            var val = $routeParams.id;
            if (val === 'new') {
                 return vm.team = datacontext.team.create();
            }

            return datacontext.team.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    // Will either get back an entity or an {entity:, key:}
                    wipEntityKey = data.key;
                    vm.team = data.entity || data;
                }, function (error) {
                    logError('Unable to get team from wip' + val);
                });
        }
        
        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) {
                    autoStoreWip();
                });
        }
        
        function goBack() { $window.history.back(); }
        
        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        
        function save() {
            if (!canSave()) { return $q.when(null); } // Must return a promise

            vm.isSaving = true;
            return datacontext.save().then(function (saveResult) {
                vm.isSaving = false;
                removeWipEntity();
                helper.replaceLocationUrlGuidWithId(vm.team.id);
                gotoTeams();
            }, function (error) {
                vm.isSaving = false;
            });
        }
        
        function storeWipEntity() {
            if (!vm.team) return;
            var description = vm.team.name || '[New team]' + vm.team.id;
            wipEntityKey = datacontext.zStorageWip.storeWipEntity(vm.team, wipEntityKey, entityName, description);
        }
    }
})();
