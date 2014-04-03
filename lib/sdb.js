'use strict';

var simpledb = require('simpledb');

var packer = require('./sdb_packer');

exports.client = function(domain, opts){
  var sdb = new simpledb.SimpleDB(opts /*, simpledb.debuglogger */);
  var domainCreated = false;

  function createDomain(domain, callback){
    var retries = 0;
    var _createDomain = function (){
      if (!domainCreated){
        sdb.createDomain(domain, function(err, res, meta){
          if (err){
            if (err.Code === 'ServiceUnavailable'){
              var delay = Math.random() * 1000 * retries++;
              setTimeout(_createDomain, delay);
            } else {
              callback(err, res, meta);
            }
          } else {
            domainCreated = true;
            callback(null, res, meta);
          }
        });
      } else {
        callback(null, null, null);
      }
    };
    _createDomain();
  }

  return {
    put: function(id, attr, callback){
      createDomain(domain, function(err, res, meta){
        if (err) {
          callback(err, id, attr, meta);
        } else {

          /**
           * Store the attributes:
           */

          var retries = 0;
          var _putItem = function (){
            sdb.putItem(
              domain,
              id,
              packer.pack(attr),
              function (err, res, meta){
                if (err){
                  if (err.Code === 'ServiceUnavailable'){
                    var delay = Math.random() * 1000 * retries++;
                    setTimeout(_putItem, delay);
                  } else {
                    callback(err, attr);
                  }
                } else {
                  callback(null, attr);
                }
              }
            );
          };
          _putItem();
        }
      });
    },

    get: function(id, callback){
      sdb.getItem(domain, id, function(err, attr, meta){
        if (err) {
          callback(err, attr, meta);
        } else {
          callback(null, packer.unpack(attr));
        }
      });
    },

    find: function(conditions, callback){

      /**
       * [TODO] Use a library like http://hiddentao.github.io/squel/ to build
       *        the queries.
       */

      var where = [];
      var c = packer.pack(conditions);

      Object.keys(c)
        .forEach(function (name){
          where.push(name + ' = "' + c[name] + '"');
        });

      var query = 'select * from ' + domain + ' where ' + where.join(' and ');
      sdb.select(query, function (err, res /*, meta */){
        if (!err){
          if (res){
            res.forEach(function(obj, index){
              res[index] = packer.unpack(obj);
            });
          } else {
            res = [];
          }
        }
        callback(err, res);
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
