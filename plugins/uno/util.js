var formatCard = function (card, isColorblind) {
  var ec = "\x03";
  console.log(card);
  var cc = getColorNumber(card);
  var cb = "";
  if (isColorblind) cb = getColorName(card);
  return ec + cc + cb + "[" + card.value + "]" + ec;
};

var getColorName = function(card) {
  var color = "";
  switch (card.color) {
    case "r":
      color = "Red";
      break;
    case "g":
      color = "Green";
      break;
    case "b":
      color = "Blue";
      break;
    case "y":
      color = "Yellow";
      break;
  }
  return color;
}

var getColorNumber = function(card){
  var nbr = 15;
  switch (card.color) {
     case "r":
      nbr = 4;
      break;
    case "g":
      nbr = 3;
      break;
    case "b":
      nbr = 2;
      break;
    case "y":
      nbr = 8;
      break;
  }
  return nbr;
}

var shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var cardCompare = function(a,b) {
  if (a.color < b.color) {
    return -1;
  } else if (a.color > b.color){
    return 1;
  } else {
    if (a.value < b.value) {
      return -1;
    } else if (a.value > b.value) {
      return 1;
    }
    return 0;
  }
};

module.exports.shuffle = shuffle;
module.exports.compareCard = cardCompare;
module.exports.formatCard = formatCard;
module.exports.getColorNumber = getColorNumber;
module.exports.getColorName = getColorName;