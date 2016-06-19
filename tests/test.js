'use strict';

var Joi = require('./../index');
var Hoek = require('hoek');
var expect = require('chai').expect;

var origObj = {
    id: 'k1773y',
    name: 'Cuddles',
    favoriteToys: ['string'],
    meta: {
        born: 1452474481612,
        weight: 2.1 // pounds
    }
};

// Cat object representation schema
var schema = Joi.object().keys({
    id: Joi.string().noChange(origObj).required().label('id'),
    name: Joi.string().required().label('name'),
    description: Joi.string().optional().label('description'),
    favoriteToys: Joi.array().items(Joi.string().label('toy')).default([]).label('favoriteToys'),
    meta: {
        born: Joi.number().positive().integer().noChange(origObj).required().label('born'),
        weight: Joi.number().positive().unit('pounds').label('weight')
    }
}).label('cat');

describe('noChange()', function() {
    it('should allow modification to the top-level description field', function() {
        let tmp = Hoek.clone(origObj);
        tmp.description = 'My fuzzy kitten, Cuddles';

        const res = schema.validate(tmp);
        expect(res.value).to.eql(tmp);
        expect(res.value).to.not.eql(origObj);
        expect(res.error).to.equal(null);
    });

    it('should allow the removal of an element of the favoriteToys array', function() {
        let tmp = Hoek.clone(origObj);
        tmp.favoriteToys.splice(0, 1);

        const res = schema.validate(tmp);
        expect(res.value).to.eql(tmp);
        expect(res.value).to.not.eql(origObj);
        expect(res.error).to.equal(null);
    });

    // test for example from article, gist: https://gist.github.com/MarkHerhold/795cc1f73065ca2f3b76
    it('should not allow the modification of a nested object', function() {
        let obj = { nested: { stuff: true } };

        let tmp = Hoek.clone(obj);
        tmp.nested.stuff = 1337;

        const schema = Joi.object().keys({
            nested: Joi.object().keys({
                stuff: Joi.any().noChange(obj)
            })
        });

        const res = schema.validate(tmp);
        expect(res.value).to.eql(tmp);
        expect(res.error.message).to.equal('child "nested" fails because [child "stuff" fails because ["stuff" is not allowed to change]]');
    });

    it('should allow `undefined` be passed in', function() {
        const schema = Joi.any().noChange(undefined).label('this undefined thing');

        const res = schema.validate(undefined);
        expect(res.value).to.equal(undefined);
        expect(res.error).to.equal(null);
    });

    it('should identify that `undefined` is not equal to `null`', function() {
        const schema = Joi.any().noChange(undefined).label('this undefined thing');

        const res = schema.validate(null);
        expect(res.value).to.equal(null);
        expect(res.error.message).to.equal('"this undefined thing" is not allowed to change');
    });

    it('should fail to replace the top-level id field', function() {
        let tmp = Hoek.clone(origObj);
        tmp.id = 'f00zy';

        const res = schema.validate(tmp);
        expect(res.value).to.eql(tmp);
        expect(res.value).to.not.eql(origObj);
        expect(res.error.message).to.equal('child "id" fails because ["id" is not allowed to change]');
    });

    it('should fail to remove /meta/born', function() {
        let tmp = Hoek.clone(origObj);
        delete tmp.meta.born;

        const res = schema.validate(tmp);
        expect(res.value).to.not.eql(origObj);
        expect(res.error.message).to.equal('child "meta" fails because [child "born" fails because ["born" is required]]');
    });

    it('should not notice a change when the field does not change - set /meta/born to 1452474481612', function() {
        let tmp = Hoek.clone(origObj);
        tmp.meta.born = 1452474481612;

        const res = schema.validate(tmp);
        expect(res.value).eql(origObj);
        expect(res.error).to.equal(null);
    });

    it('should not fix an object with different fields', function() {
        let origObj = {
            levelOne: {
                levelTwo: {
                    number: 444
                }
            }
        };

        let otherObj = {
            levelOne: {
                levelTwo: {
                    number: 444,
                    otherField: true
                }
            }
        };

        let schema = Joi.object().keys({
            levelOne: Joi.object().noChange(origObj).keys({
                levelTwo: Joi.object().keys({
                    number: Joi.number().noChange(origObj)
                })
            })
        });

        const res = schema.validate(otherObj);
        expect(res.value).eql(otherObj);
        expect(res.error.message).to.equal('child "levelOne" fails because [child "levelTwo" fails because ["otherField" is not allowed]]');
    });
});

describe('readme example', function() {
    it('should work', function() {
        var origObj = {
            id: 'k1773y',
            name: 'Cuddles',
            favoriteToys: ['string'],
            meta: {
                born: 1452474481612,
                weight: 2.1 // pounds
            }
        };

        var kitty = JSON.parse(JSON.stringify(origObj)); // clone so we can modify

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


        var fn = function() {
            var result = schema.validate(kitty);
            // check and throw if there is an error (there is)
            if (result.error) {
                throw result.error;
            }
        };

        expect(fn).to.throw('child "id" fails because ["id" is not allowed to change]');
    });
});
