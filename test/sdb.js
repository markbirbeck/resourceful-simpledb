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
      company.should.have.property('id', id);
      company.should.include(fixture);
      done();
    });
  });

  it('should get by id', function(done){
    sdb.get(id, function(err, company){
      should.not.exist(err);
      should.exist(company);
      company.should.have.property('id', id);
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
});
