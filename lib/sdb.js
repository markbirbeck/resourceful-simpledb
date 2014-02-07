'use strict';

var simpledb = require('simpledb');

var packer = require('./sdb_packer');

exports.client = function(domain, opts){
  var sdb = new simpledb.SimpleDB(opts /*, simpledb.debuglogger */);

  return {
    put: function(id, attr, callback){
      sdb.createDomain(domain, function(err, res, meta){
        if (err) {
          callback(err, id, attr, meta);
        } else {

          /**
           * Store the attributes:
           */

          sdb.putItem(
            domain,
            id,
            packer.pack(attr),
            function (err /*, res, meta*/){
              attr.id = id;
              callback(err, attr);
            }
          );
        }
      });
    },

    get: function(id, callback){
      sdb.getItem(domain, id, function(err, attr, meta){
        if (err) {
          callback(err, attr, meta);
        } else {
          delete attr.$ItemName;
          attr.id = id;
          callback(null, packer.unpack(attr));
        }
      });
    },

    del: function(id, callback){
      sdb.deleteItem(domain, id, {}, function(err, attr, meta){
        if (err) {
          callback(err, id, attr, meta);
        } else {
          callback(null, id, attr);
        }
      });
    }
  };
};
