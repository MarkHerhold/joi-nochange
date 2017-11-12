# Joi noChange Plugin

> A [Joi](https://github.com/hapijs/joi) plugin that validates the field it is attached to matches a sister object at the same path. This is extremely helpful when [validating JSON Patches](https://medium.com/@markherhold/validating-json-patch-requests-44ca5981a7fc#.e6kf262wf).

[![Build Status](https://travis-ci.org/MarkHerhold/joi-nochange.svg?branch=master)](https://travis-ci.org/MarkHerhold/joi-nochange)

## Installing
```shell
npm install joi-nochange --save
```

## Usage

```js
var Joi = require('joi-nochange'); // require this plugin as Joi

var origObj = {
    id: 'k1773y',
    name: 'Cuddles',
    favoriteToys: ['string'],
    meta: {
        born: 1452474481612,
        weight: 2.1 // pounds
    }
};

var kitty = JSON.parse(JSON.stringify(origObj)); // clone

kitty.meta.weight += 10; // Cuddles has been eating a lot
kitty.favoriteToys.push('catnip'); // and also likes catnip
kitty.id = 'best-cat-ever'; // but really isn't allowed to change ids

var schema = Joi.object().keys({
    id: Joi.string().noChange(origObj).required().label('id'),
    name: Joi.string().required().label('name'),
    favoriteToys: Joi.array().items(Joi.string().label('toy')).default([]).label('favoriteToys'),
    meta: {
        born: Joi.number().positive().integer().noChange(origObj).required().label('born'),
        weight: Joi.number().positive().unit('pounds').label('weight')
    }
}).label('cat');

var result = schema.validate(kitty);
// check and throw if there is an error (there is)
if (result.error) {
    throw result.error; // Joi Error: "child "cat" fails because ["id" is not allowed to change]"
}
// object is available at `result.value`
```

## Compatible Joi versions
This plugin works with multiple versions of Joi. Compatibility chart:

| **joi version** | **joi-nochange version**      |
|-----------------|-------------------------------|
| < 9.0.0         | < 1.0.0 (`joi-pre-v9` branch) |
| 9.0.0 - 10.2.2  | 1.0.0 (`joi-v9` branch)       |
| 10.3.0+         | 2.0.0 (`master` branch)       |

### Finding Compatible Versions
There is a [`find-compatible.js`](find-compatible.js) script that tests the currently checked out branch of `joi-nochange` against all versions of `joi>6`.
