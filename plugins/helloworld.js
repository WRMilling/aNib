/*
  Simple plugin that shows how server wide listeners are added and an 
  example of the bindChannel function which must be written to do channel
  level actions.

  This is currently in flux as the bot evolves.
*/
function newInstance(newClient) {
  var client = newClient;

  client.addListener('pm', function(from, message){
    if (message.args[1].indexOf(".hw") == 0) {
      client.say(from, 'Hello World.');
    }
  });

  this.bindChannel = function (channelName) {
    if (undefined !== channelName && null !== channelName) {
      client.addListener('message' + channelName, function(from, to, message) {
        if (message.args[1].indexOf(".hw") == 0) {
          client.say(message.args[0], 'Hello World.');
        }
      });
    } else {
      return false;
    }
    return true;
  };
};

module.exports = newInstance;