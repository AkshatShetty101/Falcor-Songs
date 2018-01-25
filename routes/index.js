var express = require('express');
var router = express.Router();
var songs = require('../models/song')
var albumArt = require('../models/album_art')
var falcor = require('falcor')
/* GET home page. */
var model = new falcor.Model({cache:{
    genreList:{
       
    }
  }
});


router.get('/', async(req, res) => {
  test.find({},{name:1},function(err,data){
    console.log(data);
    var mod=[]
    for(var i=0;i<data.length;i++){
      mod.push({name: data[i].name});
    }
    console.log(mod);
    var dataSource = new falcor.Model({cache:{names:mod}});
    dataSource.get('names[0..].name')
    .then(function(data){
      console.log(JSON.stringify(data,null))
    });
  });
});

module.exports = router;
