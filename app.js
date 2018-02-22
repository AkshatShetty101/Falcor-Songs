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
var falcorExpress = require('falcor-express');

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
setInterval(sync, 20000);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(fileupload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
    return model.asDataSource();
}));

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
        const out = await loadtemp();
        if (out.source) {
            const out1 = await emptyTemp(out.source, out.d);
            console.log(out1);
        }
        else {
            console.log(out);
        }
        const res = await syncModel();
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

function loadtemp() {
    return new Promise((resolve, reject) => {
        model.getValue(["temp", "length"]).then(function (data) {
            if (data > 0) {
                model.get(["temp", { from: 0, to: data }, "name"],
                    ["temp", { from: 0, to: data }, "album"],
                    ["temp", { from: 0, to: data }, "genre"],
                    ["temp", { from: 0, to: data }, "year"],
                    ["temp", { from: 0, to: data }, "artist"],
                    ["temp", { from: 0, to: data }, "albumArt", "image"],
                ).then(function (val) {
                    console.log(data);
                    // console.log(JSON.stringify(val, null, 4));
                    var source = val.json.temp;
                    return resolve({
                        source: source,
                        d: data
                    });
                    // console.log(JSON.stringify(source[i].album, null, 2));
                    // var i = 0
                    // emptyTemp(source, data).then(function (data) {
                    //     console.log(data);
                    //     console.log("done!");
                    // for (; i < data;) {
                    //         emptyTemp(source, i)
                    //         .then(function(data){
                    //             i++;
                    //         })
                    //         .catch(function(err){
                    //         return reject(err);
                    //     });
                    // }
                    // console.log(i);
                    // if(i==data){
                    // }
                    // async () => {
                    //     console.log("In!!");
                    //     try {
                    //         var x = emptyTemp(source, data)
                    //         console.log(x);
                    //         resolve("loaded temp list");
                    //     } catch (err) {
                    //         console.log(err);
                    //     }
                    // };
                    //     emptyTemp(source, data)
                    //     .then(function(x){
                    //         console.log(x);

                    //     })
                    //     .catch (function(err) {
                    //     reject(err);
                    // });

                });
            }
            else {
                return resolve("Temp list is empty");
            }
        });
    });
}

function emptyTemp(source, d) {
    console.log('reached!' + d);
    return new Promise(function (resolve, reject) {
        console.log('reached!' + d);
        for (var i = 0; i < d; i++) {
            img = {
                album: source[i].album,
                image: {
                    name: source[i].name,
                    data: source[i].albumArt.toString()
                }
            }
            var data = {
                name: source[i].name,
                artist: source[i].artist,
                album: source[i].album,
                genre: source[i].genre,
                yearOfRelease: source[i].year
            };
            album_art.findOneAndUpdate({ album: source[i].album }, img, { new: true, upsert: true }, function (err, img_result) {
                if (err) {
                    reject(err);
                }
                else {
                    data["albumArt"] = img_result._id;
                    console.log("ID: " + img_result._id);
                    songs.create(data, function (err, result) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            console.log(data.name);
                        }
                    });
                }
            });
        }
        temp = [];
        model.setValue(["temp"], temp).then(function (res) {
            console.log(JSON.stringify(res, null, 2));
            return resolve("Emptied temp");
        });
        // model.set({
        //     paths: [["temp"]],
        //     jsonGraph: { temp }
        // })
    });
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
                    // console.log("--------------");
                    // console.log(imgList);
                    // console.log("--------------");
                    for (i = 0; i < imgList.length; i++) {
                        if (imgList[i].album.toString() == val.album) {
                            songList.push({
                                name: val.name,
                                artist: val.artist,
                                album: val.album,
                                genre: val.genre,
                                year: val.yearOfRelease,
                                albumArt: { $type: "ref", value: ["imgList", i, "image"] }
                            });
                            flag = 1;
                            break;
                        }
                    }
                    if (flag == -1) {
                        imgList.push({
                            album: val.albumArt.album,
                            image: val.albumArt.image.data
                        });
                        songList.push({
                            name: val.name,
                            artist: val.artist,
                            album: val.album,
                            genre: val.genre,
                            year: val.yearOfRelease,
                            albumArt: { $type: "ref", value: ["imgList", (imgList.length - 1), "image"] }
                        });
                    }
                    callback()
                }, function (data) {
                    if (data) {
                        console.log("err:" + data);
                    }
                    else {
                        songList.push({ length: songList.length - 1 });
                        // console.log(JSON.stringify(songList, null, 2));
                        model.set({
                            paths: [["imgList", { from: 0, to: imgList.length }, ["album", "image"]],
                            ["songList", "length"],
                            ["songList", { from: 0, to: songList.length }, ["name", "artist", "album", "genre", "year"]],
                            ["songList", { from: 0, to: songList.length }, ["albumArt"], ["imgList", { from: 0, to: imgList.length }, ["image"]]]
                            ], jsonGraph: { imgList, songList }
                        }).then(function (value) {
                            resolve("Sync successful");
                        });
                    }
                });
            }
        });
    });

}

module.exports = app;
