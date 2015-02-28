/*
 * Google API Plugin Shim
 *
 * This file is the shim that goes between aNib and the google API
 * sub-module to allow for separation of dependencies and a clean-
 * er plugins directory. 
 */ 
var config = null,
    googleapi = require('./google/google-api.js');

module.exports.init = function(conf) {
  config = conf; 
};

module.exports.actions = [
  {
    "type": "message#",
    "handler": function (callback, from, to, message) {
      if (message.args[1].indexOf(config.trigger + 'g ') > -1) {
        googleapi.search(message.args[1].slice(3), function (response) {
          callback('say', message.args[0], response);
        });
      } else if (message.args[1].indexOf(config.trigger + 's ') > -1) {
        googleapi.shorten(message.args[1].slice(3), function (response) {
          callback('say', message.args[0], response);
        });
      }
    }
  }
];
