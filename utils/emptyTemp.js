var album_art = require('../models/album_art');
var songs = require('../models/song');

// move temp data to songsList in model and add to db
module.exports = function(source, d) {
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
