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
var album_art = require('./models/album_art');
var async = require('async');
global.falcor = require('falcor');
global.model = new falcor.Model({
    cache: {
        temp: [],
        songList: [],
        imgList: []
    }
});
global.$ref = falcor.Model.ref;
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
app.use(bodyParser.urlencoded({ extended: false }));
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
    try {
        const res = await syncModel();
        console.log("Sync successful!")
        console.log(res);
    } catch (err) {
        console.log("Error:" + err);
    }
    finally {
        db.close(function () {
            console.log('Mongoose connection disconnected');
        });
    }
}

function syncModel() {
    return new Promise(function (resolve, reject) {
        var albums = {}
        songs.find({}, { _id: 1, name: 1, artist: 1, albumArt: 1, album: 1, yearOfRelease: 1, genre: 1 }).populate('albumArt').exec(function (err, result) {
            if (err) {
                reject(err)
            }
            else {
                // console.log(result);
                var songList = []
                var imgList = []
                async.each(result, function (val, callback) {
                    id = val._id;
                    img_id = val.albumArt._id
                    var flag = -1
                    console.log("--------------");
                    console.log(imgList);
                    console.log("--------------");
                    for (i = 0; i < imgList.length; i++) {
                        if (imgList[i].album.toString() == val.album) {
                            songList.push({
                                name:val.name,
                                artist:val.artist,
                                album:val.album,
                                albumArt: [$ref("imgList["+i+"]")]
                            });
                            flag=1;
                            break;
                        }
                    }
                    if(flag==-1){
                        imgList.push({
                            album:val.albumArt.album                            
                        });
                            songList.push({
                            name:val.name,
                            artist:val.artist,
                            album:val.album,
                            albumArt: [$ref("imgList["+(imgList.length-1)+"]")]
                        });
                    }
                        callback()
                    }, function(data) {
                        if (data) {
                            console.log("err:" + data);
                        }
                        else {
                            console.log(imgList);
                            model.set({ path: ["songList"], value: songList }, { path: ["imgList"], value: imgList }).then(function (value) {
                                console.log(JSON.stringify(value, null, 2));
                                model.get('songList').then(function (json) {
                                    resolve(JSON.stringify(json, null, 2));
                                });
                            });

                        }
                    });
            }
        });
    });

}

module.exports = app;
