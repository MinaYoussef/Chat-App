var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

function connections() {
    io.on('connection', function(socket){
   socket.on('usernames', function(data, callback){
       if(uniqueUser.indexOf(data) != -1){
           callback(false);
       }else{
           callback(true);
           socket.uniqueUser = data;
           uniqueUser.push(socket.uniqueUser);
           io.emit('usernames', uniqueUser);
       }
   });
  socket.on('send message', function(data){
      console.log(socket.uniqueUser);
        io.emit('send message', {msg: data, name: socket.uniqueUser});
    });
    
     
  socket.on('disconnect', function(data){
           if(!socket.uniqueUser) return;
           uniqueUser.splice(uniqueUser.indexOf(socket.uniqueUser), 1);
           io.emit('usernames', uniqueUser);
       });
}); // end connection
    
}

module.exports = connections;
