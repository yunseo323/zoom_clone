const socket = io(); //socket.io를 실행하고 있는 서버를 찾음

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",{payload: input.value},(m)=>{
        console.log(`backend says : ${m}`);
    });
    input.value="";
}

form.addEventListener("submit", handleRoomSubmit);