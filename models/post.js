const mongoose = require('mongoose');

const postsSchema = mongoose.Schema({
    nickName: {
        type: String,
        required: true,
    },
    postTitle: {
        type: String,
        required: true,
    },
    postDesc: {
        type: String,
        required: true,
    },
    postImg: {
        type: Array,
        required: true,
    },
    postCharge: {
        type: String,
        required: true,
    },
    date: {
        type: String,
    },
    address: {
        type: String,
    },
    category: {
        type: Array,
    },
});

postsSchema.virtual('postId').get(function () {
    return this._id.toHexString();
});

postsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Posts', postsSchema);