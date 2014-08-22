/*
  Verions 0.0.1 of aNib: Another Node.js IRC Bot
  Author: Winston Milling
  Licensed: MIT
*/
var irc = require('irc'),
  config = require('./config.js'),
  requireDir = require('require-directory'),
  requireHandler = function(plugin) {
    plugin.init({trigger: config.global.trigger});
  },
  plugins = requireDir(module, './plugins', {visit: requireHandler, recurse: false});

// Run through each server in the configuration file. 
config.servers.forEach(function (server) {
  var client = new irc.Client(server.host, server.nick, server.options);

  // When connected, loop through channels, join, and register plugins/events for that channel.
  client.addListener('registered', function () {

    // Custom attach listener, may move elsewhere
    var localAttachListener = function (type, responseCreator) {
      client.addListener(type, function (arg1, arg2, arg3, arg4, arg5) {
        if (typeof arg1 === 'undefined') arg1 = null;
        if (typeof arg2 === 'undefined') arg2 = null;
        if (typeof arg3 === 'undefined') arg3 = null;
        if (typeof arg4 === 'undefined') arg4 = null;
        if (typeof arg5 === 'undefined') arg5 = null;
        responseCreator(function(action, sendTo, responseMessage) {
          if (undefined !== client[action]) {
            client[action](sendTo, responseMessage);
          }
        }, arg1, arg2, arg3, arg4, arg5);
      });
    }

    var attachToChannel = {};

    // Loop through plugins and attach listeners as needed.
    // For Channel listeners (message#),push to an arrray each plugin that
    // needs to be attached and we will attach it during the channel joining state. 
    for (var id in plugins) {
      if (plugins.hasOwnProperty(id)) {
        var plugin = plugins[id];
        plugin.actions.forEach(function (action) {
          if (action.type === 'message#') {
            if (attachToChannel.hasOwnProperty(id)){
              attachToChannel[id] = attachToChannel[id].concat(action);
            } else {
              attachToChannel[id] = [].concat(action);
            }
          } else {
            localAttachListener(action.type, action.handler);
          }
        });
      }
    }
  
    // Loop through channels, join, and bind required plugins
    server.channels.forEach(function (channel) {
      client.join(channel.channelName);
      channel.channelPlugins.forEach(function (pluginName) {
        attachToChannel[pluginName].forEach(function (action) {
          localAttachListener('message' + channel.channelName, action.handler);
        });
      });
    });
  });

  // Catchall errors and log to console for now.
  client.addListener('error', function (message) {
    console.log('error: ', message);
  });
});
