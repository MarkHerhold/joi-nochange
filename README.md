# Joi noChange Plugin

> A Joi plugin that validates the field it is attached to matches a sister object at the same path. This is extremely helpful when [validating JSON Patches](https://medium.com/@markherhold/validating-json-patch-requests-44ca5981a7fc#.e6kf262wf).

## Installing
```shell
npm install joi-nochange --save
```

## Usage

```js
var Joi = require('joi'); // require Joi as usual
require('joi-nochange'); // patch in noChange()

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

## The Future of `joi-nochange`
:warning: `joi-nochange` is not a true plugin. Joi does not have a plugin interface yet (see Joi [issue #577](hapijs/joi/issues/577)), so this module monkey patches itself into Joi. When Joi does implement a plugin model, `joi-nochange` will bump to a new major version.
