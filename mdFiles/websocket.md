# WebSocket

실시간 기능 구현(chat, notification..)을 가능하게 해주는 웹소켓은 프로토콜이다.

## 1. HTTP vs WebSocket

HTTP와 Websocket은 모두 프로토콜이다.

**HTTP**
- user가 request 보내면, 서버가 response로 반응
- `stateless` : 서버는 유저를 기억하지 못함, 다음 request를 기다릴 뿐
- 그래서 cookie를 보내야 함
- 이 과정은 real-time으로 일어나지 않음 & `단방향`임(유저->서버한테 request를 보냄, request가 없는데 response가 먼저 발생되는 경우는 없다)

**WebSocket**
- https://~ 처럼 웹소켓으로 통신하고 싶은 경우 `wss://`로 접속하면 됨
- WSS:web socket secure(보안됨), WS:web socket
- 웹소켓 연결은 악수처럼 작동함: 브라우저(유저)가 서버로 리퀘스트 보내면 서버가 받거나 거절함, 악수가 한번 성립되면 연결은 성립. 유저와 서버가 서로 연결되어 있기 때문에 `서버는 유저를 기억`함.
- 위처럼 연결이 성립된다면, `양방향 연결`(유저->서버 request 가 선행되지 않아도, 서버->유저에게 메시지를 보낼 수 있음)이 이루어짐
- 통신에 request, response 과정이 필요없음
- js에서도 사용할 수 있음(프로토콜이기 때문에 언어에 제한되지 않음) 또 서버와 서버 사이에서도 작동할 수 있고, 브라우저에는 내장 웹소켓 api가 있음

## 2. 노드JS에서 WebSocket 사용하기

`ws` 패키지 사용: 노드 JS 웹소켓 라이브러리 

- 웹소켓 프로토콜을 `실행`하는 패키지
- ws는 노드 JS 웹소켓 환경의 코어이자 기초적인 것임. 그래서 부가적인 기능이 없고 아주 기본적인 기능만 있음
- ws를 이용한 프레임워크가 있고, 이 프레임워크에 채팅방 기능이 있음

그래도 기본적인 ws를 이해하고 프레임워크로 넘어가도록 하자!

1. ws 서버를 두지 않고 express(http 프로토콜을 다룸)와 합치도록 하자
2. express는 기본적으로 ws를 지원하지 않기 때문에 function을 추가하자
3. 노드JS에 내장되어있는 http package를 사용하자 `import http from "http"`
    - createServer를 하려면 requestListener 경로가 있어야 한다(express application)
    - `const server = http.createServer(app)` : express에서 ws를 사용하려 할때 꼭 작성해야하는 핵심적인 부분이다. 이 server 에서 웹소켓을 만들 수 있게 되었다
    - app.listen 하기 전, 서버에 접근하지 못했는데, 위 코드를 작성함으로 서버에 접근할 수 있게 되었다
4. `import WebSocket from "ws"` 웹소켓 import
    - `const wss = new WebSocket.Server({server})`
    - 위에서 생성한 server를 전달해준다. 필수 사항은 아니지만, 이처럼 했을때 http, websocket 서버를 둘다 돌릴 수 있다
    - http 서버 위에 웹소켓 서버를 만들었다는걸 이해하자

*=> 다시 강조하지만, 이렇게 코드를 구성하는 것은 같은 서버(같은 포트)에서 http와 ws를 모두 작동시키기 위해서이다.*

5. http 서버가 필요한 이유는 views, static files, home, redirection 등등을 가져와야 하기 때문이다
    

## 3. WebSocket 이벤트

 ws를 이용해서 프론트(브라우저, 유저)와 서버 사이의 연결을 만들자 => 메시지 주고받기

- 프론트에서 브라우저는 이미 웹소켓에 대한 실행(implementation) 능력을 가지고 있다. (서버와 연결할 수 있고, 어떤 설치도 필요하지 않음)
- 백에서의 웹소켓
     - 웹소켓에도 이벤트가 있고 이벤트가 발생할 때 사용한 function을 만들어주자 (존재하지 않는 이벤트명을 적지 않도록 주의)
     - 웹소켓에는 listen 할 특정한 이벤트명이 있다 
     - ws에서 추가적인 정보를 받아야 하는 function도 존재


**WebSocket의 이벤트**

- `wss.on()` 으로 event와 function(event가 발생할 때 호출)을 받는다
- `connection` 이벤트: 연결이 일어날때 실행할 함수를 같이 적어줌 (함수를 넘겨도 되고, 콜백 함수를 써줘도 됨)
    - on(event: "connection", cb: (this: WebSocket.Server<WebSocket.WebSocket>, `socket`: WebSocket.WebSocket, request: http.IncomingMessage) => void): WebSocket.Server<WebSocket.WebSocket>
    - 여기서의 `socket`은 (서버와) 연결된 브라우저의 연락 라인임. 소켓을 이용해서 메세지를 주고 받을 수 있고, 이를 저장해야함
    - `on()`은 `socket`에서 오는 백엔드에 연결된 사람의 정보를 제공해준다
- 소켓을 프론트에서 확인할 수 있게 백과 연결해보자
    - app.js 파일에 `const socket = new WebSocket(url)` 작성 -> 이때 ws(or wss) 프로토콜을 가지는 url
    - url: `ws://${window.location.host}` -> window.location.host로 현재 사용중인 위치(포트)를 가져올 수 있음
- server.js에서의 handleConnection으로 다루고 있는 socket은 frontend와 real-time으로 소통할 수 있고, 마찬가지로 app.js에서 불러온 socket으로도 backend와 소통할 수 있다
- socket 명칭이 같기 때문에 파일명을 주의깊게 봐야 한다. server.js의 socket은 연결된 브라우저를 의미하고, app.js의 socket은 연결된 서버를 의미한다

## 4. Websocket에서 메시지 보내기

**server.js**
- socket 안의 메서드를 이용한다 (웹소켓 서버에 있는 것 아님!)
    - `send()` : 데이터 보냄(server->brower)
    - `on("close")` : 브라우저와 연결이 끊겼을 때
    - `on("message")` : 브라우저에서 메세지 받은걸 다룸 (browser->server)


**app.js**
- `socket.addEventListener` 메서드 활용
    - `open` : 서버에 연결되었을 때 
    - `close` : 서버와 연결이 끊겼을 때
    - `message` : 서버에서 메시지가 왔을 때
- `socket.send` : 서버로 데이터 보냄 (browser->server)

=> 서버와 브라우저 창을 키고 끄면서 실시간으로 통신 로그가 찍히는 것을 확인하자
## 5. 채팅 생성

프론트단(home.pug) 만들기: 버튼, 메시지 리스트...


**app.js**
- home.pug에 form을 생성한 뒤 querySelector로 접근함
- form 의 input에서 .value(곧 작성한 메시지)를 send함

**server.js**
- 브라우저에서 입력받은 value 값을 다시 브라우저로 보내주면 브라우저에서 콘솔 값이 찍히는 것을 확인할 수 있다

=> 이 단계까지는 `브라우저1<->서버` ,`브라우저2<->서버` 로 양방향 연결이 되었지만, `브라우저1<->브라우저2`는 서로 메시지를 주고받을 수 없다

=> `브라우저1<->서버<->브라우저2`의 연결을 만들어보자 : 연결된 브라우저의 식별이 필요하다

=> fake database를 만들자
- 브라우저가 서버에 연결하면 그 connection을 `sockets 배열`에 넣자
- sockets 배열에 forEach로 전달받은 메시지를 모두 뿌려주고, 브라우저 두개를 띄우고 그 결과를 확인해 보자
```JS
const sockets = [];
wss.on("connection",(socket)=>{ //연결 이벤트를 들음
    sockets.push(socket);
    console.log("Connected to User :)");
    socket.on("close",()=>console.log("Disconnected from the Browser"));
    socket.on("message",(m)=>{
        sockets.forEach((aS)=>aS.send(m.toString('utf8'))); // 전달받은 메시지를 각 브라우저에게 모두 보냄
    })
    socket.send("hello");
}); 
```
