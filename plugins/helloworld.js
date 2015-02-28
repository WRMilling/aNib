/*
 * This plugin prints out 'Hello World!' or 'Private Hello World!'
 * when the user says trigger + hw. Information on plugin formatting
 * is below.
 *
 * The current plugin format only requires that you have an array of
 * actions exported as 'actions' as well as an init function which 
 * takes in a config object. The config will currently pass in trigger 
 * only.
 * 
 * The actions array must define a type and a handler function which
 * takes in a callback and the required elements for the action type 
 * you are performing (see thre node-irc documentation for returned 
 * elements). For example, a 'pm' message type takes in the mandatory 
 * callbackwith from and message.
 *
 * The callback arguments are:
 *  Action
 *  Target
 *  Message
 *
 * And it currently works with types:
 *  say
 *  action
 *  notice
 *
 * This is fairly set for now, but may change in the future. 
 */
var config = null;

module.exports.init = function(conf) {
  config = conf;
};

module.exports.actions = [
  {
    'type': 'message#',
    'handler': function(callback, from, to, message) {         
      if (message.args[1].indexOf(config.trigger + 'hw') > -1) {
        callback('say', message.args[0], 'Hello World!');
      }
    }
  },
  {
    'type': 'pm',
    'handler': function(callback, from, message) {
      if (message.indexOf(config.trigger + 'hw') === 0) {
        callback('say', from, 'Private Hello World!');
      }
    }
  }
];
