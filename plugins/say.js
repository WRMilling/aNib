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
var self = this;
this.config = null;
this.sayings = require('./say/say.json');
this.channelSayingMap = {};
this.pmSayingMap = {};
module.exports.actions = [
  {
    'type': "message#",
    'handler': function (callback, from, to, message) {
      if (undefined !== self.channelSayingMap[message.args[1]]) {
        self.channelSayingMap[message.args[1]].forEach(function(saying) {
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
      if (undefined !== self.pmSayingMap[message]) {
        self.pmSayingMap[message].forEach(function(saying) {
          callback('say', from, saying.response);
        });
      }
    }
  }
];

module.exports.init = function(config) {
  self.config = config;
  self.sayings.forEach( function(saying) {
    switch (saying.type) {
      case "message":
        if (self.channelSayingMap.hasOwnProperty(saying.activationMessage)) {
          self.channelSayingMap[saying.activationMessage] = self.channelSayingMap[saying.activationMessage].concat(saying);
        } else {
          self.channelSayingMap[saying.activationMessage] = [].concat(saying);
        }
        break;
      case "pm":
        if (self.pmSayingMap.hasOwnProperty(saying.activationMessage)) {
          selfpmSayingMap[saying.activationMessage] = self.pmSayingMap[saying.activationMessage].concat(saying);
        } else {
          self.pmSayingMap[saying.activationMessage] = [].concat(saying);
        }
        break;
    }
  });
};
