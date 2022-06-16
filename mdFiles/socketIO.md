# SocketIO

## 1. SocketIO란?(WebSocket과의 차이)

SocketIO는 웹소켓을 실행하는 것이 아니다. (= SocketIO는 웹소켓의 부가기능이 아니다!)

=> SocketIO는 프레임워크인데 실시간, 양방향 이벤트 기반 통신을 제공한다. (여러 선택지 중 웹소켓이 있다)

=> SocketIO는 웹소켓보다 탄력성이 뛰어나서 (웹소켓에 문제가 생겨도 SocketIO는 다른 기능을 이용해서 구현함) 유저에게 신뢰성을 준다. 
(자동 재연결 지원, 연결 끊김 확인, 바이너리 지원 등등..)

## 2. SocketIO 설치

웹소켓을 쓰는 것보다 SocketIO를 쓰면 한번에 간단하게 처리되는 것들이 있다.

- `$npm i socket.io`
- 웹소켓 서버를 만들 때 http 서버를 만들고 그 위에 웹소켓 서버를 올렸다. SocketIO도 마찬가지
- `import {Server} from "socket.io"`, `const io = new Server(httpServer)`
- 위처럼 import하는 것만으로 localhost:3000은 url을 제공하게 된다 -> `localhost:3000/socket.io/socket.io.js`
- socketIO는 웹소켓을 사용할 수 없을 때 다른 기능을 이용할 것이고, socketIO를 서버에 설치한 것처럼 클라이언트에도 설치해야 함
    - 웹소켓 사용했을 때: `const socket = new WebSocket()` -> 브라우저가 제공하는 웹소켓 api를 사용함
    - 하지만 브라우저가 주는 웹소켓은 socketIO와 호환이 되지 않음
    - 클라이언트(=브라우저)에도 socketIO를 설치하자!

**home.pug**

- 클라이언트에 socketIO 설치: `script(src="/socket.io/socket.io.js")`
- `io`라는 function을 확인할 수 있음 : io는 자동적으로 back-end socketIO와 연결해준다
    - `const socket = io()`
- socket을 추가하고 싶으면 socket.id 

## 3. SocketIO 실행하고 이해하기

**home.pug**
- socketIO에는 room 기능이 있다
- home.pug에서 form부터 만들자
    -  방 생성 유무에 상관없이 방에 들어가게끔 기능

**app.js**
- `socket.emit()` : socket.send와 비슷한 기능
    - 커스텀 이벤트를 emit 할 수 있다 (handleRoomSubmit에서는 "enter_room"을 emit 하고 있다)
    - send는 string만 보냈다면, emit은 객체또한 보낼 수 있다
    - emit으로 여러가지를 보낼 수 있고, on으로 받을 수 있다
- `socket.on()` : 이벤트 받아서 처리하기
```JS
//app.js
socket.emit("enter_room",
    {payload: input.value},
    5,
    "hello",
    12345,
    true
    );

//server.js
socket.on("enter_room",(a,b,c,d,e)=>{
    console.log(a,b,c,d,e); //{payload: input.value},5,"hello",12345,true :  그대로 출력됨
})
```
```JS
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",{payload: input.value});
    input.value="";
}
```
- emit()에서 마지막  인자로 콜백 함수를 넘길 수 있다 -> (이벤트명, 보낼 값, 콜백 함수)
    - 단순히 콜백함수가 아니라, `서버에서 호출할 수 있는 함수`이다
    - 프론트에서 함수를 정의하지만, 서버에서 호출할 수 있는 함수인 것이다
    - `서버에서 호출`하는 것이고, `프론트에서 실행` 된다 => 서버에서 실행하는 것이 아님!!!(헷갈리지 말자)
    - 서버에서 argument를 넘길 수도 있다
    - 사용예시: socket에서 메시지를 받고 싶을 때, 시간이 오래걸리는 작업 시 프론트에 작업이 완료되었다고 알리고 싶다
```JS
//server.js
io.on("connection",socket => { //서버에서 connection 받을 준비 완료
    socket.on("enter_room",(msg,done)=>{
        //console.log(msg)
        setTimeout(()=>{
            console.log(msg);
            done("hello from the backend"); //done 함수에 argument를 넘김
        },5000);
    });
});

//app.js
socket.emit("enter_room",{payload: input.value},(m)=>{ //익명함수 done에서 argument 받음
        console.log(`backend says : ${m}`);
    });


=> 결과: 브라우저 콘솔에서 "backend says : hello from the backend"  찍히는 것 확인
```

**server.js**
- socket.on()에 message가 아닌 우리가 만든 커스텀 이벤트를 작성할 수 있다 (위의 "enter_room")
```JS
io.on("connection",socket => { //서버에서 connection 받을 준비 완료
    socket.on("enter_room",msg=>console.log(msg)); //어떠한 이벤트 name이든 가능
});
```
- 위 코드를 실행하면 app.js에서 작성한 것처럼 `{ payload: 'yunroom' }` 과 같이 객체(not String!!)가 전달되는 것을 확인할 수 있다


## 4. room 생성

채팅 뿐만 아니라 다른 소통을 할 수 있는 socket 그룹 : room이 필요함 (ex. chat room, game, delievery...)

- SocketIO는 기본적으로 room을 제공한다
    - `socket.join("room 이름")` : room 이름으로 room에 참가할 수 있음, 여러방에 참가할 수 있음
    - `socket.leave("room 이름")` : room을 나감
    - `socket.rooms`: socket이 어떤 room에 있는지 보여줌
    - `socket.to("room 이름")`: room 전체에 메시지를 보냄, private 메시지도 보낼 수 있음
    - socket에는 id가 존재
    - `socket.onAny`: any(어떤) 이벤트에서든지 작동함
- user id와 user가 있는 방의 id는 같다
    - user는 기본적으로 이미 방에 들어가 있음(소켓은 기본적으로 유저와 서버사이에 private room이 있기 때문이다)

```JS
 socket.on("enter_room",(roomName,done)=>{
        console.log(socket.id); //Dom_LxsdRxv76nujAAAB
        console.log(socket.rooms);//Set(1) { 'Dom_LxsdRxv76nujAAAB' }
        socket.join(roomName);
        console.log(socket.rooms); //Set(2) { 'Dom_LxsdRxv76nujAAAB', { payload: '1' } }
        setTimeout(()=>{
            console.log(roomName); //{ payload: '1' }
            done("hello from the backend");
        },5000);
    });
``` 

위 메서드들을 이용해 기능을 구현해 보자

- 방에 참가하면 form을 숨기고 방을 보여준다 (.hidden 사용하기)
- roomName을 띄우자
    - 클라이언트에서 emit을 호출하고, (다음코드)roomName = input.value 를 실행하는데 "" 초기화 하기 전에 서버에서 done()이 호출되면서 showRoom을 실행해 roomName을 가져온다
    - 그러나 혹시모를 속도를 위해 roomName = input.value; 코드를 emit 전에 해두자
```JS
//app.js
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
}
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    roomName = input.value;
    socket.emit("enter_room",{payload: input.value},showRoom);
    //roomName = input.value;
    input.value="";
}
```

## 5. room에서 메시지 보내기

- user가 방에 참가하면 방에 있는 모든 사람들에게 메시지를 보내자
    - welcome event(커스텀이벤트)를 roomName에 있는 모든 사람들에게 emit 하자
    - `socket.to(roomName).emit("welcome")` 
    - 이 `socket.to()`는
- `socket.on()`으로 클라이언트에서 welcome 이벤트 듣기
```JS
socket.on("welcome",()=>{
    addMessage("Someone Joined!")
})
```
- 이처럼 꼭 콜백으로 넘겨야 '나'를 제외한 다른 브라우저 모두에게 작동된다 (그냥 실행하면 '나'에게도 메시지가 옴) => **이 부분 더 자세하기 이해하기**

예시 이해) 크롬과 사파리에서 같은 'yun'이라는 방에 접속하려 한다.
1. 크롬 소켓은 yun이라는 방안에 있다
2. 사파리 소켓이 yun이라는 방에 들어가려 한다.
3. 크롬 소켓과 사파리 소켓은 다른 소켓
4. server.js에서 `socket.on("enter_room",~` 이 부분의 코드는 두번 실행 되는 것이다
5. 사파리 소켓이 방에 접속하려 할때는 yun이라는 방이 존재하기 때문에, socket.to()는 welcome 이벤트를 방안의 모두에게 보낸다 
6. 크롬 에서만 웰컴이벤트로 받은 addMessage가 실행된다

## 6. room 알림 보내기

- `disconnecting`과 `disconnect`는 다름
    - `disconnecting`: 유저가 접속을 중단할 것이지만 아직 방을 나가지는 않은 상태
    - 위의 기능으로 클라이언트가 서버와 연결이 끊어지기 전에 굿바이 메시지를 보낼 수 있음
    - socket.rooms 기능으로 참여중인 room에 emit을 날림
```JS
socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room=>socket.to(room).emit("bye"));
    })
```

- 메시지 보내기(app.js)
```JS
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    socket.emit("new_message", input.value); //서버로 메시지를 보냄
}
function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const form = room.querySelector("form");
    form.addEventListener("submit", handleMessageSubmit);
}
```
- 보낸 메시지를 파악하기 위해 서버에게 함수를 보낸다
```JS
//app,js
function addMessage(message){
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    socket.emit("new_message", input.value,roomName,()=>{
        addMessage(`You:${input.value}`) //addMessage(`You:${input.value}`)???
    }); //서버로 메시지를 보냄
}

...

socket.on("new_message",(msg)=>{
    addMessage(msg); // 넘기는 값과 출력값이 같기에 addMessage 라고만 해도 된다
})

//server.js

 socket.on("new_message",(msg,room,done)=>{
        socket.to(room).emit("new_message", msg);
        done(); 
    });
```

- 메시지 보낼때 값 비우기 주의 : input.value="" 초기화 되기 때문에 addMessage에 value를 따로 빼줌
    - addMessage(`You:${input.value}`)
```JS
//app.js
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("input");
    const value = input.value;
    socket.emit("new_message", input.value,roomName,()=>{
        addMessage(`You:${value}`) 
    }); //서버로 메시지를 보냄
    input.value="";
}
```

## 7. 닉네임 생성

- 위에 했던 방식과 같이 form과 handleNicknameSubmit을 만들어주자(home.pug & app.js)
- server.js에서 소켓 객체에다 닉네임을 저장해주자
    - `socket.on("nickname",(nickname)=>socket["nickname"] = nickname)`
- 닉네임을 저장했다면 클라이언트에서 작동하는 welcome과 bye 이벤트를 바꿔주자
```JS
socket.on("welcome",(user)=>{
    addMessage(`${user} Joined!`);
})

socket.on("bye",(left)=>{
    addMessage(`${left} left :( `);
})

socket.on("new_message", addMessage);
```

=> 여기까진 처음 시작 유저 닉네임이 anonymous이다. 처음 시작에 룸 번호와 유저 닉네임을 같이 물어보고 시작하도록 하자(**수정필요**)
## 8. 룸 카운트

`Adapter`라는 개념을 이해해보자 

: `Adapter`는 다른 서버들 사이에 실시간 어플리케이션을 동기화 하는 것이다
- 지금은 서버의 메모리에서 어댑터를 사용하고 있다. 데이터베이스에 아무것도 저장되지 않음
- 룸, 메시지, 소켓 없어짐 : 재시작할때 다시 처음부터- > 백엔드에 데이터베이스를 가져야 함
- 모든 클라이언트에 connection을 열어둬야 하고 이 연결은 실시간으로 서버 메모리에 있어야 한다
-> 브라우저는 서버에 하나의 connection을 열지만, 이 브라우저는 다수이게 되고 : 서버에 많은 connection이 들어옴 (서버가 여러개이게 됨)
- 다수의 서버는 하나의 메모리풀을 공유해야함

=> 그래서 `Adapter`를 사용한다
: 모든 클라이언트가 동일한 서버에 연결되는 것이 아니기 때문에 다른 서버에 있는 클라이언트에게 접근하고 싶다면, 중간에 어댑터&데이터베이스를 거쳐야 한다.

로그로 확인해보자
- `io.sockets.adapter` : 현재 실행된 어댑터는 메모리에 있는 것이다
- `socket id(sids)`를 가져와서 방들을 보고 이 방들이 어떤 소켓을 위해 만들어졌는지 보고, private 메시지와, public 메시지를 생성해보자
- 서버에 있는 모든 room들을 살펴보자
    - 모든 socket은 private id를 가지고 있다
    - room id 가 sids중 하나라면 private room을 찾은것이고, sids중 하나가 아니라면 public room이라는 것임
- Map 데이터 구조를 살펴보자 (Map은 일종의 객체)
    - `set`으로 키-값을 저장하고 `get`으로 안에 값을 출력할 수 있다(쌍이 존재하는지도 확인할 수 있다)
```JS
const food = new Map();
food.set("pizza",10) -> Map(1) {"pizza" => 10}
food.get("pizza")// 10 
```

**server.js**
- 서버에 `function publicRooms`를 작성한다
```JS
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
```

클라이언트들에게 새로운 방이 만들어졌음을 알리자 
- `io.sockets.emit`을 사용한다 :  연결되어 있는 모든 소켓에게 알린다 (socket.emit x)
- `enter_room`, `disconnect` 이벤트에 이를 달아주자 (disconnecting 이벤트는 소켓이 방을 떠나기 직전에 실행된다)

- 클라이언트 `room_change` 이벤트: room 배열들을 받아 h4에 넣어줌

## 9. 유저 카운트

- `set`은 중복을 허용하지 않으며, `.size`를 이용하면 그 크기를 알 수 있다
```JS
//server.js
socket.on("enter_room",(roomName,done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName)); //카운트
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room=>
            socket.to(room).emit("bye",socket.nickname), countRoom(room)-1); //떠나기 직전이니 -1을 해줌
    });
```
```JS
//app.js

```
=> title 새로고침 function 만들기((**수정필요**)

## 10. 추가 기능
- 소켓을 가져와서 특정한 방에 넣을 수 있음
- private message 가능
- 방 (강제)퇴장, 방 바꾸기...

## 11. 백엔드 UI (**보너스 강의 메모하기**)

Admin UI가 있어서 socket, room, client... 볼수 있음

- `$npm i @socket.io/admin-ui`
- `const {instrument} = require("@socket.io/admin-ui")` server.js에 써주기

