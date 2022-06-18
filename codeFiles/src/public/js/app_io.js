const socket = io(); //socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const ul = room.querySelector("ul");

room.hidden = true;

let roomName;

function addMessage(message){
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value,roomName,()=>{
        addMessage(`You:${value}`);
    }); //서버로 메시지를 보냄
    input.value="";
}
function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname",input.value);
    input.value="";
}
function showRoom(){
    welcome.hidden=true;
    room.hidden=false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    const value = input.value;
    roomName = input.value;
    socket.emit("enter_room",value, showRoom); //showRoom 콜백임 ()=>{showRoom()}
    input.value="";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome",(user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${user} Joined!`);
})

socket.on("bye",(left, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${left} left :( `);
})

socket.on("new_message", addMessage);

socket.on("room_change", (rooms)=>{
    const roomList =  welcome.querySelector("ul");
    roomList.innerHTML=""; //매번 비워줌
    if(rooms.length===0){ //아무것도 없다면 종료
        return;
    }    
    
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
