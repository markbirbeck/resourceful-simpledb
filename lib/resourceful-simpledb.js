'use strict';

var base = require('resourceful-base-engine');
var util = require('util');

var SimpleDB = function SimpleDB(config){
  config.protocol = 'simpledb';

  /**
   * Call the constructor of the base class:
   */

  SimpleDB.super_.call(this, config);

  /**
   * Now do our specific stuff:
   */

  this.connection = require('./sdb').client(config.uri, config.opts);
};

/**
 * Base our class on the base engine:
 */

util.inherits(SimpleDB, base.BaseEngine);

/**
 * Now override the request method:
 */


SimpleDB.prototype.request = function(method, id, doc, callback) {
  if (method === 'del') {
    return this.connection.del(id, callback);
  }

  if (method === 'get') {
    return this.connection.get(id, callback);
  }

  if (method === 'put') {
    return this.connection.put(id, doc, callback);
  }

  return callback(new Error(util.format('No %s handler', method)));
};



/**
 * Allow a reference to resourceful to be patched in:
 */

exports.init = function init(resourcefulLib){
  base.register(resourcefulLib, 'SimpleDB', SimpleDB);
};
