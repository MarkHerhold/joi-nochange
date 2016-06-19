'use strict';

const Joi = require('joi');
const Hoek = require('hoek');

// creates a rule for the provided base type
function createRule(joiType) {
    const joiBaseType = Joi[joiType];

    return {
        base: joiBaseType(),
        name: joiType,
        language: {
            noChange: 'is not allowed to change' // maybe use 'may not change from {{q}}' instead?
        },
        rules: [{
            name: 'noChange',
            params: {
                q: Joi.any()
            },
            validate(params, value, state, options) {

                const path = state.path === '' ? null : state.path;
                const origValue = Hoek.reach(params.q, path);

                if (Hoek.deepEqual(origValue, value)) {
                    return null; // Everything is OK
                }

                return this.createError(joiType + '.noChange', {
                    v: value//,
                    // q: origValue
                }, state, options);
            }
        }]
    };
}

// extend Joi and export
// due to extending any() not extending other types, number(), string(), etc. we need to extend all of these manually
// see https://github.com/hapijs/joi/issues/577
module.exports = Joi
    .extend(createRule('any'))
    .extend(createRule('object'))
    .extend(createRule('number'))
    .extend(createRule('string'))
    .extend(createRule('date'))
    .extend(createRule('boolean'));
