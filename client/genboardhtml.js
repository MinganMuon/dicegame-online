// genboardhtml.js

// number: int from 2 to 13 - if 13, tile is the lock tile
function gentilehtml(color, number, clickhandler) {
  var bt = $("<div></div>");
  bt.addClass("tile-div");
  bt.attr("data-color", color);
  if (number === 13) {
    bt.html("+");
  } else {
    bt.text(number.toString());
  }
  bt.attr("data-number", number);
  bt.click(clickhandler);
  return bt;
}

function genboardhtml(clickhandler) {
  var bh = $("<div id='board-div'></div>").addClass("board-div");
  
  for (i = 2; i < 14; i++){
    bh.append(gentilehtml("red",i,clickhandler));
  }
  for (i = 2; i < 14; i++){
    bh.append(gentilehtml("yellow",i,clickhandler));
  }
  for (i = 12; i > 1; i--){
    bh.append(gentilehtml("green",i,clickhandler));
  }
  bh.append(gentilehtml("green",13,clickhandler));
  for (i = 12; i > 1; i--){
    bh.append(gentilehtml("blue",i,clickhandler));
  }
  bh.append(gentilehtml("blue",13,clickhandler));
  
  return bh;
}
