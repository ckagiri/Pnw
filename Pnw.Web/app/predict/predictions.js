(function () {
    'use strict';
    var controllerId = 'predictions';
    angular.module('app').controller(controllerId, ['$scope', 'bootstrappedData', 'cache', 'common', 'config', 'datacontext', predictions]);

    function predictions($scope, bootstrappedData, cache, common, config, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var defaultLeague = bootstrappedData.defaultLeague;
        var defaultSeason = bootstrappedData.defaultSeason;
        var currentDate = bootstrappedData.currentDate;
        var user = bootstrappedData.user;
        var stateKey = { filter: 'public.predictions.filter' };
        var vm = this;

        vm.leagues = [];
        vm.seasons = [];
        vm.fixtures = [];
        vm.predictions = [];
        vm.filteredPredictions = [];
        vm.predictionFilteredCount = 0;
        vm.months = [];
        vm.leagueChanged = onLeagueChanged;
        vm.refresh = refresh;
        vm.selectedLeague = undefined;
        vm.selectedSeason = undefined;
        vm.selectedMonth = undefined;
        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 5
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
                var val = vm.predictionCount / vm.paging.pageSize;
                var pageCount = Math.floor(val);
                if (!common.isNumber(val)) {
                    pageCount += 1;
                }
                return pageCount;
            }
        });
        vm.summary = undefined;
        vm.title = 'Predictions';
        vm.refresh = refresh;

        activate();

        function activate() {
            onDestroy();
            common.activateController([init()], controllerId);
        }
        
        function init() {
            initLookups()
                .then(getDefaults)
                .then(restoreFilter)
                .then(initMonthPager)
                .then(loadTeams)
                .then(getFixtures)
                .then(getPredictions)
                .then(summarize);
        }
        
        function restoreFilter() {
            var cached = cache.get(stateKey.filter);
            if (!cached) { return; }
            vm.selectedLeague = cached.selectedLeague;
            vm.selectedSeason = cached.selectedSeason;
        }

        function summarize() {
            var summary = {
                points: 0,
                correctScorePoints: 0,
                correctResultPoints: 0,
                crossProductPoints: 0,
                accuracyDifference: 0,
                spreadDifference: 0
            };
            vm.summary = vm.predictions.reduce(function(accum, prediction) {
                accum.points += prediction.points;
                accum.correctScorePoints += prediction.correctScorePoints;
                accum.correctResultPoints += prediction.correctResultPoints;
                accum.crossProductPoints += prediction.crossProductPoints;
                accum.accuracyDifference += prediction.accuracyDifference;
                accum.spreadDifference += prediction.spreadDifference;
                return accum;
            }, summary);
        }
        
        function onLeagueChanged() {
            if (!vm.isBusy) {
                vm.isBusy = true;
                vm.selectedSeason = vm.selectedLeague.seasons[0];
                $q.when(initMonthPager())
                    .then(loadTeams)
                    .then(getFixtures)
                    .then(getPredictions)
                    .then(summarize);
                vm.isBusy = false;
            }
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
            if (!vm.selectedLeague) { vm.selectedLeague = vm.leagues[0]; }
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
            getPredictions(false)
                .then(summarize)
                .then(vm.isBusy = false);
        }
        
        function pageChanged(page) {
            if (!page) { return; }
            vm.paging.currentPage = page;
            getPredictions(false);
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

        function refresh() {
            return $q.all([getFixtures(true), getPredictions(true)])
                .then(summarize);
        }

        function initLookups() {
            return $q.when(function () {
                var lookups = datacontext.lookup.lookupCachedData;
                vm.leagues = lookups.leagues;
                vm.seasons = lookups.seasons;
            }());
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                var predictionFilter = {
                    selectedLeague: vm.selectedLeague,
                    selectedSeason: vm.selectedSeason,
                };
                cache.put(stateKey.filter, predictionFilter);
            });
        }
        
        function loadTeams() {
            if (vm.selectedSeason.isPartial) {
                return datacontext.team.getBySeason(vm.selectedSeason);
            }
            return $q.when(false);
        }

        function getFixtures(forceRemote) {
            if (!vm.selectedSeason.isPartial) {
                return datacontext.fixture.getAll(forceRemote, vm.selectedSeason.id).then(function(data) {
                    vm.fixtures = data;
                });
            }
            vm.fixtures = [];
            return $q.when(false);
        }

        function getPredictions(forceRemote) {
            if (user.isAuthenticated) {
                if (!vm.selectedSeason.isPartial) {
                    return datacontext.prediction.getAll(forceRemote, user.id, vm.selectedSeason.id).then(function(data) {
                        vm.predictions = data.filter(function(p) {
                            return moment(p.fixtureDate).format('MMMM') === vm.selectedMonth;
                        });
                        vm.predictionCount = vm.predictions.length;
                        getFilteredPredictions();
                    });
                }
            }
            vm.predictions = [];
            return $q.when(false);
        }

        function getFilteredPredictions() {
            var xs = vm.predictions;
            var currentPage = vm.paging.currentPage,
                pageSize = vm.paging.pageSize;
            var start = (currentPage - 1) * pageSize;

            vm.filteredPredictions = xs.slice(start, start + pageSize);
            vm.predictionFilteredCount = vm.filteredPredictions.length;
        }
    }
})();