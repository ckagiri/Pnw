(function () {
    'use strict';
    var controllerId = 'results';
    angular.module('app').controller(controllerId, ['common', 'datacontext', results]);

    function results(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'Results';
        vm.results = [];

        activate();

        function activate() {
            common.activateController([getResults()], controllerId)
                .then(function () { log('Activated Fixtures View'); });
        }

        function getResults() {
            return datacontext.getResultPartials().then(function (data) {
                return vm.results = data;
            });
        }
    }
})();