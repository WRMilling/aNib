/**
 * This is a rather hacked togeather implementation of the game UNO. It was
 * created in response to a friend who is colorblind and the current UNO bot we
 * were using didn't natively support any sort of colorblind mode. I didn't
 * really want to mess with the existing code and figured this would be a fun
 * little side project to build.
 *
 * There is still a bit to go, thre play card logic is a little shaky at best,
 * there are TODO lines at the bottm of the file detailing what I know. I will
 * hopefully have it cleaned up over the next few days.
 */

var config = null,
    fullDeck = require('./uno/deck.json'),
    util = require('./uno/util.js');

var owner,players,order,deck,discard,hasDrawnCard,
    direction = 1,
    position = -1,
    isGameRunning = false;

var prepareNewGame = function(requestor, callback) {
  if (!isGameRunning) {
    owner = requestor;
    players = {};
    discard = [];
    order = [];
    callback('say', config.gameChannel, requestor + " has started a new game of UNO! Tyle !join to get in on the action.");
  } else {
    callback('say', config.gameChannel, requestor + ", a game is currently running.");
  }
};

var startGame = function(requestor, callback) {
  if (isGameRunning) {
    callback('say', config.gameChannel, "A game is currently running. Please wait for it to finish.");
  } else if (!owner) {
    callback('say', config.gameChannel, "Open the deck of cards first, type !uno.");
  } else if (order.length < 1) {
    callback('say', config.gameChannel, "You do not have enough players, get a friend.");
  } else if (requestor !== owner) {
    callback('say', config.gameChannel, "Please ask " + owner + " to start the game, they requested it.");
  } else {
    deck = util.shuffle(JSON.parse(JSON.stringify(fullDeck)));
    console.log(deck);

    // Go for 7 rounds of dealing
    for (var i = 0; i < 7; i++) {
      // Deal a single card to each player
      for (var j = 0; j < order.length; j++) {
        drawCard(order[j], 1, true, callback, true);
      }
    }
    discard = discard.concat(deck[deck.length-1]);
    deck.pop();
    callback('say', config.gameChannel, "Game starting. May the odds be ever in your favor.");
    nextPlayer(callback);
    isGameRunning = true;
  }
};

var nextPlayer = function(callback, preamble, drawSkip, nbrOfCards) {
  preamble = preamble || "";
  position += direction;
  if (position < 0) position = order.length;
  if (position > (order.length - 1)) position = 0;
  var currentPlayer = order[position];
  if (drawSkip) {
    if (nbrOfCards) {
      drawCard(currentPlayer, nbrOfCards, false, callback);
      preamble = currentPlayer + " has drawn " + nbrOfCards + " cards. ";
    } else {
      preamble = currentPlayer + " has been skipped. ";
    }
    nextPlayer(callback, preamble, false);
  } else {
    callback('say', config.gameChannel, preamble + currentPlayer + "'s turn.");
    callback('say', config.gameChannel, topCard(false));
    showCards(currentPlayer, callback);
  }
  hasDrawnCard = false;
};

var drawCard = function(player, nbrOfCards, isSilent, callback, bypassCheck) {
  // Get current player
  if (order[position] === player || bypassCheck) {
    hasDrawnCard = true;
    var currentPlayer = players[player];
    var displayCards = "";
    if (!isSilent) {
      currentPlayer.hand = currentPlayer.hand.sort(util.compareCard);
    }
    console.log(nbrOfCards);
    for (var i = 0; i < nbrOfCards; i++) {
      if (deck.length === 0) {
        deck = discard.slice(0, (discard.length - 1));
        discard = discard.slice((discard.length - 1), 1);
        deck = util.shuffle(deck);
      }
      var card = deck[deck.length-1];
      // If deck has been re-shuffled, make sure card cannot have preset color
      if (card.value === "W" || card.value === "WD4") card.color = false;
      // Add the top card to hand
      currentPlayer.hand = currentPlayer.hand.concat(card);
      // Add to our response
      displayCards += util.formatCard(card, currentPlayer.isColorblind);
      // Remove top card from deck
      deck.pop();
    }
    if (!isSilent) {
      callback('say', player, "Card(s) drawn: " + displayCards);
    }
  } else if (order[position]) {
    callback('say', config.gameChannel, "It is not your turn, " + player + ".");
  } else {
    callback('say', config.gameChannel, "You are not in the game, " + player + ".");
  }
};

var addPlayer = function(player, callback) {
  if (order.length === 10){
    var response = "Game is full.";
    if (!isGameRunning) {
      response += " Ask " + owner + " to start it.";
    }
    callback('say', config.gameChannel, response);
  } else if (players[player]) {
    callback('say', config.gameChannel, player + ", you are already in the game.");
  } else {
    order.push(player);
    players[player] = {
      "hand" : [],
      "isColorblind": false
    };
    callback('say', config.gameChannel, player + " has been addeed to the game. They are in position #" + order.length);
    if (isGameRunning) {
      drawCard(player, 7, true);
      showCards(player, callback);
    }
  }
};

var removePlayer = function(player, callback) {
  if (undefined !== players[player]) {
    var currentPlayer = players[player];
    deck = deck.concat(currentPlayer.hand);
    order.splice(order.indexOf(player),1);
    callback('say', config.gameChannel, player + " has been removed from the game.");
  } else {
    callback('say', config.gameChannel, player + ", you are not in the game already. Why did you want me to remove you from something you are not even doing?");
  }
};

var showCards = function (player, callback) {
  if (players[player]) {
    var currentPlayer = players[player];
    var displayHand = "Current Hand:";
    currentPlayer.hand.sort(util.compareCard);
    for (var i = 0; i < currentPlayer.hand.length; i++) {
      displayHand += " " + util.formatCard(currentPlayer.hand[i], currentPlayer.isColorblind);
    }
    if (currentPlayer.isColorblind) {
      callback('say', player, topCard(true));
    }
    callback('say', player, displayHand);
  }
};


var setColorblindMode = function (player, callback) {
  if (undefined !== players[player]){
    var currentPlayer = players[player];
    currentPlayer.isColorblind = !currentPlayer.isColorblind;
    callback('say', player, "Colobrlind mode is now set to " + currentPlayer.isColorblind);
  }
};

var playCard = function (player, card, callback) {
  card = card.toLowerCase();
  card = card.split(" ");//.splice(0,1);
  console.log(card);
  console.log(discard[discard.length-1]);
  console.log(currentPlayer);
  var currentPlayer = players[player];
  if (card.length === 3) {
    var color = false, value = false, isSpecial = false;
    for (var i = 1; i < 3; i++){
      var current = card[i].toLowerCase();
      if (/[r|g|b|y]/.test(current) && !color) {
        color = current;
      } else if (/[0-9|d2|s|w|wd4|r|s]/.test(current) && !value) {
        value = current;
      }
      if (/[w|wd4]/.test(current)) {
        isSpecial = true;
      }
    }
    if (null !== color && null !== value) {
      var topOfDiscard = discard[discard.length - 1];
      var hasCard = false;
      for (var i = 0; i < currentPlayer.hand.length; i++) {
        var pCard = currentPlayer.hand[i];
        if (pCard.color === color && pCard.value === value) {
          hasCard = true;
          if (pCard.color === topOfDiscard.color || pCard.value === topOfDiscard.value) {
            _playCard(player, pCard, i, callback);
          } else {
            callback ('say', config.gameChannel, player + ", you can't play that card right now.");
          }
          break;
        } else if (isSpecial && pCard.value.toLowerCase() === value) {
          hasCard = true;
          if ((value === "d2" || value === "s") && pCard.color === color && (topOfDiscard.color === color || topOfDiscard.value.toLowerCase() === value)) {
            _playCard(player, pCard, i, callback);
          } if (value ==="w" || value === "wd4") {
            pCard.color = color;
            _playCard(player, pCard, i, callback);
          } else {
            callback ('say', config.gameChannel, player + ", you can't play that card right now.");
          }
          break;
        }
      }
      if (!hasCard) {
        callback('say', config.gameChannel, player + ", you don't have that card.");
      }
    }
  }
};

var _playCard = function(player, card, index, callback) {
  var skip = false;
  var drawNbr = null;
  var cardValue = card.value.toLowerCase();
  if (cardValue === "d2") {
    callback('say', config.gameChannel, player + " plays " + util.formatCard(card, false) + ".");
    skip = true;
    drawNbr = 2;
  } else if (cardValue === "s" ) {
    callback('say', config.gameChannel, player + " plays " + util.formatCard(card, false) + ".");
    skip = true;
  } else if (cardValue === "w") {
    callback('say', config.gameChannel, player + " plays a Wild! Color changed to " + util.getColorName(card) + ".");
    skip = false;
  } else if (cardValue === "wd4") {
    callback('say', config.gameChannel, player + " plays a Wild Draw 4! Color changed to " + util.getColorName(card) + ".");
    skip = true;
    drawNbr = 4;
  } else {
    callback('say', config.gameChannel, player + " plays " + util.formatCard(card, false) + ".");
  }
  discard.push(card);
  players[player].hand.splice(index, 1);
  nextPlayer(callback, null, skip, drawNbr);
};

var topCard = function (isColorblind) {
  console.log(discard);
  console.log(discard.length);
  return "Top Card: " + util.formatCard(discard[discard.length-1], isColorblind);
};

var pass = function(player, callback) {
  if (player === order[position]) {
    if (hasDrawnCard) {
      nextPlayer(callback, player + " passed. ", false);
    } else {
      callback('say', config.gameChannel, "You must !draw before you can !pass.");
    }
  } else {
    callback('say', config.gameChannel, "Not your turn, " + player + "!");
  }
};

var showUserTopCard = function(player, callback) {
  if (players[player]) {
    var currentPlayer = players[player];
    if (currentPlayer.isColorblind) {
      callback('say', player, topCard(true));
    }
    callback('say', config.gameChannel, topCard(false));
  }
};

var handleMessages = function (from, message, callback) {
  var key = message.toLowerCase().split(" ")[0].substring(1,message.length);
  switch(key) {
    case "uno":
      prepareNewGame(from, callback);
      break;
    case "deal":
      startGame(from, callback);
      break;
    case "draw":
      if (isGameRunning) drawCard(from, 1, false, callback);
      break;
    case "join":
      addPlayer(from, callback);
      break;
    case "leave":
      removePlayer(from, callback);
      break;
    case "play":
      if (isGameRunning) playCard(from, message, callback);
      break;
    case "pass":
      if (isGameRunning) pass(from, callback);
      break;
    case "showcards":
      if (isGameRunning) showCards(from, callback);
      break;
    case "topcard":
      if (isGameRunning) showUserTopCard(from, callback);
      break;
    case "colorblind":
      setColorblindMode(from, callback);
      break;
    case "help":
      //TODO: Implement Help Functionality
      break;
  }
};

//TODO: Game Finish Logic
//TODO: One card left logic
//TODO: Leaderboard
//TODO: File IO for leaderboard. Read the file, parse the json
//TODO: Write thre file, re-read. Do all Async
//TODO: Make sure a Wild/Special card cannot be top card at beginning of game
//TODO: Implement !count command
//TODO: remove dependency on config.uno
//TODO: Implement multiple channel games.

module.exports.actions = [
  {
    'type': 'message#',
    'handler': function(callback, from, to, message) {
      console.log(message);
      if (message.args[1].indexOf(config.trigger) > -1
        && config.gameChannel === message.args[0]) {
            handleMessages(message.nick, message.args[1], callback);
      }
    }
  }
];

module.exports.init = function(conf) {
  config = conf.uno;
};