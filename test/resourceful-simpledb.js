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
      creature.should.have.property(Creature.key);
      creature.should.include(fixture);
      creature.destroy(function(err, res){
        should.not.exist(err);
        should.exist(res);
        res.should.have.property('status', 204);
        res.should.have.property(Creature.key);
        done();
      });
    });
  });

  it.only('should not overwhelm SimpleDB with too many requests', function(done){
    var completed = 0;
    var limit = 10;

    for (var i = 0; i < limit; i++){
      var wolf = new(Creature)(fixture);

      wolf.id = 'wolf' + i;
      wolf.save(function(err, creature){
        should.not.exist(err);
        should.exist(creature);
        creature.should.have.property('resource', 'Creature');
        creature.should.have.property('status', 201);
        creature.should.have.property(Creature.key);
        creature.should.include(fixture);
        completed++;
        if (completed === limit){

          /**
           * Now destroy all of the items we created:
           */

          completed = 0;
          for (i = 0; i < limit; i++){
            var wolf = new(Creature)(fixture);

            wolf.id = 'wolf' + i;
            wolf.destroy(function(err, res){
              should.not.exist(err);
              should.exist(res);
              res.should.have.property('status', 204);
              res.should.have.property(Creature.key);
              completed++;
              if (completed === limit){
                done();
              }
            });
          }
        }
      });
    }
  });

  it('should create a Creature with id field', function(done){
    var wolf = new(Creature)(fixture);

    wolf[Creature.key] = id;

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
      creature.should.have.property(Creature.key, id);
      creature.should.include(fixture);
      done();
    });
  });

  it('should update Creature after get()', function(done){
    Creature.get(id, function(err, creature){
      should.not.exist(err);
      should.exist(creature);
      creature.should.have.property('resource', 'Creature');
      creature.should.have.property(Creature.key, id);
      creature.should.have.property('vertebrate', true);
      creature.update({vertebrate: false}, function(err, changed){
        should.not.exist(err);
        should.exist(changed);
        changed.should.have.property('resource', 'Creature');
        changed.should.have.property(Creature.key, id);
        Creature.get(id, function (err, check){
          changed.should.have.property('vertebrate', false);
          check.should.have.property('diet', 'carnivore');
          done();
        });
      });
    });
  });

  it('should update Creature after find()', function(done){
    Creature.find({vertebrate: false}, function(err, creatures){
      should.not.exist(err);
      should.exist(creatures);
      var creature = creatures[0];
      creature.should.have.property('resource', 'Creature');
      creature.should.have.property(Creature.key, id);
      creature.should.have.property('vertebrate', false);
      creature.update({vertebrate: true}, function(err, changed){
        should.not.exist(err);
        should.exist(changed);
        changed.should.have.property('resource', 'Creature');
        changed.should.have.property(Creature.key, id);
        Creature.get(id, function (err, check){
          changed.should.have.property('vertebrate', true);
          check.should.have.property('diet', 'carnivore');
          done();
        });
      });
    });
  });

  it('should delete Creature by id', function(done){
    Creature.destroy(id, function(err, res){
      should.not.exist(err);
      should.exist(res);
      res.should.have.property(Creature.key, 'creature/' + id);
      res.should.have.property('status', 204);
      done();
    });
  });

  it('should create, find and delete Creatures', function(done){
    /**
     * Create a carnivore and a herbivore:
     */

    var fox = new(Creature)(fixture);

    fox[Creature.key] = 'fox';
    fox.save(function(err, creature){
      should.not.exist(err);
      should.exist(creature);

      var rabbit = new(Creature)(fixture);

      rabbit[Creature.key] = 'rabbit';
      rabbit.diet = 'herbivore';
      rabbit.save(function(err, r){
        should.not.exist(err);
        should.exist(r);

        /**
         * Search by diet:
         */

        Creature.find({diet: 'herbivore'}, function(err, creatures){
          should.not.exist(err);
          should.exist(creatures);
          creatures.length.should.equal(1);
          creatures[0][Creature.key].should.equal('rabbit');

          /**
           * Retrieve all records:
           */

          Creature.all(function(err, creatures){
            should.not.exist(err);
            should.exist(creatures);
            creatures.length.should.equal(2);

            /**
             * Now delete both animals:
             */

            Creature.destroy('wolf', function (err /*, wolf */){
              should.not.exist(err);
              Creature.destroy('rabbit', function (err /*, rabbit */){
                should.not.exist(err);
                done();
              });
            });
          });
        });
      });
    });
  });
});
