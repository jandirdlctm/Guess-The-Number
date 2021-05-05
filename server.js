const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

var app = express();

app.use(cors());
app.use(express.static('public'));


app.get('/home', function(req, res){
  console.log("we got hit");
  playerObject = [];
  res.sendStatus(200);
})


const port = process.env.PORT || 3000;

var server = app.listen(port, function(){
  console.log("Server is listening on port", port)
})


// Start websocket server code 

const wss = new WebSocket.Server({server: server});


var players = 0;
var playerObject = [];


function broadcastToAllClients(data){
  wss.clients.forEach(function each(client){
    if (client.readyState === WebSocket.OPEN){
      client.send(JSON.stringify(data));
    }
  })
}

wss.on('connection', function(wsclient) {
    console.log("A new client just connected");

    // when a message is sent
    wsclient.on('message', function(data){
      data = JSON.parse(data);
      console.log(data);
      if (data.action == "newPlayerJoined"){
        // this is the first player
        if (playerObject.length == 0){
          var newPlayer ={
            playerName : data.playerName,
            playerPosition: 1,
            score: 0
          }
          playerObject.push(newPlayer);
          console.log(playerObject.length)
          var serverMessage = {
            action: "playerOneJoined",
            playerName: newPlayer.playerName,
            playerPosition: newPlayer.playerPosition
          }
          broadcastToAllClients(serverMessage);
        }
        // PLAYER 2
        else if (playerObject.length == 1){
          var newPlayer = {
            playerName: data.playerName,
            playerPosition: 2,
            score: 0
          }
          playerObject.push(newPlayer);
          console.log(playerObject.length);
          var serverMessage = {
            action: "playerTwoJoined",
            playerName: newPlayer.playerName,
            playerPosition: newPlayer.playerPosition
          }
          broadcastToAllClients(serverMessage)
        }
      }
      // GAME READY
      else if (data.action == "start game"){
        var randomNumber = Math.floor(Math.random()*10);
        var serverMessage = {
          action: "game-ready",
          number: randomNumber
        }
        broadcastToAllClients(serverMessage);
      }
      //SUBMISSIONS
      else if (data.action == "newSubmission"){
        console.log(playerObject.length);
        for (var i = 0; i < playerObject.length; i++){
          if (data.submissionName == playerObject[i].playerName){
            console.log("data.correct", data.correct);
            if (data.correct){
              playerObject[i].score += 1;
            } 
            var serverMessage = {
              action: "player-submission",
              playerName: data.submissionName,
              playerPosition: playerObject[i].playerPosition,
              playerScore: playerObject[i].score
            }
            broadcastToAllClients(serverMessage);
          }
        }
      }
      else if (data.action == "gameEnded"){
        playerObject = []
      }

    })
    

    
});

// End websocket server code

