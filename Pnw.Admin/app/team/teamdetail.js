(function () {
    'use strict';

    var controllerId = 'teamdetail';

    angular.module('app').controller(controllerId,
        ['$location', '$routeParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'datacontext', teamdetail]);

    function teamdetail($location, $routeParams, $scope, $window, bsDialog, common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

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
            common.activateController([getRequestedTeam()], controllerId);
        }
        
        function cancel() {
            datacontext.cancel();
            if (vm.team.entityAspect.entityState.isDetached()) {
                gotoTeams();
            }
        }
        
        function gotoTeams() { $location.path('/teams'); }
        
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
        
        function deleteTeam() {
            return bsDialog.deleteDialog('Team')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.team);
                vm.save().then(success, failed);

                function success() { gotoTeams(); }

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

            return datacontext.team.getById(val)
                .then(function (data) {
                    vm.team = data;
                }, function (error) {
                    logError('Unable to get team ' + val);
                });
        }
        
        function goBack() { $window.history.back(); }
        
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
