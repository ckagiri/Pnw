(function () {
    'use strict';

    var controllerId = 'editfixture';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', '$route', '$window', 'bootstrap.dialog',
            'common', 'config', 'datacontext', editfixture]);

    function editfixture($location, $scope, $routeParams, $route, $window, bsDialog,
            common, config, datacontext) {
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var season = null;
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
        vm.deleteFixture = deleteFixture;
        
        vm.matchStatuses = ['Scheduled', 'InProgress', 'Played', 'Cancelled', 'Abandoned', 'PostPoned'];
        
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

        function canSave() { return vm.hasChanges && !vm.isSaving; }

        function init() {
            var sId = $routeParams.seasonId;
            return datacontext.team.getAll()
                .then(function (){
                    datacontext.season.getById(sId)
                        .then(function (data) {
                            season = data;
                            datacontext.participation.getAll()
                                .then(function() {
                                    season.participationList.forEach(function(p) {
                                        vm.teams.push(p.team);
                                    });
                                });
                        });
                });
        }

        function getRequestedFixture() {
            var fId = $routeParams.fixtureId;
           
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
        
        function deleteFixture() {
            return bsDialog.deleteDialog('Fixture')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.fixture);
                vm.save().then(success, failed);

                function success() {
                    gotoFixtures();
                }

                function failed(error) {
                    cancel(); // Makes the entity available to edit again
                }
            }
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
