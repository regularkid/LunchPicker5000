// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

/*app.get("/oldIndex", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});*/

var server = app.listen(process.env.PORT);
var io = require('socket.io').listen(server);

users = {}

io.on('connection', function(socket){
  users[socket.id] = {}
  users[socket.id].id = socket.id;
  users[socket.id].name = "";
  users[socket.id].vote = "";
  users[socket.id].status = false;
  
  io.emit('users', users);
  
  socket.on('disconnect', function(){
        delete users[socket.id];
        io.emit('users', users);
    });
    
    socket.on('updateName', function(name){
        users[socket.id].name = name;
        io.emit('users', users);
    });
    
    socket.on('updateVote', function(vote){
        users[socket.id].vote = vote;
        io.emit('users', users);
    });
    
    socket.on('updateStatus', function(status){
        users[socket.id].status = status;
        io.emit('users', users);
    });
});