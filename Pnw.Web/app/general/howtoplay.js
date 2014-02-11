(function () {
    'use strict';
    var controllerId = 'howtoplay';
    angular.module('app').controller(controllerId, ['common', howtoplay]);

    function howtoplay(common) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.title = 'HowToPlay';
        vm.goalRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        vm.goalsChanged = calculateScores;
        vm.teamAgoalsFinal = 0;
        vm.teamBgoalsFinal = 0;
        vm.teamAgoalsPrediction = 0;
        vm.teamBgoalsPrediction = 0;

        activate();

        function activate() {
            common.activateController([init()], controllerId)
                .then(function () { log('Activated HowToPlay View'); });
        }

        function init() {
            calculateScores();
        }

        function calculateScores() {
            vm.points = 0;
            vm.correctScorePoints = 0;
            vm.correctResultPoints = 0;
            vm.crossProductPoints = 0;
            vm.spreadDifference = 0;
            vm.accuracyDifference = 0;
            
            var correctScoreTeamA = vm.teamAgoalsPrediction === vm.teamAgoalsFinal;
            var correctScoreTeamB = vm.teamBgoalsPrediction === vm.teamBgoalsFinal;

            var correctResultTeamAWin = (vm.teamAgoalsFinal > vm.teamBgoalsFinal)
                && (vm.teamAgoalsPrediction > vm.teamBgoalsPrediction);
            var correctResultTeamBWin = (vm.teamBgoalsFinal > vm.teamAgoalsFinal)
                && (vm.teamBgoalsPrediction > vm.teamAgoalsPrediction);
            var correctResultDraw = (vm.teamAgoalsFinal === vm.teamBgoalsFinal)
                && (vm.teamAgoalsPrediction === vm.teamBgoalsPrediction);
            var correctResult = correctResultTeamAWin || correctResultTeamBWin || correctResultDraw;

            var spreadDiffPrediction = vm.teamAgoalsPrediction - vm.teamBgoalsPrediction;
            var spreadDiffMatch = vm.teamAgoalsFinal - vm.teamBgoalsFinal;
            var spreadDiff = -(Math.abs(spreadDiffPrediction - spreadDiffMatch));

            var accuracyDiffTeamA = Math.abs(vm.teamAgoalsFinal - vm.teamAgoalsPrediction);
            var accuracyDiffTeamB = Math.abs(vm.teamBgoalsFinal - vm.teamBgoalsPrediction);
            var accuracyDiff = -(accuracyDiffTeamA + accuracyDiffTeamB);

            if (correctScoreTeamA) {
                vm.correctScorePoints += 1;
            }
            if (correctScoreTeamB) {
                vm.correctScorePoints += 1;
            }
            if (correctScoreTeamA && correctScoreTeamB) {
                vm.correctScorePoints += 1;
            }
            if (correctResult) {
                vm.correctResultPoints = 3;
            }

            vm.points = vm.correctScorePoints + vm.correctResultPoints;
            vm.crossProductPoints = vm.correctScorePoints * vm.correctResultPoints;
            vm.spreadDifference = spreadDiff;
            vm.accuracyDifference = accuracyDiff;
        }
    }
})();