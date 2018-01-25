var express = require('express');
var router = express.Router();
var songs = require('../models/song')
var albumArt = require('../models/album_art')
var falcor = require('falcor')
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
/* GET home page. */
var model = new falcor.Model({
  cache: {
    genreList: {

    }
  }
});


router.post('/addSong', function (request, response) {
  var body = request.body;
  var files = request.files;
  console.log(body);
  console.log(files);
  var img = {
    image: {
      name: files.img.name,
      data: files.img.data
    },
    album: body.album
  }
  albumArt.findOneAndUpdate({ album: body.album }, img, { new: true, upsert: true }, function (err, img_result) {
    if(err){
      response.json(err);
    }
    else
    {
      console.log(img_result._id);
      var data = {
        albumArt : img_result._id,
        name: body.name,
        artist: body.artist,
        album: body.album,
        genre: body.genre,
        yearOfRelease: body.year
      };
      songs.create(data, function (err, result) {
        if (err)
          response.json(err);
        else {
          files.song.mv('./static/songs/'+files.song.name, function(err) {
            if (err)
              return response.status(500).send(err);
            response.send('File uploaded!');
            console.log("done!");
          });
        }
      });
    
    }
    });

  // files.song.mv(function('./Songs/'))
});

router.get('/', async (req, res) => {
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

module.exports = router;
