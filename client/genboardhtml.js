// genboardhtml.js

// number: int from 2 to 13 - if 13, tile is the lock tile
function gentilehtml(color, number, clickhandler, row) {
  var bt = $("<div></div>");
  bt.addClass("tile-div");
  bt.addClass("unselectable");
  bt.attr("data-color", color);
  if (number === 13) {
    bt.html("+");
  } else {
    bt.text(number.toString());
  }
  bt.attr("data-number", number);
  bt.attr("data-row", row);
  bt.on('click', clickhandler);
  return bt;
}

function genboardhtml(clickhandler) {
  var bh = $("<div id='board-div'></div>").addClass("board-div");
  
  for (i = 2; i < 14; i++){
    bh.append(gentilehtml("red",i,clickhandler, 0));
  }
  for (i = 2; i < 14; i++){
    bh.append(gentilehtml("yellow",i,clickhandler, 1));
  }
  for (i = 12; i > 1; i--){
    bh.append(gentilehtml("green",i,clickhandler, 2));
  }
  bh.append(gentilehtml("green",13,clickhandler, 2));
  for (i = 12; i > 1; i--){
    bh.append(gentilehtml("blue",i,clickhandler, 3));
  }
  bh.append(gentilehtml("blue",13,clickhandler, 3));
  
  return bh;
}
