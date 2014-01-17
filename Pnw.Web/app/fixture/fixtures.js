(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId,
        ['$location', '$routeParams', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($location, $routeParams, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Fixtures';
        vm.fixtures = [];
        vm.gotoFixture = gotoFixture;

        activate();

        function activate() {
            var promises = [datacontext.team.getPartials(), getFixtures()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Fixtures View'); });
        }

        function getFixtures() {
            return datacontext.fixture.getPartials().then(function(data) {
                return vm.fixtures = data;
            });
        }
        
        function gotoFixture(fixture) {
            if (fixture && fixture.id) {
                $location.path('/fixture/' + fixture.id);
            }
        }
    }
})();