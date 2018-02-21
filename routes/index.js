var path = require('path');
var express = require('express');
var router = express.Router();
var songs = require('../models/song');
var albumArt = require('../models/album_art');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/getModel', function (req, res) {
    model.get('songList').then(function (json) {
        console.log(json);
        res.send(json.json);
    });
});

router.post('/addSong', function (req, res) {
    mongoose.connect("mongodb://localhost:27017/FalcorSongs");
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection Error'));
    db.once('open', function () {
        console.log("Connection Established!");
    });
    var body = req.body;
    var files = req.files;
    console.log(body);
    console.log(files);
    var img = {
        image: {
            name: files.img.name,
            data: files.img.data
        },
        album: body.album
    };
    albumArt.findOneAndUpdate({ album: body.album }, img, { new:true, upsert: true }, function (err, img_result) {
        if (err) {
            res.json(err);
        }
        else {
            console.log("ID: "+img_result._id);
            var data = {
                albumArt: img_result,
                name: body.name,
                artist: body.artist,
                album: body.album,
                genre: body.genre,
                yearOfRelease: body.year
            };
            songs.create(data, function (err, result) {
                if (err) {
                    res.json(err);
                } else {
                    files.song.mv('./static/songs/' + body.name + ".mp3", function (err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        }
                        res.send('File uploaded!');
                        console.log("done!");
                    });
                }
            });

        }
    });
});


router.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

router.get('/load',function(req,res){
    model.get(['songList'],['imgList']).then(function (json) {
        console.log(JSON.stringify(json.json,null,2));
        res.json(json.json);
    });
});

module.exports = router;