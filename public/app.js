


function loadData(){
    return fetch("http://localhost:3000/home");
}


var app = new Vue({
    el: '#app',
    data: {
        // LOBBY MODE
        lobbyMode: true,
        playerName : "",
        players : [],
        gameReadyToStart : false,
        //MESSAGES FROM SERVER
        receivedMessages : [],
        // GAME MODE
        gameMode: false,
        correctNumber: null,
        submission: "",
        scoreMode: false,
        playerSubmissions: 0,
        playerOneScore: "",
        playerTwoSocre: "",
        playerOneWon: false,
        playerTwoWon: false,
        playersTied: false,
        playerOneName: "",
        playerTwoName: ""

        
        






    },
    methods: {
        submitName: function(){
            var data = {
                action: "newPlayerJoined",
                playerName: this.playerName
            }
            this.sendMessage(data);
        },
        startGame: function(){
            var data = {
                action: "start game"
            }
            this.sendMessage(data);
        },

        submitAnswer: function(){
            console.log("submission by", this.playerName);
            var result = this.checkAnswer(this.submission, this.correctNumber);
            console.log(result);
            var data = {
                action: "newSubmission",
                submissionName: this.playerName,
                correct: result 
            }
            this.sendMessage(data);
        },
        checkAnswer: function(userAnswer, correctAnswer){
            parseInt(userAnswer);
            parseInt(correctAnswer);
            if (userAnswer == correctAnswer){
                return true;
            }
            else{
                return false
            }
        },

        getData: function(){
            loadData().then((response)=>{
                this.players = [];
            })
        },

        // CONNECTING TO THE SOCKET
        connectSocket: function(){
            this.socket = new WebSocket("ws://localhost:3000");
            this.socket.onmessage = (event) =>{
                this.receiveMessage(event);
            }
        },

        receiveMessage: function(){
            var data = JSON.parse(event.data);
            this.receivedMessages.push(data);
            // console.log(this.receivedMessages);
            if (data.action == "playerOneJoined"){
                // this.playerOneName = data.playerName;
                var playerOne = {
                    playerName: data.playerName,
                    playerPosition: data.playerPosition
                }
                this.players.push(playerOne);
            }
            else if(data.action == "playerTwoJoined"){
                // this.playerTwoName = data.playerName;
                var playerTwo = {
                    playerName: data.playerName,
                    playerPosition: data.playerPosition
                }
                this.players.push(playerTwo);
                this.gameReadyToStart = true;
            }

            else if(data.action == "game-ready"){
                console.log("game ready");
                this.correctNumber = data.number;
                this.lobbyMode = false;
                this.gameMode = true;
                console.log(this.correctNumber)
            }

            else if (data.action == "player-submission"){
                console.log(data);
                this.playerSubmissions += 1;
                if (data.playerPosition == 1){
                    this.playerOneScore = data.playerScore;
                    this.playerOneName = data.playerName;
                    
                }
                if (data.playerPosition == 2){
                    this.playerTwoScore = data.playerScore;
                    this.playerTwoName = data.playerName;


                }
                if (this.playerSubmissions == 2){
                    
                    if (this.playerOneScore > this.playerTwoScore){
                        this.playerOneWon = true;
                    }

                    if (this.playerTwoScore > this.playerOneScore){
                        this.playerTwoWon = true;
                    }
                    
                    if (this.playerOneScore == this.playerTwoScore){
                        this.playersTied = true;
                    }
                    this.scoreMode = true;
                    var data = {
                        action: "gameEnded" 
                    }
                    this.sendMessage(data);
                    
                }
                

            }


            
        },
        sendMessage: function(data){
            data = JSON.stringify(data);
            this.socket.send(data);
        },
    },
    created: function(){
        console.log("Vue js loaded");
        this.getData();
        this.connectSocket();
    }





   
});

