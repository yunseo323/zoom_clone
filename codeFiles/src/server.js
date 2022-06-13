import express from "express";

const app = express();

app.set("view engine", "pug"); 
app.set("views",__dirname + "/views"); //express에 template이 어디있는지 지정
app.use("/public", express.static(__dirname + "/public")); //static 설정, puplic url 생성해 유저에게 보여지는 파일
app.get("/",(req,res)=>res.render("home")); //home.pug render
app.get("/*",(req,res)=>res.redirect("/")); // 유저가 어떤 주소로 들어와도 home으로 redirect 설정

const handleListen=()=> console.log(`Listening on http://localhost:3000`);
app.listen(3000,handleListen);