'use strict';

var Any = require('joi/lib/any');
var language = require('joi/lib/language');
var Hoek = require('hoek');

// monkey patch noChange() into Any's prototype
Any.prototype.noChange = function (sourceObj) {

    return this._test('noChange', null, (value, state, options) => {

        const path = state.path === '' ? null : state.path;
        const origValue = Hoek.reach(sourceObj, path);
        if (Hoek.deepEqual(origValue, value)) {
            return null;
        }
        return this.createError('any.noChange', null, state, options);
    });
};

// Add any.noChang error message to the language map
language.errors.any.noChange = 'is not allowed to change';
