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
        var service = {
            configureMetadataStore: configureMetadataStore
        };

        return service;

        function configureMetadataStore(metadataStore) {
            registerFixture(metadataStore);
            registerTeam(metadataStore);
        }

        //#region Internal Methods        
        
        function registerFixture(metadataStore) {
            metadataStore.registerEntityTypeCtor('Fixture', Fixture);

            function Fixture() { }

            Object.defineProperty(Fixture.prototype, 'kickOffFormatted', {
                get: function () {
                    var kickOff = this.kickOff;
                    var value = moment.utc(kickOff).format('ddd hh:mm a');
                    return value;
                }
            });
        }


        function registerTeam(metadataStore) {
            metadataStore.registerEntityTypeCtor('Team', Team);

            function Team() { }

            Object.defineProperty(Team.prototype, 'tagsFormatted', {
                get: function () {
                    return this.tags ? this.tags.replace(/\|/g, ', ') : this.tags;
                },
                set: function (value) {
                    this.tags = value.replace(/\, /g, '|');
                }
            });
        }

        //#endregion
    }
})();