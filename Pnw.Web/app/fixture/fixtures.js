(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['$scope', 'bootstrappedData', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($scope, bootstrappedData, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var vm = this;
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var user = bootstrappedData.user;
        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.filteredFixtures = [];
        vm.predictions = [];
        vm.title = 'Home';
        vm.isSubmitting = false;
        vm.goalRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        vm.goals = null;
        vm.submitPredictions = submit;
        vm.predictionsToSubmit = [];
        vm.cancel = cancel;
        vm.homePredictionChanged = predictionChanged;
        vm.awayPredictionChanged = predictionChanged;
        vm.refresh = refresh;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 10
        };
        vm.pageChanged = pageChanged;
        
        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId)
                .then(console.log("Kagiri mambo bad!!"));
        }

        function init() {
            initLookups();
            getDefaults()
                .then(getFixtures())
                .then(getFilteredFixtures())
                .then(getPredictions())
                .then(addPredictionToFixture)
                .then(calculateTotalPoints);
        }

        function getDefaults() {
            vm.leagues.some(function (n) {
                if (n.id === defaultLeague.id) {
                    vm.selectedLeague = n;
                    return true;
                }
                return false;
            });
            vm.seasons.some(function (n) {
                if (n.id === defaultSeason.id) {
                    vm.selectedSeason = n;
                    return true;
                }
                return false;
            });
        }

        function logIt() {
            var sd = moment.utc(defaultSeason.startDate),
                ed = moment.utc(defaultSeason.endDate);

            var from = sd.clone().startOf('month'),
                end = ed.startOf('month').add('M', 1);

            var counter = 0, months = [];
            while (from.isBefore(end) && counter < 12) {
                months.push(from.format('MMMM'));
                from.add('M', 1);
                counter += 1;
            }
          
            console.log(months);
        }

        function refresh() {
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
            }
            $q.all([getFixtures(true), getPredictions(true)])
                .then(addPredictionToFixture);
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getFixtures();
        }

        function calculateTotalPoints() {
            var total = 0;
            vm.totalPoints = vm.predictions.reduce(function (sum, prediction) {
                sum += prediction.points;
                return sum;
            }, total);
        }

        function predictionChanged(f) {
            var homePrediction = f.prediction.homeGoals;
            var awayPrediction = f.prediction.awayGoals;
            var existing = null;
            var match = null;
            var validPrediction = common.isNumber(homePrediction) && common.isNumber(awayPrediction);
            if (user.isAuthenticated) {
                datacontext.prediction.getByUserAndFixtureId(user.id, f.id).then(function(data) {
                    existing = data;
                });
            }
            vm.predictions.some(function (p) {
                if (p.fixtureId === f.id) {
                    match = p;
                    return true;
                }
                return false;
            });
            if (validPrediction && match) {
                match.homeGoals = f.prediction.homeGoals;
                match.awayGoals = f.prediction.awayGoals;
            }
            if (validPrediction && !match) {
                var newOne = datacontext.prediction.create(user.id, f);
                vm.predictions.push(newOne);
            }
            if (!validPrediction && match) {
                var index = vm.predictions.indexOf(match);
                vm.predictions.splice(index, 1);
            }
            vm.predictionsToSubmit = vm.predictions.filter(function(p) {
                return p.entityAspect.entityState.isAdded() || p.entityAspect.entityState.isModified();
            });
            return false;
        }
        
        function cancel() {
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
                activate();
            }
        }

        function addPredictionToFixture() {
            vm.fixtures.forEach(function (f) {
                var match = vm.predictions.filter(function (p) {
                    return p.fixtureId === f.id;
                });
                var prediction = (match && match[0]) || { };
                f.prediction = prediction;
                f.prediction.homeGoals = prediction.homeGoals || null;
                f.prediction.awayGoals = prediction.awayGoals || null;
                f.prediction.points = prediction.points || null;
                if(!!prediction.isProcessed) {
                    f.prediction.isProcessed = true;
                } else {
                    if (f.prediction.isProcessed === false) {
                        f.prediction.isProcessed = false;
                    } else {
                        f.prediction.isProcessed = null;
                    }
                }
            });
            datacontext.clean();
        }
        
        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
            vm.leagues = lookups.leagues;
            vm.seasons = lookups.seasons;
        }
        
        function canSubmit() { return !vm.isSubmitting && vm.predictionsToSubmit.length; };
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }
        
        function getFixtures(forceRemote) {
            return datacontext.fixture.getAll(forceRemote)
                .then(function (data) {
                    vm.fixtures = data;
                });
        }

        function getFilteredFixtures() {
            var currentPage = vm.paging.currentPage,
                pageSize = vm.paging.pageSize;
            
            vm.filteredFixtures = vm.fixtures().slice(currentPage, currentPage + pageSize);
        }
        
        function getPredictions(forceRemote) {
            return datacontext.prediction.getAll(forceRemote).then(function (data) {
                return vm.predictions = data;
            });
        }
        
        function submit() {
            if(!user.isAuthenticated) {
                logError("You must be logged in to submit predictions");
                return $q.when(null);
            }
            if (!canSubmit()) { return $q.when(null); } 

            vm.isSubmitting = true;
            return datacontext.save().then(function (saveResult) {
                getPredictions().then(function () {
                    addPredictionToFixture();
                    vm.predictionsToSubmit = [];
                    vm.isSubmitting = false;
                });
                
            }, function (error) {
                getPredictions().then(function () {
                    addPredictionToFixture();
                    vm.predictionsToSubmit = [];
                    vm.isSubmitting = false;
                });
            });
        }
    }
})();