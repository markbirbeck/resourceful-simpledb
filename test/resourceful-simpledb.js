'use strict';

var should = require('should');

/**
 * Create a Broadway app to house our plugin:
 */

var resourceful = require('resourceful');
var app = new (require('broadway')).App();

/**
 * Add SimpleDB support to resourceful:
 */

app.use(require('../lib/resourceful-simpledb'), resourceful);
app.init();

describe('Creatures DB:', function(){

  var AWS_CONFIG = require('config').aws;

  var fixture = {
    diet: 'carnivore'
  , vertebrate: true
  };
  var id = 'wolf';

  var Creature = resourceful.define('creature', function () {
    this.string('diet');
    this.bool('vertebrate');
    this.array('belly');

    this.timestamps();

    this.prototype.feed = function (food) {
      this.belly.push(food);
    };

    this.use('SimpleDB', {
      uri: 'creatures'
    , opts: { keyid: AWS_CONFIG.accessKeyId, secret: AWS_CONFIG.secretAccessKey }
    });
  });

  it('should create and delete a Creature with a generated id', function(done){
    var wolf = new(Creature)(fixture);

    wolf.save(function(err, creature){
      should.not.exist(err);
      should.exist(creature);
      creature.should.have.property('resource', 'Creature');
      creature.should.have.property('status', 201);
      creature.should.include(fixture);
      creature.destroy(function(err, res){
        should.not.exist(err);
        should.exist(res);
        res.should.have.property('status', 204);
        res.should.have.property('id');
        done();
      });
    });
  });

  it('should create a Creature with id field', function(done){
    var wolf = new(Creature)(fixture);

    wolf.id = id;

    wolf.save(function(err, creature){
      should.not.exist(err);
      should.exist(creature);
      creature.should.have.property('resource', 'Creature');
      creature.should.have.property('status', 201);
      creature.should.include(fixture);
      done();
    });
  });

  it('should get Creature', function(done){
    Creature.get(id, function(err, creature){
      should.not.exist(err);
      should.exist(creature);
      creature.should.have.property('resource', 'Creature');
      creature.should.have.property('id', id);
      creature.should.include(fixture);
      done();
    });
  });

  it('should delete Creature by id', function(done){
    Creature.destroy(id, function(err, res){
      should.not.exist(err);
      should.exist(res);
      res.should.have.property('id', 'creature/' + id);
      res.should.have.property('status', 204);
      done();
    });
  });
});
