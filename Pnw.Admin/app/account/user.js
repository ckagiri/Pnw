//(function () {
    'use strict';
    var serviceId = 'User';
    angular.module('app').factory(serviceId, function ($resource) {
        var UserResource = $resource('/api/user/:id', { id: "@id" }, {
            update: { method: 'PUT', isArray: false }
        });

        UserResource.prototype.isAdmin = function() {
            return this.roles && this.roles.indexOf('admin') > -1;
        };

        return UserResource;
    });
//});