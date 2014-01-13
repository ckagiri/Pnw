(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['common', 'datacontext', fixtures]);

    function fixtures(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Fixtures';
        vm.fixtures = [];

        activate();

        function activate() {
            var promises = [datacontext.getTeamPartials(), getFixtures()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Fixtures View'); });
        }

        function getFixtures() {
            return datacontext.getFixturePartials().then(function(data) {
                return vm.fixtures = data;
            });
        }
    }
})();