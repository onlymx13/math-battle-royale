const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require('fs');

var serverNumber = Math.random();
var allClients = [];
var inRoomArray = [];
var ids = [];
var gameInProgress = false;
var nextId = 0;
var questionCount = 1;
var healthArray = [];
var questions;
var currQuestion;
var questionInterval;

fs.readFile('questions', function(err, data) {
  if (err) throw err;
  questions = data.toString().split('\n');
  questions.pop();
  if (!questions[questions.length-1]) {
    console.log("Warning: Questions file ends with a newline");
    questions.pop();
  }
  if (questions.length % 2) {
    throw new TypeError("Questions and answers not aligned in file. File has odd number of lines.");
  }
  console.log("Questions initialized");
});

function randomQuestionNumber() {
  return 2 * Math.floor(Math.random() * questions.length / 2);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  allClients.push(socket);  
  inRoomArray.push(0);
  if (!gameInProgress) {
    healthArray.push(2);
  } else {
    healthArray.push(0); // if a game is already going on, don't pollute the health
  }
  ids.push(nextId);
  io.emit('takeThisId', nextId++, serverNumber);
  io.emit('updatePlayerCount', allClients.length, sumArray(inRoomArray), gameInProgress);
  console.log("A user has joined.");
  socket.on('gotCorrect', function(id) {
    console.log("Player " + id + " got it correct!");
  });
  socket.on('gotIncorrect', function(id) {
    console.log("Player " + id + " oofed it!");
    if (--healthArray[ids.indexOf(id)] < 1) {
      socket.emit('die', id);
    }
  });
  socket.on('disconnect', function() {
    inRoomArray.splice(allClients.indexOf(socket), 1);
    ids.splice(allClients.indexOf(socket), 1);
    healthArray.splice(allClients.indexOf(socket), 1);
    allClients.splice(allClients.indexOf(socket), 1);
    io.emit('updatePlayerCount', allClients.length, sumArray(inRoomArray), gameInProgress); 
    console.log("A user has disconnected!");

  });
  socket.on('joinRoom', function(id) {
    console.log("Player " + id + " joined the room.");
    inRoomArray[ids.indexOf(id)] = 1;
    io.emit('updatePlayerCount', allClients.length, sumArray(inRoomArray), gameInProgress); 
    if (sumArray(inRoomArray) >= 3 && !gameInProgress) {
    gameInProgress = true;
    io.emit('gameBeginning', allClients.length);
    askQuestion();
    questionInterval = setInterval(askQuestion,20000);
    }
  });
});

function calculateHealths() {
  console.log(healthArray);
  var list = new Array(1 + Math.max(...ids)); // there's a faster way to find the max. StackOverflow Find the min/max element of an Array in JavaScript
  for (var i = 0; i < list.length; i++) {
    if (ids.includes(i)) {
      list[i] = healthArray[ids.indexOf(i)];
    } else {
      list[i] = 0;
    }
  }
  var num = 0;
  var winner;
  list.forEach(function(element) {
    if (element) {
      num++;
      winner = list.indexOf(element);
    }
  });
  if (num === 1) {
    clearInterval(questionInterval);
    console.log(winner + " won!");
    gameInProgress = false;
    inRoomArray = inRoomArray.map(function() {
      return 0;
    });
    io.emit('updatePlayerCount', allClients.length, sumArray(inRoomArray), gameInProgress);
    questionCount = 1;
    io.emit('winner', winner);
    healthArray = healthArray.map(x => 2);
  } else if (num === 0) {
    clearInterval(questionInterval);
    console.log("Everybody lost!")
    gameInProgress = false;
    inRoomArray = inRoomArray.map(function() {
      return 0;
    });
    io.emit('updatePlayerCount', allClients.length, sumArray(inRoomArray), gameInProgress);
    questionCount = 1;
    io.emit('winner', 'nobody');
    healthArray = healthArray.map(x => 2);
  }

  io.emit('healthsAre', list);
}
function askQuestion() {
  calculateHealths();
  currQuestion = randomQuestionNumber();
  io.emit('question', questionCount++, questions[currQuestion]);
  setTimeout(endQuestion,15000);
}

function endQuestion() {
  calculateHealths();
  io.emit('endQuestion', questions[currQuestion + 1]);
}

function sumArray(array) {
  return array.reduce(function(a,b) {
    return a + b;
  }, 0);
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
