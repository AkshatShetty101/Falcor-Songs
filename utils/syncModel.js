var songs = require('../models/song');

//sync helper
module.exports = function() {
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
