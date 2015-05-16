/*
 * This is a simple plugin that takes an array of messages and responses
 * and processes them for either  channel messages or private messages.
 *
 * The expected location of the messages is at plugins/say/say.json and
 * has the following format:
 * [
 *   {
 *     "type": "message",
 *     "channel": "#",
 *     "activationMessage": "",
 *     "response": ""
 *   },
 *   {
 *     "type": "pm",
 *     "activationMessage": "",
 *     "response": ""
 *   }
 * ]
 *
 */
var config = null,
    sayings = require('./say/say.json'),
    channelSayingMap = {},
    pmSayingMap = {};

module.exports.actions = [
  {
    'type': "message#",
    'handler': function (callback, from, to, message) {
      if (undefined !== channelSayingMap[message.args[1]]) {
        channelSayingMap[message.args[1]].forEach(function(saying) {
          if (saying.channel === "#" || saying.channel === message.args[0]) {
            callback('say', message.args[0], saying.response);
          }
        });
      }
    }
  },
  {
    'type': "pm",
    'handler': function (callback, from, message) {
      if (undefined !== pmSayingMap[message]) {
        pmSayingMap[message].forEach(function(saying) {
          callback('say', from, saying.response);
        });
      }
    }
  }
];

module.exports.init = function(conf) {
  config = conf;
  sayings.forEach( function(saying) {
    switch (saying.type) {
      case "message":
        if (channelSayingMap.hasOwnProperty(saying.activationMessage)) {
          channelSayingMap[saying.activationMessage] = channelSayingMap[saying.activationMessage].concat(saying);
        } else {
          channelSayingMap[saying.activationMessage] = [].concat(saying);
        }
        break;
      case "pm":
        if (pmSayingMap.hasOwnProperty(saying.activationMessage)) {
          pmSayingMap[saying.activationMessage] = pmSayingMap[saying.activationMessage].concat(saying);
        } else {
          pmSayingMap[saying.activationMessage] = [].concat(saying);
        }
        break;
    }
  });
};
