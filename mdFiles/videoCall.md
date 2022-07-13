# VideoCall

socket.IO를 사용해서 video call 기능을 구현해보자

## 1. 유저 비디오

유저(웹브라우저)로부터 비디오를 가져오는 세팅을 해보자

- 유저로부터 비디오를 가져와 화면에 비디오를 띄운다
- 마이크 음소거/음소거 해제, 카메라 끄기/켜기 버튼 만든다
- 전면 후면 카메라 전환

**home.pug**
video에 `autoplay`(자동재생), `playsinline`이라는 프로퍼티를 준다

`video#myFace(autoplay,playsinline, width="400", height="400")`

- `playsinline`: 모바일 브라우저가 필요로 하는 프로퍼티임 -> 비디오가 전체화면이 되지 않으면서, 웹사이트에서만 비디오가 실행됨
- mute, camera 버튼 만들기

**app.js**
- `getMedia` function: stream
- `stream`: 비디오와 오디오가 결합된 것
    - stream을 유저로부터 받아야 함
    - `getMedia` function: stream 가져오기 -> async로 작동
    - `getUserMedia` function 사용 : 유저의 카메라와 오디오를 가져옴
```JS
async function getMedia(){
     try{
         myStream = await navigator.mediaDevices.getUserMedia({
             audio: true,
             video: true,
         })
         myFace.srcObject = myStream;
     }catch(e){
         console.log(e);
     }
 }
```
- html에 이 stream을 넣어주자: `myFace.srcObject = myStream;`
- 음소거/음소거 해제 버튼 만들기
    - handle function을 만들어준다
    - mute와 camera 작동을 추적할 variable 필요함
    - variable: muted, cameraOff


## 2. mute, camera 작동

`stream`은 `track`이라는 걸 제공해준다. 코드에서 이 track에 접근할 수 있다 (오디오, 자막 등등이 하나의 track)

- 토글 기능을 만드는 법 (handleMuteClick, handleCameraClick)
```JS
myStream
    .getAudioTracks()
    .forEach((track)=> { track.enabled = !track.enabled  //!으로 바꿈
    });
```
- 유저가 가지고 있는 카메라들의 목록을 구하자
    - `enumerateDevices`: (컴퓨터나 모바일에 연결되어 있는) 모든 장치와 미디어 장치를 알려줌
- `getCameras` function을 만들자
    - getCameras는 `navigator.mediaDevices.enumerateDevices`를 호출함 : 기기의 내장된 장치를 전부 확인할 수 있다
    - 이 array 에서 video input(카매라)만 선택
- html에 카메라를 선택할 수 있게끔 option을 달아주자
- 장비의 id를 식별하는 것이 중요 -> select로 카메라를 변경했을 때 선택된 id를 가져오고 stream에서 장비를 변경할 것임

## 3. 카메라 switch

위에서 유저가 가지고 있는 카메라들의 목록을 띄우는 것을 완료했다! 이제 카메라 변경이 이루어지면 그에 맞게 stream을 강제로 재실행해야 한다.

- device id를 알아야 비디오(stream)을 강제로 재실행할 수 있음
- 비디오를 다시 시작하게 하려면 `getMedia()`를 다시 실행하게 하면됨
    - 특정 브라우저에서 특정 카메라를 사용하도록 지시해야함


## 4. WebRTC


## 5. Room 생성

## IceCandidate

## Senders

## STUN



