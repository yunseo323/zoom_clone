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

io.on("connection",socket => { //서버에서 connection 받을 준비 완료
    socket["nickname"] = "anonymous";
    socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname);
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room=>socket.to(room).emit("bye",socket.nickname)); //bye 이벤트 emit
    });
    socket.on("nickname",(nickname)=>socket["nickname"] = nickname);
    socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done(); 
    });
});

const handleListen=()=> console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);
