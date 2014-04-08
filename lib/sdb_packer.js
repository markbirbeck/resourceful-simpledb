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

            /**
             * Unescape characters that are reserved:
             */

            case 'string':
              val = val
                .replace(/%2A/g, '*')
                .replace(/%29/g, ')')
                .replace(/%28/g, '(')
                .replace(/%27/g, '\'')
                .replace(/%22/g, '"')
                .replace(/%21/g, '!')
                .replace(/%%/g, '%')
                ;
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

              /**
               * Escape characters that are reserved:
               */

            case 'string':
              val = val
                .replace(/%/g, '%%')
                .replace(/!/g, '%21')
                .replace(/"/g, '%22')
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29')
                .replace(/\*/g, '%2A')
                ;
              break;
          }

          doc[name] = type + SEPARATOR + val;
        }
      });
  }

  return doc;
};
