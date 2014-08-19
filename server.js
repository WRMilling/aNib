/*
  Verions 0.0.1 of aNib: Another Node.js IRC Bot
  Author: Winston Milling
  Licensed: MIT
*/
var irc = require('irc'),
  config = require('./config.js'),
  requireDir = require('require-directory'),
  plugins = requireDir(module, './plugins'),
  clients = [],
  pluginInstances = [];

// Run through each server in the configuration file. 
config.servers.forEach(function (server) {
  var client = new irc.Client(server.host, server.nick, server.options);

  // When connected, loop through channels, join, and register plugins/events for that channel.
  client.addListener('registered', function () {
    // Load in an instance of all plugins. If there are any server level
    // functions, they should be automatically bind their listeners.
    for (var pluginName in plugins) {
        var instance = new plugins[pluginName](client);
        pluginInstances[client.opt.server + pluginName] = instance; 
    };

    // Loop through channels, join, and bind any plugins
    server.channels.forEach(function (channel) {
      client.join(channel.channelName);
      channel.channelPlugins.forEach(function (pluginName) {
        pluginInstances[client.opt.server + pluginName].bindChannel(channel.channelName);
      });
    });
  });

  // Catchall errors and log to console for now.
  client.addListener('error', function (message) {
    console.log('error: ', message);
  });

  // Push the client to our clients array (Future use). 
  clients.push({
    'id': server.host,
    'client': client
  });
});