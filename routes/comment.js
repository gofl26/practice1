const express = require('express');
const Comments = require('../models/comment');
const Posts = require('../models/post');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

//상세페이지 조회API
router.get('/postDetail/:postId', async (req, res) => {
    const { postId } = req.params;
    console.log(postId);

    const post = await Posts.find({ _id: postId });
    if(!post) {
        res.status(403).send({
            errorMessage: '게시글이 존재하지않습니다.',
        });
        return;
    }
    const comment = await Comments.find({ postId: postId });
    const postCommentCnt = comment.length;

    res.json({
        post,
        comment,
        postCommentCnt,
    });
});

//후기 작성API
router.post('/commentPost/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    console.log(postId);

    const { user } = res.locals;
    let nickName = user.nickName;

    const today = new Date();
    const date = today.toLocaleString();
    const { contents } = req.body;
    if (!contents) {
        res.status(402).send({
            message: '내용을 입력하세요.',
        });
        return;
    }

    try {
        await Comments.create({
            nickName,
            postId,
            contents,
            date,
        });
        res.status(201).send({
            message: '후기 작성완료',
        });
    } catch (err) {
        res.status(401).send({
            errorMessage: '작성 실패',
        });
    }
});

//후기 삭제API 
router.delete('/commentDelete/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    console.log(commentId);

    try {
        const existsComments = await Comments.find({ _id: commentId });
        if (existsComments.length) {
            await Comments.deleteOne({ _id: commentId });
        }
        res.status(201).send({
            message: '후기 삭제완료',
        });
    } catch (err) {
        res.status(401).send({
            errorMessage: '삭제실패',
        });
    }
});

module.exports = router;
