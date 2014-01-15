(function () {
    'use strict';

    // Factory name is handy for logging
    var serviceId = 'model';

    // Define the factory on the module.
    // Inject the dependencies. 
    // Point to the factory definition function.
    angular.module('app').factory(serviceId, model);

    function model() {
        // Define the functions and properties to reveal.
        var entityNames = {
            fixture: 'Fixture',
            result: 'Fixture',
            league: 'League',
            season: 'Season',
            team: 'Team'
        };

        var service = {
            configureMetadataStore: configureMetadataStore,
            entityNames: entityNames
        };

        return service;

        function configureMetadataStore(metadataStore) {
            registerSeason(metadataStore);
            registerFixture(metadataStore);
            registerTeam(metadataStore);
        }

        //#region Internal Methods        
        
        function registerFixture(metadataStore) {
            metadataStore.registerEntityTypeCtor('Fixture', Fixture);

            function Fixture() {
                this.isScheduled = false;
                this.isPartial = false;
            }

            Object.defineProperty(Fixture.prototype, 'kickOffFormatted', {
                get: function () {
                    var kickOff = this.kickOff;
                    var value = moment.utc(kickOff).format('ddd hh:mm a');
                    return value;
                }
            });
            
            Object.defineProperty(Fixture.prototype, 'title', {
                get: function () {
                    var hName = this.homeTeam.name;
                    var aName = this.awayTeam.name;
                    var value = hName + ' v ' + aName;
                    return value;
                }
            });
            
            Object.defineProperty(Fixture.prototype, 'score', {
                get: function () {
                    var homeScore = this.homeScore;
                    var awayScore = this.awayScore;
                    var value = homeScore + ' - ' + awayScore;
                    if (this.matchStatus === 1) { value += '*'; }
                    return value;
                }
            });
        }


        function registerTeam(metadataStore) {
            metadataStore.registerEntityTypeCtor('Team', Team);

            function Team() {
                this.isPartial = false;
            }

            Object.defineProperty(Team.prototype, 'tagsFormatted', {
                get: function () {
                    return this.tags ? this.tags.replace(/\|/g, ', ') : this.tags;
                },
                set: function (value) {
                    this.tags = value.replace(/\, /g, '|');
                }
            });
        }
        
        function registerSeason(metadataStore) {
            metadataStore.registerEntityTypeCtor('Season', Season);

            function Season() {
                this.isPartial = false;
            }

            Object.defineProperty(Season.prototype, 'fullName', {
                get: function () {
                    return (this.league.code || "Unknown League") + ' ' + this.name;
                },
            });
        }

        //#endregion
    }
})();