# Design and brainstorming

## client side
client connects
  displays title, choice to join or make a game
  if join
    new view - two fields, name and game id, and join game button
  if make
    new view - one field, name, and create game button
  once joined/made a game, show stats on game id and names of players joined
    client who made the game has a start game button
  when game starts
    clear screen
    FOR TESTING: show game title (and stop game button for client who made the game)
  when game stops
    go back to title screen

## server side
when client connects
  when client wants to make a game
    create new room with a random room id
    add client to room with given name
  when client wants to join a game (room)
    if room exists and game has not already started
      add client to given room with given name
  tell client join/make was successful
    broadcast to whole room the updated number of players
  when game starts
    tell room game is starting
    FOR TESTING: broadcast to whole room game title
  when client who made game wants to stop game
    broadcast to whole room that game is stopping
    remove all players from room
    delete room
