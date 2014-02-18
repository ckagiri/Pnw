(function () {
    'use strict';

    // Factory name is handy for logging
    var serviceId = 'model';

    // Define the factory on the module.
    // Inject the dependencies. 
    // Point to the factory definition function.
    angular.module('app').factory(serviceId, ['model.validation', model]);

    function model(modelValidation) {
        // Define the functions and properties to reveal.
        var entityNames = {
            fixture: 'Fixture',
            league: 'League',
            season: 'Season',
            team: 'Team',
            prediction: 'Prediction',
            leaderboard: 'LeaderBoard',
            round: 'Round'
        };

        var service = {
            configureMetadataStore: configureMetadataStore,
            createNullos: createNullos,
            entityNames: entityNames,
            extendMetadata: extendMetadata
        };

        return service;

        function configureMetadataStore(metadataStore) {
            registerSeason(metadataStore);
            registerFixture(metadataStore);
            registerTeam(metadataStore);

            modelValidation.createAndRegister(entityNames);
        }
        
        function createNullos(manager) {
            var unchanged = breeze.EntityState.Unchanged;

            //createNullo(entityNames.league);
            //createNullo(entityNames.season);

            function createNullo(entityName, values) {
                var initialValues = values || { name: ' [Select a ' + entityName.toLowerCase() + ']' };
                return manager.createEntity(entityName, initialValues, unchanged);
            }
        }
        
        function extendMetadata(metadataStore) {
            modelValidation.applyValidators(metadataStore);
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
                    var value = moment.utc(kickOff).format('ddd MMM DD, H:mm');
                    return value;
                }
            });
            
            Object.defineProperty(Fixture.prototype, 'title', {
                get: function () {
                    var hName = this.homeTeam ? this.homeTeam.name : '';
                    var aName = this.awayTeam ? this.awayTeam.name : '';
                    if (hName && aName) 
                        return hName + ' v ' + aName;
                    return '';
                }
            });
            
            Object.defineProperty(Fixture.prototype, 'score', {
                get: function () {
                    var value = "";
                    if (this.matchStatus === "Played") {
                        var homeScore = this.homeScore;
                        var awayScore = this.awayScore;
                        value = homeScore + ' - ' + awayScore;
                    }
                    else {
                        value = " - ";
                    }
                    if (this.matchStatus === "InProgress") { value += '*'; } 
                    
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
                this.isPartial = true;
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