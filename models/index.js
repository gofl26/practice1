const mongoose = require('mongoose');

const connect = () => {
    mongoose
        .connect('mongodb://localhost:27017/practice', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .catch((err) => {
            console.error(err);
        });
};

module.exports = connect;