'use strict';

const Hoek = require('hoek');

function noChangeExtend(Joi) {
    // extend Joi
    // due to extending any() not extending other types, number(), string(), etc. we need to extend all of these manually
    // see https://github.com/hapijs/joi/issues/577
    return Joi
        .extend(createRule('any'))
        .extend(createRule('object'))
        .extend(createRule('number'))
        .extend(createRule('string'))
        .extend(createRule('date'))
        .extend(createRule('boolean'));
}

// creates a rule for the provided base type
function createRule(joiType) {

    return function noChange(joi) {
        return {
            base: joi[joiType](),
            name: joiType,
            language: {
                noChange: 'is not allowed to change' // maybe use 'may not change from {{q}}' instead?
            },
            rules: [{
                name: 'noChange',
                params: {
                    q: joi.any()
                },
                validate(params, value, state, options) {

                    // Joi 10.3.0+ paths are arrays
                    const path = state.path.join('.');
                    const origValue = Hoek.reach(params.q, path);

                    if (Hoek.deepEqual(origValue, value)) {
                        return value; // Everything is OK
                    }

                    return this.createError(joiType + '.noChange', {
                        v: value//,
                        // q: origValue
                    }, state, options);
                }
            }]
        };
    };
}

module.exports = noChangeExtend;
