/*
 * Performs a "dice roll" based on user input. Assume '.' is the
 * trigger in the examples below: 
 *
 * Example single input  : .roll 1d10
 * Example single output : 1d10: 8
 *
 * Example multiple input  : .roll 1d10 2d20 
 * Example miltiple output : 1d10: 4 | 2d20: 12
 *
 * See helloworld.js for more  information on formatting of pluins. 
 */
var config = null;

module.exports.init = function(conf) {
  config  = conf;
};

module.exports.actions = [
  {
    'type': 'message#',
    'handler': function (callback, from, to, message) {
      if (message.args[1].indexOf(config.trigger + 'roll') === 0) {
        var finalMessage = "";
        var dice = message.args[1].split(' ');
        dice.forEach(function(die){
          if (/^\d+d\d+$/.test(die)){
            var currentSum = 0;
            var dieSplit = die.split('d');
            for (var i = 0; i < dieSplit[0]; i++) {
              currentSum += (Math.floor(Math.random() * parseInt(dieSplit[1], 10)) + 1);
            }
            finalMessage += finalMessage ?
              ' | ' + die + ': ' + currentSum :
              die + ': ' + currentSum;
          }
        });
        callback('say', message.args[0], finalMessage);
      };
    }
  }
];
