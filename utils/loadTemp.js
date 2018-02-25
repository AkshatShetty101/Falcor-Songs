// get temp data from model
module.exports = function() {
    return new Promise((resolve, reject) => {
        model.getValue(["temp", "length"]).then(function (data) {
            if (data > 0) {
                model.get(["temp", { from: 0, to: data }, "name"],
                    ["temp", { from: 0, to: data }, "album"],
                    ["temp", { from: 0, to: data }, "genre"],
                    ["temp", { from: 0, to: data }, "year"],
                    ["temp", { from: 0, to: data }, "artist"],
                    ["temp", { from: 0, to: data }, "albumArt", "image"],
                ).then(function (val) {
                    console.log(data);
                    // console.log(JSON.stringify(val, null, 4));
                    var source = val.json.temp;
                    return resolve({
                        source: source,
                        d: data
                    });
                });
            }
            else {
                return resolve("Temp list is empty");
            }
        });
    });
}
