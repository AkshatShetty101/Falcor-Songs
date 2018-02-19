var express = require('express'),
    cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileupload = require('express-fileupload');
var mongoose = require('mongoose');
var songs = require('./models/song');

global.falcor = require('falcor');
global.model = new falcor.Model({
    cache: {
        temp: [],
        songList: []
    }
});

var app = express();
app.use(cors());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
sync();
setInterval(sync, 600000);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(fileupload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


async function sync() {
    
    mongoose.connect("mongodb://localhost:27017/FalcorSongs");
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection Error'));
    db.once('open', function () {
        console.log("Connection Established!");
    });
    //Do all sync required here!
    try{
        const res = await syncModel();
        console.log("Sync successful!")
        console.log(res);
    } catch(err){
        console.log("Error:"+err);
    }
    finally{
        db.close(function () {
            console.log('Mongoose connection disconnected');
        });    
    }
}

function syncModel(){
    return new Promise(function(resolve,reject){
        songs.find({}, { asd:1,_id: 0, name: 1, artist: 1, albumArt: 1, album: 1, yearOfRelease: 1, genre: 1 }, function (err, result) {
            if (err) {
                reject(err)
            }
            else {
                model.setValue('songList', result).then(function (value) {
                    model.get('songList[0]').then(function (json) {
                            resolve(JSON.stringify(json,null,2));
                    });
                });
            }
        });
    });

}

module.exports = app;
