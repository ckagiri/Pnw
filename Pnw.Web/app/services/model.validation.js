(function () {
    'use strict';

    var serviceId = 'model.validation';
    angular.module('app').factory(serviceId, ['common', modelValidation]);

    function modelValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator,
            requireReferenceValidator;

        var service = {
            applyValidators: applyValidators,
            createAndRegister: createAndRegister
        };

        return service;

        function applyValidators(metadataStore) {
            applyRequireReferenceValidators(metadataStore);
            log('Validators applied', null, serviceId);
        }

        function createAndRegister(eNames) {
            entityNames = eNames;
            // Step 1) Create it
            requireReferenceValidator = createRequireReferenceValidator();
            // Step 2) Tell breeze about it
            Validator.register(requireReferenceValidator);
            // Step 3) Later we will apply them to the properties/entites via applyValidators
            log('Validators created and registered', null, serviceId, false);
        }

        function applyRequireReferenceValidators(metadataStore) {
            var navigations = ['season'];
            var entityType = metadataStore.getEntityType(entityNames.fixture);

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }

        function createRequireReferenceValidator() {
            var name = 'requireReferenceEntity';
            // isRequired = true so zValidate directive displays required indicator
            var ctx = { messageTemplate: 'Missing %displayName%', isRequired: true };
            var val = new Validator(name, valFunction, ctx);
            return val;

            // passes if reference has a value and is not the nullo (whose id===0)
            function valFunction(value) {
                return value ? value.id !== 0 : false;
            }
        }
    }
})();