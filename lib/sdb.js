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
          var expression = name.substring(0, 1);
          var fieldName;
          if (expression === '<' || expression === '>' || expression === '='){
            fieldName = name.substring(1);
          } else {
            expression = '=';
            fieldName = name;
          }
          where.push(fieldName + ' ' + expression + ' "' + c[name] + '"');
        });

      var query = 'select * from ' + domain + ' where ' + where.join(' and ');
      var results = [];
      var _select = function (query, override, callback){
        sdb.select(query, override, function (err, res, meta){
          if (err){
            return callback(err, res);
          }

          if (res){
            res.forEach(function(obj, index){
              results.push(packer.unpack(obj));
            });
          }

          /**
           * If there is more data to get, then query again:
           */

          if (meta.result.SelectResult.NextToken){
            _select(query, {NextToken: meta.result.SelectResult.NextToken}, callback);
          } else {
            callback(err, results);
          }
        });
      };
      _select(query, {}, callback);
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
