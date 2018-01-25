exports.writeFile=function(req,res) {
    var Mongoose = require('mongoose').Mongoose;
    var gridfs = require('gridfs-stream');
    var config=require('../config');
    var mongooseGridFs=new Mongoose();
// var Schema = mongooseGridFs.Schema();
    var fs=require('fs');
    var path=require('path');
    mongooseGridFs.connect(config.mongoUrl);
    var conn = mongooseGridFs.connection;

    var videoPath = "D:\\Download\\"+req.files.name;
    console.log(videoPath);
    gridfs.mongo = mongooseGridFs.mongo;
    conn.once('open', function () {
        console.log("connection open for GridFs Upload!");
        var gfs = gridfs(conn.db);
        var writeStream = gfs.createWriteStream({
            filename: req.files.name
        });
        fs.createReadStream(videoPath).pipe(writeStream);
        writeStream.on('close', function (file) {
            console.log("Wrote file to DB: " + file.filename);
        });
    });
};

exports.readFile=function(req,res) {
    var Mongoose = require('mongoose').Mongoose;
    var gridfs = require('gridfs-stream');
    var config=require('../config');
    var mongooseGridFs=new Mongoose();
// var Schema = mongooseGridFs.Schema();
    var fs=require('fs');
    var path=require('path');
    mongooseGridFs.connect(config.mongoUrl);
    var conn = mongooseGridFs.connection;

    gridfs.mongo = mongooseGridFs.mongo;
    conn.on('error',console.error.bind(console,'connection error:'));
    mongooseGridFs.connection.once('open',function(err){
        if(err) throw err;
        console.log("connection open for GridFs Download!");
        var gfs = gridfs(conn.db);
        var writePath = fs.createWriteStream(req.params.fileTo);
        var readStream = gfs.createReadStream({
            filename : req.params.file
        });
        readStream.pipe(writePath);
        writePath.on('close',function(){
            console.log("Read file from DB");
        });
    });

};