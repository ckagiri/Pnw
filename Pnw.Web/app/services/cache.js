(function () {
    'use strict';

    var serviceId = 'cache';

    angular.module('app').factory(serviceId, ['$cacheFactory', cache]);

    function cache($cacheFactory) {
        var expires = undefined, //config.storeExpirationMs
            store;
        var service = {
            clear: clear,
            put: put,
            get: get,
            info: info
        };

        init();

        return service;

        function init() {
            store = $cacheFactory('store');
        }

        function clear(key) {
            return store.put(key, null);
        }

        function get(key) {
            return store.get(key);
        }

        function put(key, value) {
            return store.put(key, value);
        }

        function info() {
            return store.info();
        }
    }
})();