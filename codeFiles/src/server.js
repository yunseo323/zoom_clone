import http from "http";
import {Server} from "socket.io"
import express from "express";

const app = express();

app.set("view engine", "pug"); 
app.set("views",__dirname + "/views"); //express에 template이 어디있는지 지정
app.use("/public", express.static(__dirname + "/public")); //static 설정, puplic url 생성해 유저에게 보여지는 파일
app.get("/",(req,res)=>res.render("home")); //home.pug render
app.get("/*",(req,res)=>res.redirect("/")); // 유저가 어떤 주소로 들어와도 home으로 redirect 설정

const httpServer = http.createServer(app);
const io = new Server(httpServer); //socket.io 서버 만들어주기

function publicRooms(){
    const{
        sockets:{
            adapter: {sids,rooms},
        },
    } = io;
    /*
    //위와 동일한 코드
    const sids = io.sockets.adapter.sids;
    const rooms = io.sockets.adapter.rooms;
    */
   const publicRooms=[];
   rooms.forEach((_, key)=>{ //value(_)는 신경쓰지 않음
       if(sids.get(key)===undefined){
           publicRooms.push(key);
       }
   });
   return publicRooms;
}
function countRoom(roomName){
    return io.sockets.adapter.rooms.get(roomName)?.size; //가끔 roomName이 아닐수도 있음
}
io.on("connection",socket => { //서버에서 connection 받을 준비 완료
    socket["nickname"] = "anonymous";
    socket.on("nickname",(nickname)=>socket["nickname"] = nickname);
    socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));
        io.sockets.emit("room_change", publicRooms());//모든 소켓에 전달
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room=>
            socket.to(room).emit("bye",socket.nickname, countRoom(room)-1)); //bye 이벤트 emit, 떠나기 직전이니 -1을 해줌
    });
    socket.on("disconnect",()=>{
        io.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done(); 
    });
});

const handleListen=()=> console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);
