(function () {
    'use strict';

    var controllerId = 'teamdetail';

    angular.module('app').controller(controllerId,
        ['$routeParams', '$scope', '$window',
            'common', 'config', 'datacontext', teamdetail]);

    function teamdetail($routeParams, $scope, $window, common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;

        vm.cancel = cancel;
        vm.getTitle = getTitle;
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
        
        function cancel() { datacontext.cancel(); }
        
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
        
        function getRequestedTeam() {
            var val = $routeParams.id;

            return datacontext.team.getById(val)
                .then(function (data) {
                    vm.team = data;
                }, function (error) {
                    logError('Unable to get team ' + val);
                });
        }
        
        function getTitle() {
            return 'Edit ' + ((vm.team && vm.team.name) || 'New Team');
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
