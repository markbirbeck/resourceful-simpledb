'use strict';

var should = require('should');

describe('SimpleDB:', function(){

  /**
   * Configure the SimpleDB client:
   */

  var AWS_CONFIG = require('config').aws;

  var sdb = require('../lib/sdb')
    .client(
      'testdb'
    , { keyid: AWS_CONFIG.accessKeyId, secret: AWS_CONFIG.secretAccessKey }
    );

  var fixture = {
    'CompanyName': '"BELLE-VUE" ENTERPRISES LIMITED'
  , 'CompanyNumber': '06477691'
  };

  var id = '/test/06477691';

  it('should put by id', function(done){
    sdb.put(id, fixture, function(err, company){
      should.not.exist(err);
      should.exist(company);
      company.should.include(fixture);
      done();
    });
  });

  it('should get by id', function(done){
    sdb.get(id, function(err, company){
      should.not.exist(err);
      should.exist(company);
      company.should.include(fixture);
      done();
    });
  });

  it('should delete by id', function(done){
    sdb.del(id, function(err, _id){
      should.not.exist(err);
      _id.should.equal(id);
      done();
    });
  });

  it('should use paging when returning more than 100 items', function(done){

    /**
     * Create more than 100 items:
     */

    var limit = 110;
    var completed = 0;

    limit.should.be.greaterThan(100);

    for (var i = 0; i < limit; i++){
      sdb.put(id + '/' + i, fixture, function(err, company){
        should.not.exist(err);
        should.exist(company);
        company.should.include(fixture);
        if (++completed === limit){

          /**
           * Now query to ensure paging works:
           */

          sdb.find(fixture, function (err, res){
            should.not.exist(err);
            should.exist(res);
            res.should.have.length(limit);

            /**
             * Finally delete all of the records:
             */

            completed = 0;
            for (i = 0; i < limit; i++){
              sdb.del(id + '/' + i, function (err, _id){
                should.not.exist(err);
                if (++completed === limit){
                  done();
                }
              })
            }
          })
        }
      })
    }
  });
});
