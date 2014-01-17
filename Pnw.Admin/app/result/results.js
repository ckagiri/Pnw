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
            var promises = [datacontext.team.getAll(), getResults()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Results View'); });
        }

        function getResults() {
            return datacontext.result.getAll().then(function (data) {
                return vm.results = data;
            });
        }
    }
})();