# 세팅 메모

## 1. 서버 세팅

- `$npm init` (package.json 수정)
- `$npm i nodemon -D`
- `babel.config.json`, `nodemon.json` 파일 생성하기
    - nodemon.json에 exec 키 하나 있는데, src/server.js에 대해 babel-node 명령문을 실행시킨다 (서버를 재시작하는 대신에 babel-node 실행, babel 작업을 src/server.js에 해줌)
    - babel-node는 babel.config.json을 읽고 코드에 적용되어야 하는 preset을 실행시킴
- `src 폴더` 생성 -> `server.js` 파일 생성
- 바벨 설정: `$npm i @babel/preset-env @babel/core @babel/cli @babel/node -D`
- nodemon 설정
- `$npm i express`
- `$npm i pug`
- `server.js` 에 express import
- `npm run dev` 확인

## 2. 프론트 세팅

정적 파일, 유저에게 보낼 파일 생성

- src/views 폴더 안에 pug 파일 생성
- pug 설정(server.js, express 설정)
- static 작업
    - home.pug 파일에 `script (src="/public/js/app.js")` 추가
    - server.js 에서 express.static 설정 : 유저가 /public으로 가면 __dirname+ "/public" 폴더를 보여줌
- nodemon이 프론트 코드(public/js/app.js)가 변경될 때가 아닌, view와 서버 수정 시에만 재시작 되게 설정하기 : nodemon.json에 ignore 달아주고 서버 재시작해서 확인해보기
- MVP css 사용 -> 본격적인 css 적용 이전에 적용해놓기 좋다
- 보안을 위해 유저가 볼 수 있는 폴더를 따로 지정하는 것이 public 폴더
=> public 폴더: frontend, server.js: backend
