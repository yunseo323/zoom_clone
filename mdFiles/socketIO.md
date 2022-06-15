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

유저가 채팅을 하고 싶다면, 채팅방에 들어오고 나갈 수 있게 room 개념을 만들어보자

