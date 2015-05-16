/*
 * Name         : aNib: Another Node.js IRC Bot
 * Author       : Winston Milling
 * Version      : 0.0.4
 * Licensed     : MIT
 * Description  : A simple IRC Bot framework that allows for multiple
 *                plugins and channels.
 */
var irc = require('irc'),
  config = require('./config.js'),
  requireDir = require('require-directory'),
  requireHandler = function(plugin) {
    plugin.init({trigger: config.global.trigger, uno: config.uno});
  },
  plugins = requireDir(module, './plugins', {visit: requireHandler, recurse: false});

// Run through each server in the configuration file.
config.servers.forEach(function (server) {

  if (config.global.debug) {
    console.log("Creating server connection to " + server.host + " for " + server.nick);
  }

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

        if (config.global.debug) {
          console.log("Beginning attachments for plugin " + id);
        }

        var plugin = plugins[id];
        plugin.actions.forEach(function (action) {
          if (action.type && action.handler) {
            if (action.type === 'message#') {

              if (config.global.debug) {
                console.log("Adding a channel listener to the queue");
              }

              if (attachToChannel.hasOwnProperty(id)){
                attachToChannel[id] = attachToChannel[id].concat(action);
              } else {
                attachToChannel[id] = [].concat(action);
              }
            } else {

              if (config.global.debug) {
                console.log("Attaching a " + action.type + " listener for plugin " + id);
              }

              localAttachListener(action.type, action.handler);
            }
          }
        });

        if (config.global.debug) {
          console.log("Finished attachments for plugin " + id);
        }
      }
    }

    // Loop through channels, join, and bind required plugins
    server.channels.forEach(function (channel) {

      if (config.global.debug) {
        console.log("Joining channel " + channel.channelName);
      }

      client.join(channel.channelName);
      channel.channelPlugins.forEach(function (pluginName) {

        if (config.global.debug) {
          console.log("Attaching channel listeners for plugin " + pluginName);
        }

        attachToChannel[pluginName].forEach(function (action) {
          console.log("Attaching message handler: message" + channel.channelName);
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
