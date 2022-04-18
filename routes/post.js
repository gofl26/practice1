const express = require('express');
const Posts = require('../models/post');
const Comments = require('../models/comment');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const upload = require('../S3/s3');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//호스트게시글 작성API
router.post(
    '/hostAdd',
    authMiddleware,
    upload.array('postImg',5),
    async (req, res) => {
        const today = new Date();
        const date = today.toLocaleString();
        const {
            postTitle,
            postDesc,
            postCharge,
            address,
            room,
            wifi,
            laundry,
            parkinglot,
        } = req.body;
        const postImg = [];
        for(let i =0;i<req.files.length;i++){
            postImg.push(req.files[i]?.location);
        }
        if (!postImg) {
            res.status(401).send({
                errMessage: '이미지는 필수입니다.',
            });
            return;
        }
        const { user } = res.locals;
        let nickName = user.nickName;
        const category =[];
        //category 안에 room,wifi,laundry,parkinglot
        category.push(room,
            wifi,
            laundry,
            parkinglot)
        await Posts.create({
            nickName,
            postTitle,
            postDesc,
            postCharge,
            address,
            date,
            postImg,
            category
        });

        res.status(201).send({
            message: '호스트등록!',
        });
    }
);

//호스트 게시글 수정API
router.post(
    '/hostUpdate/:postId',
    authMiddleware,
    upload.array('postImg',5), // image upload middleware
    async (req, res, next) => {
        const { postId } = req.params;
        const {
            postTitle,
            postDesc,
            postCharge,
            address,
            room,
            wifi,
            laundry,
            parkinglot,
        } = req.body;
        const o_id = new Object(postId);
        const today = new Date();
        const date = today.toLocaleString();
        const { user } = res.locals;
        let nickName = user.nickName;

        const category =[];
        //category 안에 room,wifi,laundry,parkinglot
        category.push(room,
            wifi,
            laundry,
            parkinglot)

        const [detail] = await Posts.find({ _id: o_id });
        const imagecheck = [];
        const deleteimage = [];
        for(let i=0;i<detail.postImg.length;i++){
            imagecheck.push(detail.postImg[i]);
            deleteimage.push(imagecheck[i].split('/')[3]);
        }

        const postImg = [];
        for(let i=0; i<req.files?.length;i++){
            postImg.push(req.files[i]?.location); // file.location에 저장된 객체imgURL
        } 

        if (!postImg) {
            return res.status(400).send({
                message: '이미지 파일을 추가해주세요.',
            });
        }

        
        try {
            for(let i =0; i<deleteimage.length; i++) {
                s3.deleteObject(
                    {
                        Bucket: 'practice2082',
                        Key: `${deleteimage[i]}`,
                    },
                    (err, data) => {
                        if (err) {
                            throw err;
                        }
                    }
                );
            }
            await Posts.updateOne(
                { _id: o_id },
                {
                    $set: {
                        postImg,
                        nickName,
                        postTitle,
                        postDesc,
                        postCharge,
                        address,
                        category,
                        date,
                    },
                }
            );

            res.status(200).send({
                message: '수정 완료',
            });
        } catch (err) {
            res.status(400).send({
                message: '수정 실패',
            });
        }
    }
);

//호스트 게시글 삭제API
router.delete('/postDelete/:postId', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const o_id = new Object(postId);
    const [detail] = await Posts.find({ _id: o_id });
    const imagecheck =[];
    const deleteimage = [];
    for(let i=0;i<detail.postImg.length;i++){
        imagecheck.push(detail.postImg[i]);
        deleteimage.push(imagecheck[i].split('/')[3]);
    }

    const existsPosts = await Posts.find({ _id: o_id });
    if (existsPosts.length) {
        await Posts.deleteOne({ _id: o_id });
    }
    const existsComments = await Comments.find({ postId: o_id });
    if (existsComments.length) {
        await Comments.deleteMany({ postId: o_id });
    }
    for(let i =0; i<deleteimage.length; i++) {
      s3.deleteObject(
          {
              Bucket: 'practice2082',
              Key: `${deleteimage[i]}`,
          },
          (err, data) => {
              if (err) {
                  throw err;
              }
          }
      );
  }
    res.status(200).send({
        message: '삭제 완료',
    });
});

//리스트 페이지(지도페이지)API
router.get('/listPage', async (req, res) => {
    const posts = await Posts.find();
    const posts1 = posts.reverse();
    res.json({
        post: posts1,
    });
});

module.exports = router;
