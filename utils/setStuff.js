// add data to temp in model
module.exports = function(imgList, pos, temp, body, img, data1) {
    return new Promise(function (resolve, reject) {
        imgList[pos] = {
            album: body.album,
            image: img.toString('base64')
        }

        temp[data1] = {
            name: body.name,
            artist: body.artist,
            album: body.album,
            genre: body.genre,
            year: body.year,
            albumArt: { $type: "ref", value: ["imgList", pos, "image"] }
        };
        temp["length"]=(data1+1)
        console.log(temp);
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