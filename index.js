var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require('mongoose');
//var connections = require('./modules/chat');
var uniqueUser = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/view/index.html');
});

mongoose.connect('mongodb://localhost/blah', function(err) {
    if (err) {
        console.log('Error ! mongodb not connected');
    } else {
        console.log('success ! mongodb is connected');
    }
});

var blahSchema = mongoose.Schema({
    name: String,
    msg: String,
    date: { type: Date, default: Date.now }
});

var Blah = mongoose.model('Message', blahSchema);

io.on('connection', function(socket) {
    Blah.find({}, function(err, docs){
        if(err) throw err;
        socket.emit('saved messages', docs);
    });
    socket.on('usernames', function(data, callback) {
        if (data.trim() !== "") {
            if (data in uniqueUser) {
                callback(false);
            } else {
                callback(true);
                socket.uniqueUser = data;
                uniqueUser[socket.uniqueUser] = socket;
                io.emit('usernames', Object.keys(uniqueUser));
            }
        } // if data not empty
    });
    socket.on('send message', function(data, callback) {
        var str = data.trim();
        if (str.substr(0, 2) == "..") {
            var space = str.indexOf(' '); // after user name 
            var client = str.substr(0, space);
            var name = client.substr(2);
            str = str.substr(space);
            //   console.log("before :"+ str.trim().length);         
            if (name in uniqueUser) {
                uniqueUser[name].emit('private', { name: socket.uniqueUser, msg: str });
            } else {

                callback('Error ! Please enter a valid name');
            }

        } else {
            if (!str) return;
            var newBlah = new Blah({  name: socket.uniqueUser, msg: str });
            newBlah.save(function(err) {
                if (err) throw err;
                io.emit('send message', { name: socket.uniqueUser,  msg: str });
            });
        }
    });


    socket.on('disconnect', function(data) {
        if (!socket.uniqueUser) return;
        delete uniqueUser[socket.uniqueUser]; // delete the user on disconnect
        io.emit('usernames', Object.keys(uniqueUser));
    });
}); // end connection



http.listen(8080, function() {
    console.log("Sever listen on port 8080");
});