var path = require('path');
var express = require('express');
var router = express.Router();
var songs = require('../models/song');
var albumArt = require('../models/album_art');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var async = require('async');

router.get('/getModel', function (req, res) {
    model.get('songList').then(function (json) {
        console.log(json);
        res.send(json.json);
    });
});

router.route('/addSong')
    .get(function(req, res) {
        res.sendFile(path.join(__dirname, '..', 'public', 'addSong.html'));
    })
    .post(function (req, res) {
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
                require('../utils/check')(data, body.album)
                    .then(result => {
                        pos = result;
                        require('../utils/setStuff')(imgList, result, temp, body, files.img.data, data1).then(function (data) {
                            res.json(data);
                        }).catch(function (data) {
                            res.status(200).json(data);
                        });
                    })
                    .catch(error => {
                        console.log("Caught:" + error);
                        require('../utils/setStuff')(imgList, error, temp, body, files.img.data, data1).then(function (data) {
                            res.json(data);
                        }).catch(function (data) {
                            res.status(200).json(data);
                        });
                    });

            });
        });
    });
});

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