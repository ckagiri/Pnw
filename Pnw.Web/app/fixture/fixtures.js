(function () {
    'use strict';
    var controllerId = 'fixtures';
    angular.module('app').controller(controllerId, ['$scope', 'bootstrappedData','cache', 'common', 'config', 'datacontext', fixtures]);

    function fixtures($scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate;
        var user = bootstrappedData.user;
        var stateKey = { filter: 'public.fixtures.filter' };
        var vm = this;

        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.filteredFixtures = [];
        vm.predictions = [];
        vm.months = [];
        vm.title = 'Home';
        vm.isSubmitting = false;
        vm.goalRange = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        vm.goals = null;
        vm.submitPredictions = submit;
        vm.predictionsToSubmit = [];
        vm.cancel = cancel;
        vm.leagueChanged = onLeagueChanged;
        vm.homePredictionChanged = predictionChanged;
        vm.awayPredictionChanged = predictionChanged;
        vm.refresh = refresh;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.totalPoints = 0;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 10
        };
        vm.pageChanged = pageChanged;
        vm.monthPager = {
            index: 0,
            maxIndex: 1,
            prev: prev,
            next: next
        };
        vm.isBusy = false;
        
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                var val = vm.fixtureCount / vm.paging.pageSize;
                var pageCount = Math.floor(val);
                if (!common.isNumber(val)) {
                    pageCount += 1;
                }
                return pageCount;
            }
        });
        
        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId)
                .then(console.log("Kagiri mambo bad!!"));
        }

        function init() {
            initLookups()
                .then(getDefaults)
                .then(restoreFilter)
                .then(initMonthPager)
                .then(getFixtures)
                .then(getPredictions)
                .then(calculateTotalPoints)
                .then(addPredictionToFixture);
        }

        function initMonthPager() {
            vm.selectedMonth = moment.utc(currentDate).format('MMMM');

            var sd = moment.utc(vm.selectedSeason.startDate),
               ed = moment.utc(vm.selectedSeason.endDate);

            var from = sd.clone().startOf('month'),
                end = ed.startOf('month').add('M', 1);

            var counter = 0;
            vm.months = [];
            while (from.isBefore(end) && counter < 12) {
                vm.months.push(from.format('MMMM'));
                from.add('M', 1);
                counter += 1;
            }

            var ix = vm.months.indexOf(vm.selectedMonth);
            if (ix < 0) {
                vm.selectedMonth = moment.utc(ed).format('MMMM');
                ix = vm.months.indexOf(vm.selectedMonth);
            }
            vm.monthPager.index = ix;
            vm.monthPager.maxIndex = vm.months.length - 1;
        }

        function prev() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.monthPager.index -= 1;
                gotoMonthIndex();
            }
        }

        function next() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.monthPager.index += 1;
                gotoMonthIndex();
            }
        }

        function gotoMonthIndex() {
                var i = vm.monthPager.index;
                vm.selectedMonth = vm.months[i];
                getFixtures()
                    .then(calculateTotalPoints)
                    .then(addPredictionToFixture)
                    .then(vm.isBusy = false);
        }

        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
        }

        function onLeagueChanged() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.selectedSeason = vm.selectedLeague.seasons[0];
                $q.when(initMonthPager())
                    .then(getFixtures)
                    .then(getPredictions)
                    .then(calculateTotalPoints)
                    .then(addPredictionToFixture);
                vm.isBusy = false;
            }
        }
        
        function getDefaults() {
            vm.leagues.some(function(n) {
                if (n.id === defaultLeague.id) {
                    vm.selectedLeague = n;
                    return true;
                }
                return false;
            });
            vm.seasons.some(function(n) {
                if (n.id === defaultSeason.id) {
                    vm.selectedSeason = n;
                    return true;
                }
                return false;
            });
            vm.selectedMonth = moment.utc(currentDate).format('MMMM');
        }

        function refresh() {
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
            }
            $q.all([getFixtures(true), getPredictions(true)])
                .then(calculateTotalPoints)
                .then(addPredictionToFixture);
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getFixtures().then(addPredictionToFixture);
        }

        function calculateTotalPoints() {
            var total = vm.predictions.filter(function (p) {
                return moment(p.fixtureDate).format('MMMM') === vm.selectedMonth;
            }).reduce(function (sum, prediction) {
                sum += prediction.points;
                return sum;
            }, 0);

            vm.totalPoints = total;
        }

        function predictionChanged(f) {
            var homePrediction = f.prediction.homeGoals;
            var awayPrediction = f.prediction.awayGoals;
            var match = null;
            var validPrediction = common.isNumber(homePrediction) && common.isNumber(awayPrediction);
            vm.predictions.some(function (p) {
                if (p.fixtureId === f.id) {
                    match = p;
                    return true;
                }
                return false;
            });
            if (validPrediction && match) {
                // a hack to force evaluation
                match.homeGoals = f.prediction.homeGoals + 1;
                match.homeGoals -= 1;
                match.awayGoals = f.prediction.awayGoals + 1; 
                match.awayGoals -= 1;
                
                var origHomeGoals = match.entityAspect.originalValues.homeGoals,
                    origAwayGoals = match.entityAspect.originalValues.awayGoals,
                    setToUnchanged = false;
                
                if (origHomeGoals === f.prediction.homeGoals &&
                    origAwayGoals === f.prediction.awayGoals) {
                    setToUnchanged = true;
                }
                
                if (setToUnchanged) {
                    match.entityAspect.entityState = breeze.EntityState.Unchanged;
                } else {
                    if (!match.entityAspect.entityState.isAdded()) {
                        match.entityAspect.entityState = breeze.EntityState.Modified;
                    }
                }
            }
            if (validPrediction && !match) {
                var newOne = datacontext.prediction.create(user.id, f);
                vm.predictions.push(newOne);
            }
            if (!validPrediction && match) {
                if (match.entityAspect.entityState.isAdded()) {
                    match.entityAspect.setDeleted();
                } else {
                    if (match.entityAspect.entityState.isModified()) {
                        match.homeGoals = match.entityAspect.originalValues.homeGoals;
                        match.awayGoals = match.entityAspect.originalValues.awayGoals;
                    }
                    match.entityAspect.entityState = breeze.EntityState.Unchanged;
                }
            }
            vm.predictionsToSubmit = vm.predictions.filter(function(p) {
                return p.entityAspect.entityState.isAdded() || p.entityAspect.entityState.isModified();
            });
            return false;
        }
        
        function cancel() {
            datacontext.cancel();
            if (vm.predictionsToSubmit.length) {
                vm.predictionsToSubmit = [];
                getPredictions().then(addPredictionToFixture);
            }
        }

        function addPredictionToFixture() {
            vm.filteredFixtures.forEach(function (f) {
                var match = vm.predictions.filter(function (p) {
                    return p.fixtureId === f.id;
                });
                var prediction = match && match[0];
                f.prediction = {};
                if (prediction) {
                    f.prediction.homeGoals = prediction.homeGoals == 0 ? 0 : prediction.homeGoals;
                    f.prediction.awayGoals = prediction.awayGoals == 0 ? 0 : prediction.awayGoals;
                    f.prediction.points = prediction.points === 0 ? 0 : prediction.points;
                    f.prediction.isProcessed = prediction.isProcessed;
                }
                else {
                    f.prediction.homeGoals = null;
                    f.prediction.awayGoals = null;
                    f.prediction.points = null;
                    f.prediction.isProcessed = null;
                }
            });
        }
        
        function initLookups() {
            return $q.when(function() {
                var lookups = datacontext.lookup.lookupCachedData;
                vm.leagues = lookups.leagues;
                vm.seasons = lookups.seasons;
            }());
        }
        
        function canSubmit() { return !vm.isSubmitting && vm.predictionsToSubmit.length; };
        
        function onDestroy() {
            $scope.$on('$destroy', function () {
                var fixtureFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, fixtureFilter);
                datacontext.cancel();
            });
        }
        
        function getFixtures(forceRemote) {
            return datacontext.fixture.getAll(forceRemote, vm.selectedSeason.id)
                .then(function (data) {
                    vm.fixtures = data.filter(function (f) {
                        return moment(f.kickOff).format('MMMM') === vm.selectedMonth;
                    });
                    vm.fixtureCount = vm.fixtures.length;
                    getFilteredFixtures();
                });
        }

        function getFilteredFixtures() {
            var xs = vm.fixtures;
            var currentPage = vm.paging.currentPage,
                pageSize = vm.paging.pageSize;
            var start = (currentPage - 1) * pageSize;
            
            vm.filteredFixtures = xs.slice(start, start + pageSize);
            vm.fixtureFilteredCount = vm.filteredFixtures.length;
        }
        
        function getPredictions(forceRemote) {
            if (user.isAuthenticated) {
                return datacontext.prediction.getAll(forceRemote, user.id, vm.selectedSeason.id).then(function (data) {
                    return vm.predictions = data;
                });
            } else {
                return $q.when([]);
            }
        }
        
        function submit() {
            if(!user.isAuthenticated) {
                logError("You must be logged in to submit predictions");
                return $q.when(null);
            }
            if (!canSubmit()) { return $q.when(null); } 

            vm.isSubmitting = true;
            return datacontext.save().then(function (saveResult) {
                getPredictions().then(function() {
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