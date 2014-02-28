(function () {
    'use strict';
    var controllerId = 'auth';
    angular.module('app').factory(controllerId, ['$dialog', '$http', '$q', '$resource', 'identity', 'User', auth]);
    function auth($dialog, $http, $q, $resource, identity, User) {
        var urlPrefix = '/api';
        return {
            forgotPassword: function (model) {
                return $http.post(urlPrefix + '/password/forgot', model);
            },
            changePassword: function (model) {
                return $http.post(urlPrefix + '/password/change', model);
            },
            createUser: function (newUserData) {
                var newUser = new User(newUserData);
                var dfd = $q.defer();

                newUser.$save().then(function () {
                    identity.currentUser = newUser;
                    dfd.resolve();
                }, function (response) {
                    dfd.reject(response);
                });

                return dfd.promise;
            },
            updateCurrentUser: function (newUserData) {
                var dfd = $q.defer();
                var clone = angular.copy(identity.currentUser);
                angular.extend(clone, newUserData);
                clone.$update().then(function () {
                    identity.currentUser = clone;
                    dfd.resolve();
                }, function (response) {
                    dfd.reject(response.data.reason);
                });
                return dfd.promise;
            },
            logoutUser: function () {
                var dfd = $q.defer();
                $http.post(urlPrefix + '/session/logout', { logout: true }).then(function () {
                    identity.currentUser = undefined;
                    dfd.resolve();
                }, function(response) {
                    dfd.reject(response);
                });
                return dfd.promise;
            },
            authenticateUser: function (username, password) {
                var dfd = $q.defer();
                $http.post(urlPrefix + '/session/login', { username: username, password: password }).then(function(response) {
                    if (response.data.success) {
                        var user = new User();
                        angular.extend(user, response.data.user);
                        identity.currentUser = user;
                        dfd.resolve(true);
                    } else {
                        dfd.resolve(false);
                    }
                }, function (response) {
                    dfd.reject(response);
                });
                return dfd.promise;
            },
            authorizeCurrentUserForRoute: function (role) {
                if (identity.isAuthorized(role)) {
                    return true;
                } else {
                    return $q.reject('not authorized');
                }

            },
            authorizeAuthenticatedUserForRoute: function () {
                if (identity.isAuthenticated()) {
                    return true;
                } else {
                    return $q.reject('not authorized');
                }
            }
        };
    }
})();


