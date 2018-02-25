var mongoose = require('mongoose');

// Sync model
module.exports = async function() {
	console.log("Starting DB sync at: ", new Date().toLocaleString());
    mongoose.connect("mongodb://localhost:27017/FalcorSongs");
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection Error'));
    db.once('open', function () {
        console.log("Connection Established!");
    });
    //Do all sync required here!
    try {
        const out = await require('./loadTemp')();
        if (out.source) {
            const out1 = await require('./emptyTemp')(out.source, out.d);
            console.log(out1);
        }
        else {
            console.log(out);
        }
        const res = await require('./syncModel')();
        console.log(res);
    } catch (err) {
        console.log("Error:" + err);
    }
    finally {
        db.close(function () {
            console.log('Mongoose connection disconnected!\nFinished Syncing at: '+ new Date().toLocaleString());
        });
    }
}