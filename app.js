const express = require('express');
const connect = require('./models');
const cors = require("cors");
const app = express();
const port = 3000;

connect();

app.use(cors());

const postsRouter = require('./routes/post');
const usersRouter = require('./routes/user');
const commentsRouter = require('./routes/comment');

const requestMiddleware = (req, res, next) => {
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};
//프론트에서 오는 데이터들을 body에 넣어주는 역할
app.use(express.json());
app.use(requestMiddleware);

//form 형식으로 데이터를 받아오고 싶을 때(false->true)
app.use('/api', express.urlencoded({ extended: false }), postsRouter);
app.use('/user', express.urlencoded({ extended: false }), usersRouter);
app.use('/api', express.urlencoded({ extended: false }), commentsRouter);

app.listen(port, () => {
    console.log(port, '포트로 서버가 켜졌어요!');
});