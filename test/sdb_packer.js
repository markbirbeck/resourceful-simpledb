'use strict';

require('should');

describe('SimpleDB data packer', function(){

  var packer = require('../lib/sdb_packer');

  describe('empty objects', function(){
    it('should not fail when packing an empty object', function(){
      packer.pack({}).should.eql({});
    });

    it('should not fail when unpacking an empty object', function(){
      packer.unpack({}).should.eql({});
    });
  });

  describe('id', function(){
    it('should skip the id field when packing', function(){
      packer.pack({'id': 'ab1136'}).should.eql({'id': 'ab1136'});
    });

    it('should skip the id field when unpacking', function(){
      packer.unpack({'id': 'kz7655'}).should.eql({'id': 'kz7655'});
    });
  });

  describe('Booleans', function(){
    it('should pack booleans', function(){
      packer.pack({'overdue': true}).should.eql({'overdue': 'boolean:true'});
      packer.pack({'overdue': false}).should.eql({'overdue': 'boolean:false'});
    });

    it('should unpack booleans', function(){
      packer.unpack({'overdue': 'boolean:true'}).should.eql({'overdue': true});
      packer.unpack({'overdue': 'boolean:false'}).should.eql({'overdue': false});
    });
  });

  describe('Numbers', function(){
    it('should pack numbers', function(){
      packer.pack({'age': 23}).should.eql({'age': 'number:0000000023'});
    });

    it('should unpack numbers', function(){
      packer.unpack({'price': 'number:0000001234'}).should.eql({'price': 1234});
    });
  });

  describe('Strings', function(){
    it('should pack strings', function(){
      packer.pack(
        {'name': 'James Bond'}
      ).should.eql(
        {'name': 'string:James Bond'}
      );
    });

    it('should unpack strings', function(){
      packer.unpack(
        {'name': 'string:Dr. Evil'}
      ).should.eql(
        {'name': 'Dr. Evil'}
      );
    });

    it('should pack strings with the separator character in', function(){
      packer.pack({
        'title': 'Job: The Story of a Simple Man'
      }).should.eql({
        'title': 'string:Job: The Story of a Simple Man'
      });
    });

    it('should unpack strings with the separator character in', function(){
      packer.unpack({
        'title': 'string:On Tolerance: The Life Style Wars: A Defence of Moral Independence'
      }).should.eql({
        'title': 'On Tolerance: The Life Style Wars: A Defence of Moral Independence'
      });
    });
  });

  describe('Objects', function(){
    it('should pack a full object', function(){
      packer.pack({
        'id': 'xc9982'
      , 'author': 'Ivan Turgenev'
      , 'title': 'Fathers and Sons'
      , 'price': 499
      }).should.eql({
        'id': 'xc9982'
      , 'author': 'string:Ivan Turgenev'
      , 'title': 'string:Fathers and Sons'
      , 'price': 'number:0000000499'
      });
    });

    it('should unpack a full object', function(){
      packer.unpack({
        'id': 'gh8856'
      , 'author': 'string:Hans Fallada'
      , 'title': 'string:Alone in Berlin'
      , 'price': 'number:0000000689'
      }).should.eql({
        'id': 'gh8856'
      , 'author': 'Hans Fallada'
      , 'title': 'Alone in Berlin'
      , 'price': 689
      });
    });

    it('should round-trip an object', function(){
      var book = {
        'id': 'kq8873'
      , 'author': 'Ralph Ellison'
      , 'title': 'Invisible Man'
      , 'price': 689
      };
      book.should.eql(packer.unpack(packer.pack(book)));
    });
  });
});
