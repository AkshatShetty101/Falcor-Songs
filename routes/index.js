var path = require('path');
var express = require('express');
var router = express.Router();
var songs = require('../models/song');
var albumArt = require('../models/album_art');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var async = require('async');

// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

router.get('/getModel', function (req, res) {
    model.get('songList').then(function (json) {
        console.log(json);
        res.send(json.json);
    });
});

router.post('/addSong', function (req, res) {
    // mongoose.connect("mongodb://localhost:27017/FalcorSongs");
    // var db = mongoose.connection;
    // db.on('error', console.error.bind(console, 'Connection Error'));
    // db.once('open', function () {
    //     console.log("Connection Established!");
    // });
    var body = req.body;
    var files = req.files;
    console.log(body);
    console.log(files);
    files.song.mv('./static/songs/' + body.name + ".mp3", function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        else{
            console.log("Song Uploaded!");
        }
    });
    var img = {
        image: {
            name: files.img.name,
            data: files.img.data.toString('base64')
        },
        album: body.album
    };
    model.getValue(["songList", "length"]).then(function (val) {
        console.log(val);
        model.get(["imgList", { from: 0, to: val }, "album"]).then(function (data) {
            console.log(JSON.stringify(data, null, 4));
            model.getValue(["temp", "length"]).then(function (data1) {
                console.log("location:"+data1);
                var temp = {};
                var imgList = {};
                var pos = -1;
                check(data, body.album)
                    .then(result => {
                        pos = result;
                        setStuff(imgList, result, temp, body, files.img.data, data1).then(function (data) {
                            res.json(data);
                        }).catch(function (data) {
                            res.status(200).json(data);
                        });
                    })
                    .catch(error => {
                        console.log("Caught:" + error);
                        setStuff(imgList, error, temp, body, files.img.data, data1).then(function (data) {
                            res.json(data);
                        }).catch(function (data) {
                            res.status(200).json(data);
                        });
                    });

            });
        });
    });
});

function setStuff(imgList, pos, temp, body, img, data1) {
    return new Promise(function (resolve, reject) {
        imgList[pos] = {
            album: body.album,
            image: img.toString('base64')
        }

        temp[data1] = {
            name: body.name,
            artist: body.artist,
            album: body.album,
            genre:body.genre,
            year:body.year,
            albumArt: { $type: "ref", value: ["imgList", pos, "image"] }
        };
        temp["length"]=(data1+1)
        console.log(temp);
        // model.set(["temp",data1,"albumArt"],temp.albumArt).then(function(jsonEnvelope){
        model.set({
            paths: [["temp","length"],
            ["imgList", pos, ["album", "image"]],
            ["temp", data1, ["name", "artist", "album","genre","year"]],
            ["temp", data1, ["albumArt"], ["imgList", pos, ["image"]]]
            ],
            jsonGraph: { temp, imgList }
        }).then(function (jsonEnvelope) {
            resolve("Added successfully");
            // console.log(JSON.stringify(jsonEnvelope, null, 2));
        })
            .catch(function (err) {
                reject("Failed!");
            });

    });
}

function check(data, al) {
    console.log("Here!" + al);
    return new Promise(function (resolve, reject) {
        console.log("Here!");
        var count = 0;
        console.log(data);
        for (var key in data.json.imgList) {
            var value = data.json.imgList[key];
            console.log(value);
            if (value.album) {
                console.log("Here!" + value.album);
                if (value.album == al)
                    resolve(count)
                count++;
            }
        }
        reject(count + 1);
    });

}

// albumArt.findOneAndUpdate({ album: body.album }, img, { new:true, upsert: true }, function (err, img_result) {
//     if (err) {
//         res.json(err);
//     }
//     else {
//         console.log("ID: "+img_result._id);
//         var data = {
//             albumArt: img_result,
//             name: body.name,
//             artist: body.artist,
//             album: body.album,
//             genre: body.genre,
//             yearOfRelease: body.year
//         };
//         songs.create(data, function (err, result) {
//             if (err) {
//                 res.json(err);
//             } else {
                
                //     res.send('File uploaded!');
                //     console.log("done!");
                //     db.close(function () {
                //         console.log('Mongoose connection disconnected');
                //     });                    
                // });
//             }
//         });
//     }
// });



router.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

router.get('/load', function (req, res) {
    model.get('songList').then(function (json) {
        console.log(JSON.stringify(json, null, 2));
        res.json(json);
    });
});

module.exports = router;