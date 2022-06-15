const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`); //window.location.host로 현재 사용중인 위치(포트)를 가져올 수 있음

function makeMessage(type, payload){ //받은 입력값을 객체로 만들고 string으로 바꿈
    const m = {type, payload};
    return JSON.stringify(m); 
}
socket.addEventListener("open",()=>{
    console.log("Connected to Server :)");
});

socket.addEventListener("message",(m)=>{ //메시지를 받으면
    //console.log(`New message: ${m.data}`);
    const li=document.createElement("li");
    li.innerText=m.data;
    messageList.append(li);
});

socket.addEventListener("close",()=>{
    console.log("Disconnected to Server :(");
});
function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value)); //server로 보내기
    input.value=""; //입력하면 값비워주기
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value=""//입력하면 값비워주기
}
messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);
