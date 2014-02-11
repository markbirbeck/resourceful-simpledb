'use strict';

var SEPARATOR = ':';

exports.unpack = function(attr){
  var doc = {};

  if (attr){
    Object.keys(attr)
      .forEach(function (name){
        var v = attr[name];

        if (name === 'id'){
          doc[name] = v;
        } else {
          var i = v.indexOf(SEPARATOR)
            , type = v.slice(0, i)
            , val = v.slice(i + 1);

          switch(type) {

            case 'string':
              break;

            case 'number':
              val = Number(val);
              break;

            case 'boolean':
              val = Boolean((val === 'true') ? true : false);
              break;
          }
          doc[name] = val;
        }
      });
  }

  return doc;
};

exports.pack = function(attr){
  var doc = {};

  if (attr){
    Object.keys(attr)
      .forEach(function (name) {
        var val = attr[name];

        if (name === 'id'){
          doc[name] = val;
        } else {
          var type = typeof val;

          switch(type) {

            /**
             * Zero pad numbers to ten digits:
             */

            case 'number':
              val = (1e10 + val + '').substr(1);
              break;
          }

          doc[name] = type + SEPARATOR + val;
        }
      });
  }

  return doc;
};
