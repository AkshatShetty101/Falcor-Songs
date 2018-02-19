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
    albumArt.findOneAndUpdate({ album: body.album }, img, { new: true, upsert: true }, function (err, img_result) {
        if (err) {
            res.json(err);
        }
        else {
            console.log(img_result._id);
            var data = {
                albumArt: img_result._id,
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
                    files.song.mv('./public/songs/' + body.name + ".mp3", function (err) {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.send('File uploaded!');
                        console.log("done!");
                    });
                }
            });

        }
    });

    // files.song.mv(function('./Songs/'))
});

router.get('/sync',async(req,res)=>{
    sync();
    setInterval(sync, 600000);
    res.json("Done!");
});

router.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(path.join(__dirname, '../public', 'home.html'));

    // test.find({},{name:1},function(err,data){
    //   console.log(data);
    //   var mod=[]
    //   for(var i=0;i<data.length;i++){
    //     mod.push({name: data[i].name});
    //   }
    //   console.log(mod);
    //   var dataSource = new falcor.Model({cache:{names:mod}});
    //   dataSource.get('names[0..].name')
    //   .then(function(data){
    //     console.log(JSON.stringify(data,null))
    //   });
    // });
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

module.exports = router;