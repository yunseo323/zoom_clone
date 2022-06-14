import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug"); 
app.set("views",__dirname + "/views"); //express에 template이 어디있는지 지정
app.use("/public", express.static(__dirname + "/public")); //static 설정, puplic url 생성해 유저에게 보여지는 파일
app.get("/",(req,res)=>res.render("home")); //home.pug render
app.get("/*",(req,res)=>res.redirect("/")); // 유저가 어떤 주소로 들어와도 home으로 redirect 설정

const handleListen=()=> console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);//server 에서 웹소켓을 만들 수 있게 됨 => http 서버

const wss = new WebSocket.Server({server}); //서버를 굳이 넣지 않아도 됨. http 서버 위에 웹소켓 서버를 만듬

/*
function handleConnection(socket){
    //console.log(socket); //socket 출력되는 것 확인
    //socket에 접근할 수 있고, frontend와 real-time으로 소통할 수 있다
    //connection 이벤트가 발생하면 handleConnetcion 실행
    //익명 함수 사용하자
}
*/

//브라우저와 서버는 연결됨(밑 코드를 작성하지 않아도)
const sockets = [];
wss.on("connection",(socket)=>{ //연결 이벤트를 들음
    sockets.push(socket);
    socket["nickname"]="Anonymous"; // 익명으로 초기화
    console.log("Connected to User :)");
    socket.on("close",()=>console.log("Disconnected from the Browser"));
    socket.on("message",(m)=>{
        const message = JSON.parse(m);
        switch(message.type){
            case "new_message":
                sockets.forEach((aS)=>aS.send(`${socket.nickname}: ${message.payload.toString('utf8')}`)); // 전달받은 메시지를 각 브라우저에게 모두 보냄
                break;
            case "nickname":
                socket["nickname"] = message.payload; //소켓에 새로운 프로퍼티 추가
                break;
        }
    })
}); 
server.listen(3000,handleListen);
