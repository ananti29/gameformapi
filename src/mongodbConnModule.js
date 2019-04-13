var mongoose = require('mongoose');

// mongodb connection mlab
// mongodb old url parser is deprecated using new one
module.exports.connect = function () {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://adminana:aNlocaL1@ds135786.mlab.com:35786/gameform', { useNewUrlParser: true });
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'DB connection error'));
    db.once('open', function (callback) {
        console.log('DB Connection Succeeded');
    });
    return db;
};
