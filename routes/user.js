const express = require('express');
const User = require('../models/user');
const router = express.Router();
const upload = require('../S3/s3');
const jwt = require('jsonwebtoken');

//token key 보안처리
const fs = require('fs');
const mykey = fs.readFileSync(__dirname + '/../middlewares/key.txt').toString();

//<----회원가입API---->
router.post('/signUp', upload.single('userProfile'), async (req, res) => {
    const { email, nickName, password } = req.body;

    const regexr2 = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    const regexr = /^[a-zA-Z0-9_\-.]{3,10}$/;
    const regexr1 =
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
    if (!regexr2.test(email)) {
        return res.status(403).send('이메일 형식이 아닙니다.');
    } else if (!regexr.test(nickName)) {
        return res.status(403).send('닉네임은 3자리 이상 10자리이하 입니다.');
    } else if (!regexr1.test(password)) {
        return res
            .status(403)
            .send(
                '최소 8자 이상으로 영문자 대문자, 영문자 소문자, 숫자, 특수문자가 각각 최소 1개 이상'
            );
    }

    let userProfile = req.file?.location;
    if (!userProfile) {
        userProfile =
            'https://practice2082.s3.ap-northeast-2.amazonaws.com/%EA%B8%B0%EC%98%81%EC%9D%B4.jpg';
    }
    const existUsers = await User.find({
        $or: [{ email }, { nickName }], //mongodb문법
    });

    if (existUsers.length) {
        res.status(400).send({
            errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
        });
        return;
    }

    await User.create({
        email,
        nickName,
        password,
        userProfile,
    });

    res.status(201).send({
        message: '가입완료',
    });
});

//로그인 API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    const user = await User.findOne({ email, password }).exec();

    if (!user) {
        res.status(400).send({
            errorMessage: '아이디 또는 패스워드를 확인해주세요',
        });
        return;
    }
    const token = jwt.sign(
        { email: user.email, nickName: user.nickName },
        mykey
    );
    res.send({
        token,
    });
});

module.exports = router;
