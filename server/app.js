const express = require('express')
const app = express()
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const port = 4000

class Room {
  constructor(roomID) {
    this.name = roomID;
    this.members = new Map();
    this.musicList = [];
  }
  addMember(memberID, name){
    this.members.set(memberID, name);
  }
  addMusic(memberID, music){
    this.musicList.push({userID: memberID, music: music});
  }


}

let rooms = new Map();

//var birds = require('./bird');

app.use(cors());


//app.use('/birds', birds);
app.get('/getdata/:autor/:nome', async (req, res) => {
  console.log(req.params.autor, req.params.nome);
  try {
    const response = await axios.get(`https://www.cifraclub.com.br/${req.params.autor}/${req.params.nome}/imprimir.html#tabs=false&footerChords=false`)
    const $ = cheerio.load(response.data)
    $('.tablatura').remove()
    //res.send($)
    //console.log($('pre').toString())
    return res.send($('pre').toString())
    //res.send(response.data)
  } catch (error) {
    return res.status(404).json({})
    //console.log(error)
  }
});

server.listen(port, () => {
  console.log('listening on: ' + port);
});

// const server = app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// });


io.on('connection',(socket) => {
  //console.log(socket.id);
  let tempRoomID;
  socket.on('join-room', (data) =>{
    socket.join(data.roomID);
    console.log( data.name + " joined room: " + data.roomID);
    console.log(socket.id);
    if(!rooms.has(data.roomID)){
      let temp = new Room(data.roomID);
      temp.addMember(socket.id, data.name);
      rooms.set(data.roomID, temp);
    }else{
      let temp = rooms.get(data.roomID);
      temp.addMember(socket.id, data.name);
    }
    tempRoomID = data.roomID;
    io.to(data.roomID).emit("update-members", [...rooms.get(data.roomID).members].map(([key, value]) => ({ key, value })));
    console.log(rooms.get(data.roomID).musicList.length);
    if(rooms.get(data.roomID).musicList.length > 0){      
      io.to(socket.id).emit("update-music-list", rooms.get(data.roomID).musicList);
    }
    console.log(rooms.get(data.roomID).members)
  });

  socket.on('changing-music', (data) =>{
    socket.to(data.roomID).emit("update-page", data.music);
  });

  socket.on('add-music', (data) => {
    rooms.get(data.roomID).addMusic(socket.id, data.music);
    console.log(rooms.get(data.roomID).musicList);
    io.to(data.roomID).emit("update-music-list", rooms.get(data.roomID).musicList);
  });

  socket.on('disconnect', () =>{
    console.log('user dced');
    if(rooms.has(tempRoomID)){
      let temp = rooms.get(tempRoomID);
      if(temp.members.has(socket.id)){
        temp.members.delete(socket.id);
        socket.to(tempRoomID).emit("update-members", ...rooms.get(tempRoomID).members);
        if(temp.members.size == 0){
          rooms.delete(tempRoomID);
        }
      }
    }
  });
});